import { readFileSync } from 'fs';
import { createRequire } from 'module';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { findUpUntilSync } from '@idlebox/node';
import { FileImporter } from 'sass';
import { ExLogger } from './logger';

const validExtensions = /\.(sc|sa|c)ss$/i;

function parseImport(id: string) {
	if (id[0] === '@') {
		const [scope, name, ...pathArr] = id.split('/');
		return { packageName: `${scope}/${name}`, path: pathArr.join('/') };
	} else {
		const [name, ...pathArr] = id.split('/');
		return { packageName: name!, path: pathArr.join('/') };
	}
}

function resolvePackge(id: string, from = process.cwd()) {
	const require = createRequire(from);
	try {
		const path = require.resolve(id + '/package.json');
		return dirname(path);
	} catch (e: any) {
		if (e.code === 'MODULE_NOT_FOUND') {
			const path = require.resolve(id, { paths: [from] });
			return findUpUntilSync(path, 'package.json')!;
		}
		throw e;
	}
}
function tryResolveMain(absPath: string) {
	const pkgJson = JSON.parse(readFileSync(absPath + '/package.json', 'utf-8'));
	if (pkgJson.main && validExtensions.test(pkgJson.main)) {
		return resolve(absPath, './' + pkgJson.main);
	}
	return '';
}

export function createScssImporter(sourceRoot: string, logger: ExLogger): FileImporter<'sync'> {
	return {
		findFileUrl(url, _options) {
			try {
				logger.debug(`[scss] import request "${url}" (from ${sourceRoot}):`);
				if (url.startsWith('.')) return null;

				if (url.startsWith('file://')) {
					url = fileURLToPath(url);
				}

				let result;
				if (url.startsWith('/')) {
					result = url;
				} else {
					let { packageName, path } = parseImport(url);
					const packageRoot = resolvePackge(packageName, sourceRoot);

					if (path) {
						result = resolve(packageRoot, path);
					} else {
						const mainEntry = tryResolveMain(packageRoot);
						if (mainEntry) result = mainEntry;
					}
				}

				if (result) {
					const u = new URL('file://' + result);
					logger.debug(`[scss] success -> "${u}"`);
					return u;
				} else {
					logger.debug(`[scss] try resolve ${url} failed.`);
					return null;
				}
			} catch (e: any) {
				logger.warn(`[scss] failed resolve ${url}: ${e.stack}`);
				throw e.message;
			}
		},
	};
}
