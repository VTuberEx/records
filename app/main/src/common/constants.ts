import { mkdirSync } from 'fs';
import { platform } from 'os';
import { dirname, resolve } from 'path';
import { findUpUntilSync } from '@idlebox/node';
import { app } from 'electron';

export const CLIENT_PATH = app.isPackaged
	? resolve(process.resourcesPath, 'assets')
	: resolve(__dirname, '../../../render/lib');

console.log('CLIENT_PATH = %s', CLIENT_PATH);

const detect = app.isPackaged
	? { root: app.getAppPath(), nm: 'asar://debug', src: 'asar://debug' }
	: (() => {
			const render = resolve(__dirname, '../../../render');
			const src = resolve(render, 'src');

			const projRoot = dirname(findUpUntilSync(__dirname, 'pnpm-workspace.yaml')!);
			const nm = resolve(projRoot, 'node_modules');

			return { nm, src, root: projRoot };
	  })();

export const SOURCE_ROOT = detect.src;
console.log('SOURCE_ROOT = %s', SOURCE_ROOT);

export const MODULES_ROOT = detect.nm;
console.log('MODULES_ROOT = %s', MODULES_ROOT);

export const APP_ROOT = detect.root;
console.log('APP_ROOT=%s', APP_ROOT);

const appData = app.getPath('appData');
if (appData.length < 10) {
	throw new Error('appData is: ' + appData);
}
export const STORAGE_ROOT = resolve(appData, './vtuberex/records');

mkdirSync(STORAGE_ROOT, { recursive: true });

if (platform() === 'win32') {
	process.env.path += ';C:/Program Files (x86)/K-Lite Codec Pack/Tools';
}
console.log('PATH=%s', process.env.path);
