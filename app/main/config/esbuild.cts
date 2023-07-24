/// <reference types='@build-script/heft-esbuild-plugin' />

import { dirname, resolve } from 'path';
import { findUpUntilSync, relativePath } from '@idlebox/node';
import type { BuildOptions } from 'esbuild';

const instance = findUpUntilSync(session.rootDir, 'pnpm-workspace.yaml');
if (!instance) throw new Error('missing pnpm-workspace.yaml?');

const rootDir = dirname(instance);

const define: Record<string, string> = {};
const outDir = resolve(session.rootDir, 'lib');
function definePath(name: string, abs: string) {
	define[`ESBUILD_INPUT.${name}`] = JSON.stringify(relativePath(outDir, abs));
}

definePath('MODULES_ROOT', resolve(rootDir, 'node_modules'));
definePath('APP_ROOT', rootDir);
definePath('SOURCE_ROOT', resolve(rootDir, 'app/render'));
definePath('PRELOAD_FILE', resolve(__dirname, '../lib/preload.js'));

export const options: BuildOptions[] = [
	{
		entryPoints: [{ in: './src/preload/index.ts', out: 'preload' }],
		platform: 'node',
		outdir: './lib',
		external: ['electron'],
		minifySyntax: true,
		sourceRoot: 'app://preload/',
		sourcemap: 'inline',
		sourcesContent: true,
		format: 'cjs',
	},
	{
		entryPoints: [{ in: './src/main.ts', out: 'main' }],
		platform: 'node',
		outdir: './lib',
		format: 'cjs',
		external: ['electron'],
		inject: ['./config/tools/inject.js'],
		define: {
			...define,
			// __dirname: '__dirname',
		},
		minifySyntax: true,
	},
];
