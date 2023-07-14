import type { IHeftTaskSession } from '@rushstack/heft';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { readFile, stat } from 'fs/promises';
import { extname, isAbsolute, relative, resolve } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { inspect } from 'util';
import { ImportKind, OnLoadResult, OnResolveResult, Plugin, PluginBuild } from 'esbuild';
import { compileAsync, CompileResult, compileStringAsync, Logger } from 'sass';

interface ICacheItem {
	mtime: number;
	response: OnLoadResult;
	className: string;
	css: string;
}

const nameCache: Record<string, string> = {};
function createUniqueName(rootPath: string, filename: string) {
	if (!nameCache[filename]) {
		let name = relative(rootPath, filename);
		name = name.slice(0, name.length - extname(name).length);
		name = name.replace(/[^_0-9a-z]+/gi, '_');
		name = name.replace(/^_+|_+$/, '');
		nameCache[filename] = name;
	}
	return nameCache[filename]!;
}

interface IOptions {
	readonly sourceRoot?: string;
	readonly outputFile?: string;
}

const scriptUsage: ImportKind[] = ['import-statement', 'require-call', 'dynamic-import', 'require-resolve'];

function base64(txt: string) {
	return Buffer.from(txt, 'utf-8').toString('base64');
}

export function ScssCombinePlugin(session: IHeftTaskSession, options: IOptions): Plugin {
	const logger: Logger = {
		debug(message, options) {
			if (options.span.url) {
				message += ` (${fileURLToPath(options.span.url)}:${options.span.start.line}:${
					options.span.start.column
				})`;
			}
			session.logger.terminal.writeDebugLine(message);
		},
		warn(message, options) {
			if (options.span?.url) {
				message += ` (${fileURLToPath(options.span.url)}:${options.span.start.line}:${
					options.span.start.column
				})`;
			}

			const e = new Error(message);
			e.stack = options.stack || e.message;

			session.logger.emitError(e);
		},
	};

	let sourceRoot = '.';
	if (options.sourceRoot) {
		if (isAbsolute(options.sourceRoot)) throw new Error('SCSS plugin require sourceRoot must NOT absolute');

		sourceRoot = options.sourceRoot;
	}

	return {
		get name() {
			return 'scss';
		},
		setup(build: PluginBuild) {
			const rootDir = build.initialOptions.absWorkingDir!;
			if (!rootDir) {
				throw new Error('scss plugin require esbuild option "absWorkingDir" to be set.');
			}
			const srcDir = resolve(rootDir, sourceRoot);
			if (!existsSync(srcDir)) {
				throw new Error('source root dir is not exists: ' + srcDir);
			}
			const outputDir = build.initialOptions.outdir!;
			if (!outputDir) {
				throw new Error('scss plugin require esbuild option "outputDir" to be set.');
			}

			session.logger.terminal.writeDebugLine(`scss: root=${rootDir}`);
			session.logger.terminal.writeDebugLine(`scss: src =${srcDir}`);

			const responseCache = new Map<string, ICacheItem>();
			const locationCache = new Map<string, OnResolveResult>();
			const registry = new Map<string, string>();

			build.onStart(() => {
				registry.clear();
			});

			build.onResolve({ filter: /\.scss$/ }, (args) => {
				if (args.namespace !== 'file') return;

				const path = resolve(args.resolveDir, args.path);

				if (!scriptUsage.includes(args.kind)) {
					return { path: path, sideEffects: false, pluginData: { asStyle: true } };
				}

				if (locationCache.has(path)) {
					return locationCache.get(path);
				}

				session.logger.terminal.writeDebugLine(`try location: ${path}`);
				if (existsSync(path)) {
					locationCache.set(path, { path, sideEffects: false });
				} else if (existsSync(`${args.importer}.map`)) {
					const smap = JSON.parse(readFileSync(`${args.importer}.map`, 'utf-8'));
					const s: string = smap.sources?.[0];
					if (s) {
						const srcPath = resolve(args.importer, '..', s, '..', args.path);
						session.logger.terminal.writeDebugLine('try location: ' + srcPath);
						if (existsSync(srcPath)) {
							// native filesystem path
							locationCache.set(path, { path: srcPath, sideEffects: false });
						} else {
							// has sourceRoot (baseUrl)
							const srcPath2 = resolve(srcDir, s, '..', args.path);
							session.logger.terminal.writeDebugLine('try location: ' + srcPath2);
							if (existsSync(srcPath2)) {
								locationCache.set(path, { path: srcPath2, sideEffects: false });
							}
						}
					} else {
						session.logger.terminal.writeDebugLine(`missing source in map: ${path}.map`);
					}
				}

				return locationCache.get(path);
			});

			function inlineSourceMap(result: CompileResult, entryStyle: boolean) {
				const sm = { ...result.sourceMap };

				sm.sourceRoot = build.initialOptions.sourceRoot || '';
				sm.sources = sm.sources?.map((file) => {
					return relative(entryStyle ? srcDir : rootDir, fileURLToPath(file));
				});

				const smTxt = JSON.stringify(sm);

				let output = result.css + '\n\n/*' + smTxt + '*/\n\n';
				output += '/*# sourceMappingURL=data:application/json;charset=utf-8;base64,';
				output += base64(smTxt);
				output += ' */\n';

				return output;
			}

			async function compileStyle(path: string) {
				//  todo: cache
				const result = await compileAsync(path, {
					charset: false,
					loadPaths: [srcDir],
					logger: logger,
					style: 'expanded',
					sourceMap: true,
				});

				const output = inlineSourceMap(result, true);

				const response: OnLoadResult = {
					loader: 'css',
					contents: output,
					watchFiles: flattenResultLoaded(result),
				};

				return response;
			}

			function flattenResultLoaded(result: CompileResult) {
				return result.loadedUrls
					.filter((e) => e.protocol === 'file:')
					.map((e) => {
						return fileURLToPath(e.toString());
					});
			}

			async function compileModule(styleFile: string) {
				const st = await stat(styleFile);
				if (responseCache.has(styleFile)) {
					const r = responseCache.get(styleFile)!;
					if (st.mtime.getTime() === r.mtime) {
						session.logger.terminal.writeDebugLine(`use cache: ${styleFile} (${r.className})`);
						registry.set(relative(rootDir, styleFile), r.css);
						return r.response;
					}
				}

				const className = createUniqueName(srcDir, styleFile);
				const data = await readFile(styleFile, 'utf-8');

				const lines = data.replace(/::container/, '&').split('\n');
				const lastId = lines.findIndex((l) => {
					return l.trim() && !l.startsWith('@use') && !l.startsWith('$') && !l.startsWith('/');
				});
				lines.splice(lastId, 0, '.' + className + '{');
				lines.push('}');

				const result = await compileStringAsync(lines.join('\n'), {
					charset: false,
					loadPaths: [srcDir],
					logger: logger,
					style: 'expanded',
					sourceMap: true,
					sourceMapIncludeSources: true,
					url: new URL(pathToFileURL(styleFile)),
				});

				const response: OnLoadResult = {
					loader: 'js',
					contents: `export const className = ${JSON.stringify(className)};
				export const styleText = ${JSON.stringify(result.css)};`,
					watchFiles: flattenResultLoaded(result),
				};

				session.logger.terminal.writeDebugLine(`compiled: ${styleFile} (${className})`);
				registry.set(relative(rootDir, styleFile), inlineSourceMap(result, false));
				responseCache.set(styleFile, { response, mtime: st.mtime.getTime(), css: result.css, className });
				return response;
			}

			build.onLoad({ filter: /\.scss$/ }, (args) => {
				if (args.namespace !== 'file') return;

				if (args.pluginData?.asStyle) {
					return compileStyle(args.path);
				} else {
					return compileModule(args.path);
				}
			});

			build.onEnd((result) => {
				if (result.errors.length > 0) return;
				if (registry.size === 0) return;

				// todo: 应该根据每个entryPoint收集对应css信息，而不是用一个全局registry，也不应该存在outputFile
				let output;
				if (options.outputFile) {
					output = options.outputFile;
				} else if (result.metafile) {
					for (const [file, def] of Object.entries(result.metafile.outputs)) {
						if (def.entryPoint) {
							output = file.slice(0, file.length - extname(file).length) + '.combined.css';
							break;
						}
					}

					if (!output) {
						session.logger.terminal.writeLine(inspect(result.metafile));
						throw new Error('can not detect output path from metafile, please set options.outputFile.');
					}
				} else {
					throw new Error('metafile or options.outputFile is required');
				}

				let res = '';
				for (const [file, css] of registry.entries()) {
					res += `/* source file: ${file} */\n${css}\n\n`;
				}

				const outAbs = resolve(rootDir, output);
				writeFileSync(outAbs, res, 'utf-8');

				session.logger.terminal.writeLine(`output css file: ${outAbs}`);
			});
		},
	};
}
