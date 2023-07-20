/// <reference types='@build-script/heft-esbuild-plugin' />

import { readFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { findUpUntilSync, relativePath } from '@idlebox/node';
import type { BuildOptions, Plugin } from 'esbuild';

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
		external: ['electron', 'fix-esm'],
	},
	{
		entryPoints: [{ in: './src/main.ts', out: 'main' }],
		platform: 'node',
		outdir: './lib',
		define,
		external: ['electron', 'fix-esm'],
		plugins: [fixLinguistLanguages()],
	},
];
function fixLinguistLanguages(): Plugin {
	return {
		name: 'throwOutPrettier',
		setup(build) {
			build.onLoad({ filter: /linguist-languages\/lib\/index.mjs$/ }, async (args) => {
				const data = await readFile(args.path, 'utf-8');
				return {
					contents: decodeURIComponent(data),
				};
			});
		},
	};
}

// function throwOutPrettier(): Plugin {
// 	return {
// 		name: 'throwOutPrettier',
// 		setup(build) {
// 			build.onLoad({ filter: /\/node_modules\/prettier\// }, (args) => {
// 				// const require = createRequire(args.resolveDir);
// 				// const result = require.resolve('prettier');
// 				// return {
// 				// 	path: result,
// 				// 	loader: 'file',
// 				// };
// 				if (args.path.includes('/parser')) {
// 					return {
// 						contents: '',
// 						loader: 'empty',
// 					};
// 				}
// 				return {
// 					loader: 'file',
// 				};
// 			});
// 		},
// 	};
// }
