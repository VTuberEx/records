import { existsSync, readFileSync, writeFileSync } from 'fs';
import { basename, extname, isAbsolute, relative, resolve } from 'path';
import type { IHeftTaskSession } from '@rushstack/heft';
import ConcatWithSourceMap from 'concat-with-sourcemaps';
import type { ImportKind, OnLoadResult, OnResolveArgs, OnResolveResult, Plugin, PluginBuild } from 'esbuild';
import { IScssCompilerOptions, IScssModuleCompileResult, MyScssCompiler } from './compiler';
import { shimLogger } from './tools/logger';
import { fixSourceMap } from './tools/sourcemap';

interface IOptions extends Partial<IScssCompilerOptions> {}

const scriptUsage: ImportKind[] = ['import-statement', 'require-call', 'dynamic-import', 'require-resolve'];

export function ScssCombinePlugin(session: IHeftTaskSession, options: IOptions): Plugin {
	if (options.sourceRoot) {
		if (isAbsolute(options.sourceRoot)) throw new Error('SCSS plugin require sourceRoot must NOT absolute');
	}

	const filledOptions = {
		sourceRoot: '.',
		...options,
	};

	return {
		get name() {
			return 'scss';
		},
		setup(build: PluginBuild) {
			const rootDir = build.initialOptions.absWorkingDir;
			session.logger.terminal.writeDebugLine(`scss: root=${rootDir}`);
			if (!rootDir) {
				throw new Error('scss plugin require esbuild option "absWorkingDir" to be set.');
			}

			const srcDir = resolve(rootDir, filledOptions.sourceRoot);
			session.logger.terminal.writeDebugLine(`scss: src =${srcDir}`);
			if (!existsSync(srcDir)) {
				throw new Error('source root dir is not exists: ' + srcDir);
			}
			const outputDir = build.initialOptions.outdir;
			if (!outputDir) {
				throw new Error('scss plugin require esbuild option "outputDir" to be set.');
			}

			const compiler = new MyScssCompiler(build.initialOptions, filledOptions, shimLogger(session));

			const registry = new Map<string, IScssModuleCompileResult>();

			build.onStart(() => {
				registry.clear();
			});

			const resolveMap = new Map<string, OnResolveResult>();
			const resolver = (args: OnResolveArgs, path: string) => {
				session.logger.terminal.writeDebugLine(`try location: ${path}`);
				if (existsSync(path)) {
					return { path, sideEffects: false };
				} else if (existsSync(`${args.importer}.map`)) {
					const smap = JSON.parse(readFileSync(`${args.importer}.map`, 'utf-8'));
					const s: string = smap.sources?.[0];
					if (s) {
						const srcPath = resolve(args.importer, '..', s, '..', args.path);
						session.logger.terminal.writeDebugLine('try location: ' + srcPath);
						if (existsSync(srcPath)) {
							// native filesystem path
							return { path: srcPath, sideEffects: false };
						} else {
							// has sourceRoot (baseUrl)
							const srcPath2 = resolve(srcDir, s, '..', args.path);
							session.logger.terminal.writeDebugLine('try location: ' + srcPath2);
							if (existsSync(srcPath2)) {
								return { path: srcPath2, sideEffects: false };
							}
						}
					} else {
						session.logger.terminal.writeDebugLine(`missing source in map: ${path}.map`);
					}
				}
				return null;
			};
			build.onResolve({ filter: /\.scss$/ }, (args) => {
				if (args.namespace !== 'file') return;

				const path = resolve(args.resolveDir, args.path);

				if (!scriptUsage.includes(args.kind)) {
					return { path: path, sideEffects: false, pluginData: { asStyle: true } };
				}

				if (resolveMap.has(path)) {
					if (!existsSync(path)) {
						resolveMap.delete(path);
					}
				} else {
					const result = resolver(args, path);
					if (result) {
						resolveMap.set(path, result);
					}
				}

				return resolveMap.get(path) || null;
			});

			build.onLoad({ filter: /\.scss$/ }, (args): OnLoadResult | undefined => {
				session.logger.terminal.writeDebugLine(
					`onLoad: (${args.namespace}) ${args.path} ${args.pluginData?.asStyle ? '(asStyle)' : ''}`
				);
				if (args.namespace !== 'file') return;

				if (args.pluginData?.asStyle) {
					const { cssText, /*sourceMap,*/ watchFiles } = compiler.compileStyle(args.path);

					// const contents =
					// 	cssText +
					// 	inlineSourceMap(sourceMap, build.initialOptions.sourceRoot!, build.initialOptions.sourceRoot!);
					return { loader: 'css', contents: cssText, watchFiles };
				} else {
					const result = compiler.compileModule(args.path);

					registry.set(relative(rootDir, args.path), result);

					return {
						loader: 'js',
						watchFiles: result.watchFiles,
						contents:
							`export const className = ${JSON.stringify(result.className)};\n` +
							`export const styleText = ${JSON.stringify(result.cssText)};`,
					};
				}
			});

			build.onEnd(async (result) => {
				// console.log('------------', registry, result.metafile!.outputs['lib/index.js']);
				if (!result.metafile) return;

				for (const [outputFile, { inputs }] of Object.entries(result.metafile!.outputs)) {
					const keys = Object.keys(inputs).filter((id) => registry.has(id));
					if (keys.length === 0) continue;

					const outBase = outputFile.slice(0, outputFile.length - extname(outputFile).length);
					// console.log('------------', outputFile, inputs);
					const cssOutput = resolve(rootDir, outBase + '.module.css');
					const concat = new ConcatWithSourceMap(true, cssOutput, '\n');

					for (const id of keys) {
						const result = registry.get(id)!;
						concat.add(null, `/* source file: ${id} */`);
						concat.add(id, result.cssText, result.sourceMap);
						concat.add(null, ``);
					}

					writeFileSync(cssOutput, concat.content + `/*# sourceMappingURL=./${basename(cssOutput)}.map */`);

					const sm = JSON.parse(concat.sourceMap!);
					fixSourceMap(sm, build.initialOptions.sourceRoot!, outBase);
					writeFileSync(cssOutput + '.map', JSON.stringify(sm, null, 2), 'utf-8');

					session.logger.terminal.writeLine(`output css file: ${cssOutput}`);
				}
			});
		},
	};
}
