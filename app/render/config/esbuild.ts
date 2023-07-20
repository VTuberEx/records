import type { IHeftTaskSession } from '@rushstack/heft';
import type { BuildOptions } from 'esbuild';
import { ScssCombinePlugin } from './scss/esbuild-sass-bridge';

declare const session: IHeftTaskSession;

export const options: BuildOptions[] = [
	{
		entryPoints: [{ in: './src/index.tsx', out: 'index' }],
		outdir: './lib',
		publicPath: 'app://dist/',
		alias: { react: 'preact/compat', 'react-dom': 'preact/compat' },
		plugins: [ScssCombinePlugin(session, { sourceRoot: 'src' })],
	},
	{
		entryPoints: [{ in: './src/styles/index.scss', out: 'global' }],
		outdir: './lib',
		publicPath: 'app://dist/',
		plugins: [ScssCombinePlugin(session, { sourceRoot: 'src' })],
	},
];

// styleFile: './src/styles/index.scss',
