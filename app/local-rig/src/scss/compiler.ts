import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, extname, relative, resolve } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { relativePath } from '@idlebox/node';
import { BuildOptions } from 'esbuild';
import { compile, CompileResult, compileString } from 'sass';
import { ExLogger } from './tools/logger';
import { createScssImporter } from './tools/resolve';
import { RawSourceMap } from './tools/sourcemap';

export interface IScssCompilerOptions {
	sourceRoot: string;
}

export interface IScssSheetCompileResult {
	watchFiles: string[];
	cssText: string;
	sourceMap: RawSourceMap;
}

export interface IScssModuleCompileResult extends IScssSheetCompileResult {
	className: string;
}

export class MyScssCompiler {
	private readonly context;
	constructor(
		esbuild: BuildOptions,
		pluginOptions: IScssCompilerOptions,
		private readonly logger: ExLogger
	) {
		this.context = {
			rootDir: esbuild.absWorkingDir!,
			outputDir: esbuild.outdir!,
			sourceDir: resolve(esbuild.absWorkingDir!, pluginOptions.sourceRoot),
		};
	}

	private readonly nameCache: Record<string, string> = {};
	public createUniqueName(filename: string) {
		if (!this.nameCache[filename]) {
			let name = relative(this.context.sourceDir, filename);
			name = name.slice(0, name.length - extname(name).length);
			name = name.replace(/[^_0-9a-z]+/gi, '_');
			name = name.replace(/^_+|_+$/, '');
			this.nameCache[filename] = name;
		}
		return this.nameCache[filename]!;
	}

	compileModule(styleFile: string): IScssModuleCompileResult {
		const className = this.createUniqueName(styleFile);
		const data = readFileSync(styleFile, 'utf-8');

		const lines = data.replace(/::container/, '&').split('\n');
		const lastId = lines.findIndex((l) => {
			return (
				l.trim() &&
				!l.startsWith('@use') &&
				!l.startsWith('@import') &&
				!l.startsWith('$') &&
				!l.startsWith('/')
			);
		});
		lines.splice(lastId, 0, '.' + className + '{');
		lines.push('}');

		let result;
		try {
			result = compileString(lines.join('\n'), {
				charset: false,
				logger: this.logger,
				style: 'expanded',
				sourceMap: true,
				url: pathToFileURL(styleFile),
				importers: [createScssImporter(styleFile, this.logger)],
			});
		} catch (e: any) {
			const err = new Error(`${e.message} [when compile module ${styleFile}]`);
			throw err;
		}

		this.logger.debug(
			`compiled: ${styleFile} (${className}) => ${this.writeDebugTempOutput(styleFile, result.css)}`
		);
		return {
			className,
			cssText: result.css,
			sourceMap: result.sourceMap!,
			watchFiles: flattenResultLoaded(result),
		};
	}

	compileStyle(styleFile: string): IScssSheetCompileResult {
		let result;

		try {
			result = compile(styleFile, {
				charset: false,
				logger: this.logger,
				style: 'expanded',
				sourceMap: true,
				importers: [createScssImporter(styleFile, this.logger)],
			});
		} catch (e: any) {
			const err = new Error(`${e.message} [when compile style ${styleFile}]`);
			throw err;
		}

		this.logger.debug(`compiled: ${styleFile} => ${this.writeDebugTempOutput(styleFile, result.css)}`);
		return {
			cssText: result.css,
			sourceMap: result.sourceMap!,
			watchFiles: flattenResultLoaded(result),
		};
	}

	private writeDebugTempOutput(inputFile: string, cssText: string) {
		const rel = relativePath(this.context.sourceDir, inputFile).replace(/^[/.]+/, '');
		const file = resolve(this.context.rootDir, 'temp/css-debug', rel);
		mkdirSync(dirname(file), { recursive: true });
		writeFileSync(file, cssText, 'utf-8');

		return file;
	}
}

function flattenResultLoaded(result: CompileResult) {
	return result.loadedUrls
		.filter((e) => e.protocol === 'file:')
		.map((e) => {
			return fileURLToPath(e.toString());
		});
}
