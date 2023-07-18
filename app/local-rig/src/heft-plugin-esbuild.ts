import { resolve } from 'path';
import type { HeftConfiguration, IHeftTaskSession } from '@rushstack/heft';
import { IHeftTaskPlugin } from '@rushstack/heft';
import esbuild, { BuildContext, BuildOptions } from 'esbuild';
import { ScssCombinePlugin } from './scss/esbuild-sass-bridge';

export const PLUGIN_NAME = 'esbuild';

interface IOptions {
	readonly alias?: Record<string, string>;
	readonly scriptFile: string | string[];
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

		const contextsPromise = this.getContext(session, options);

		session.hooks.run.tapPromise(PLUGIN_NAME, async () => {
			const contexts = await contextsPromise;

			for (const context of contexts) {
				await context.rebuild();
			}

			session.logger.terminal.writeLine('complete build without errors.');

			await Promise.all(contexts.map((e) => e.dispose()));
		});

		session.hooks.runIncremental.tapPromise(PLUGIN_NAME, async () => {
			const contexts = await contextsPromise;

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
			const arr = Array.isArray(options.scriptFile) ? options.scriptFile : [options.scriptFile];
			contexts.push(await this.createScriptContext(session, arr));
		}
		if (options.styleFile) {
			contexts.push(await this.createScriptContext(session, [options.styleFile]));
		}

		this._contexts = contexts;
		return contexts;
	}

	createScriptContext(session: IHeftTaskSession, entryFiles: string[]) {
		return esbuild.context<BuildOptions>({
			entryPoints: entryFiles,
			bundle: true,
			splitting: false,
			platform: 'browser',
			assetNames: 'assets/[name][ext]',
			outdir: this.outputDir,
			publicPath: this.publicPath,
			mainFields: ['browser', 'module', 'main'],
			conditions: ['browser', 'import', 'default'],
			resolveExtensions: ['.ts', '.tsx', '.js'],
			external: ['electron', 'node:*'],
			loader: {
				'.png': 'file',
				'.svg': 'text',
				'.woff2': 'file',
				'.woff': 'file',
				'.ttf': 'file',
				'.eot': 'file',
			},
			sourcemap: 'linked',
			sourceRoot: 'app://debug/',
			sourcesContent: false,
			write: true,
			metafile: true,
			absWorkingDir: this.rootDir,
			alias: this.alias,
			keepNames: true,
			format: 'cjs',
			charset: 'utf8',
			target: 'esnext',
			plugins: [
				// SkipElectronPlugin(),
				ScssCombinePlugin(session, {
					// TODO
					sourceRoot: './src',
				}),
			],
		});
	}
}
