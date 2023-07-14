import type { HeftConfiguration, IHeftTaskSession } from '@rushstack/heft';

import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { IHeftTaskPlugin } from '@rushstack/heft';
import esbuild, { BuildContext, BuildOptions, Plugin, transform } from 'esbuild';
import { ScssCombinePlugin } from './scss/plugin';

export const PLUGIN_NAME = 'esbuild';

interface IOptions {
	readonly alias?: Record<string, string>;
	readonly scriptFile: string;
	readonly styleFile: string;
	readonly output: string;
	readonly publicPath?: string;
}

export default class ESBuildPlugin implements IHeftTaskPlugin<IOptions> {
	private outputDir: string = '';
	private rootDir: string = '';
	private publicPath?: string;
	private alias?: Record<string, string>;

	apply(session: IHeftTaskSession, configuration: HeftConfiguration, options: IOptions): void {
		if (!options.output) {
			throw new Error('output is required');
		}

		const outputDir = resolve(configuration.buildFolderPath, './' + options.output);
		if (!outputDir.startsWith(configuration.buildFolderPath)) {
			session.logger.terminal.writeWarningLine('output dirctory is out of root: ' + outputDir);
		}
		if (outputDir === configuration.buildFolderPath) {
			throw new Error('output dirctory is root: ' + options.output);
		}
		this.outputDir = outputDir;
		this.publicPath = options.publicPath;
		this.alias = options.alias;
		this.rootDir = configuration.buildFolderPath;

		session.hooks.run.tapPromise(PLUGIN_NAME, async () => {
			const contexts = await this.getContext(session, options);

			for (const context of contexts) {
				await context.rebuild();
			}

			session.logger.terminal.writeLine('complete build without errors.');
		});
	}

	private _contexts?: BuildContext[];
	async getContext(session: IHeftTaskSession, options: IOptions) {
		if (this._contexts) return this._contexts;

		const contexts = [];

		if (options.scriptFile) {
			contexts.push(await this.createScriptContext(session, options.scriptFile));
		}
		if (options.styleFile) {
			contexts.push(await this.createScriptContext(session, options.styleFile));
		}

		this._contexts = contexts;
		return contexts;
	}

	createScriptContext(session: IHeftTaskSession, entryFile: string) {
		return esbuild.context<BuildOptions>({
			entryPoints: [entryFile],
			bundle: true,
			splitting: false,
			platform: 'browser',
			outdir: this.outputDir,
			publicPath: this.publicPath,
			mainFields: ['browser', 'module', 'main'],
			resolveExtensions: ['.ts', '.tsx', '.js'],
			sourcemap: 'linked',
			sourceRoot: 'app://debug/',
			sourcesContent: false,
			metafile: true,
			absWorkingDir: this.rootDir,
			alias: this.alias,
			keepNames: true,
			format: 'esm',
			charset: 'utf8',
			plugins: [
				ScssCombinePlugin(session, {
					sourceRoot: './src', // TODO
				}),
			],
		});
	}
}

export const CSSMinifyPlugin: Plugin = {
	name: 'CSSMinifyPlugin',
	setup(build) {
		build.onLoad({ filter: /\.css$/ }, async (args) => {
			const f = await readFile(args.path);
			const css = await transform(f, { loader: 'css', minify: true });
			return { loader: 'text', contents: css.code };
		});
	},
};
