import { mkdirSync } from 'fs';
import { createRequire } from 'module';
import { platform } from 'os';
import { resolve } from 'path';
import { app } from 'electron';

export const CLIENT_PATH = app.isPackaged
	? resolve(process.resourcesPath, 'assets')
	: resolve(__dirname, '../../../render/lib');

console.log('CLIENT_PATH = %s', CLIENT_PATH);

const detect = app.isPackaged
	? { nm: '/not/exists', src: '/not/exists' }
	: (() => {
			const render = resolve(__dirname, '../../../render');
			const src = resolve(render, 'src');
			const require = createRequire(src);
			const nm = resolve(require.resolve("@app/local-rig/package.json"), '../../..');

			return { nm, src };
	  })();

export const SOURCE_ROOT = detect.src;
console.log('SOURCE_ROOT = %s', SOURCE_ROOT);

export const MODULES_ROOT = detect.nm;
console.log('MODULES_ROOT = %s', MODULES_ROOT);

export const APP_ROOT = app.isPackaged
	? app.getAppPath()
	: (() => {
			const r = resolve(MODULES_ROOT, '../runtime-root');
			mkdirSync(r, { recursive: true });
			return r;
	  })();
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
