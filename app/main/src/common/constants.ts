import { createRequire } from 'module';
import { resolve } from 'path';
import { app } from 'electron';

export const CLIENT_PATH = app.isPackaged
	? resolve(process.resourcesPath, 'assets')
	: resolve(__dirname, '../../../render/lib');

console.log('ASSETS_PATH = %s', CLIENT_PATH);

const detect = app.isPackaged
	? { nm: '/not/exists', src: '/not/exists' }
	: (() => {
			const render = resolve(__dirname, '../../../render');
			const src = resolve(render, 'src');
			const require = createRequire(src);
			const nm = resolve(require.resolve('react/package.json'), '../..');

			return { nm, src };
	  })();

export const SOURCE_ROOT = detect.src;
export const MODULES_ROOT = detect.nm;
