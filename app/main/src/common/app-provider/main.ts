import { access, readFile, stat } from 'fs/promises';
import { extname, resolve } from 'path';
import { StatusCodes } from 'http-status-codes';
import { CLIENT_PATH, MODULES_ROOT, SOURCE_ROOT } from '../constants';

export enum ApplicationParts {
	Application = 'dist',
	NodeModules = 'dependencies',
	DebugSource = 'debug',
}
export enum ApplicationDebugParts {
	SourceRoot = 'src',
	NodeModules = 'node_modules',
}

function createStatusResponse(status: StatusCodes) {
	return new Response(null, { status });
}

async function sendfile(request: GlobalRequest, root: string, path: string) {
	const file = resolve(root, './' + path);

	try {
		await access(file);
	} catch (e: any) {
		log(request, false, e.message);
		return createStatusResponse(StatusCodes.NOT_FOUND);
	}

	const s = await stat(file);
	if (!s.isFile()) {
		log(request, false, `not regular file: ${file}`);
		return createStatusResponse(StatusCodes.FORBIDDEN);
	}

	const mime = getMime(extname(file));
	const data = await readFile(file);
	log(request, true, `${data.length}bytes`);
	return new Response(data, { headers: { 'Content-Type': mime, 'Cache-control': 'no-cache' } });
}

export async function ApplicationProvider(request: GlobalRequest): Promise<GlobalResponse> {
	const pahtinfo = new URL(request.url);

	try {
		if (pahtinfo.hostname === ApplicationParts.Application) {
			return sendfile(request, CLIENT_PATH, pahtinfo.pathname);
		} else if (pahtinfo.hostname === ApplicationParts.NodeModules) {
			log(request, false, `TODO: ${pahtinfo.pathname}`);
			return createStatusResponse(StatusCodes.NOT_IMPLEMENTED);
		} else if (pahtinfo.hostname === ApplicationParts.DebugSource) {
			const slashIndex = pahtinfo.pathname.indexOf('/', 1);
			const type = pahtinfo.pathname.slice(1, slashIndex);
			let path = pahtinfo.pathname.slice(slashIndex + 1);

			switch (type) {
				case ApplicationDebugParts.SourceRoot:
					console.log('::: ',path)
					if (path.startsWith('src/')) {
						path = path.slice(4);
					}
					return sendfile(request, SOURCE_ROOT, path);
				case ApplicationDebugParts.NodeModules:
					return sendfile(request, MODULES_ROOT, path);
			}

			log(request, false, `TODO: ${type} -- ${path}`);
			return createStatusResponse(StatusCodes.NOT_IMPLEMENTED);
		} else {
			log(request, false, `invalid request: ${request.url} (${JSON.stringify(pahtinfo)})`);
			return createStatusResponse(StatusCodes.BAD_REQUEST);
		}
	} catch (e: any) {
		log(request, false, e.message);
		return createStatusResponse(StatusCodes.INTERNAL_SERVER_ERROR);
	}
}

function log(request: GlobalRequest, success: boolean, message: string) {
	console.log(
		`[request] ${request.url}${request.referrer ? `(from ${request.referrer})` : ''} ${
			success ? '\x1B[38;5;10msuccess' : '\x1B[38;5;9mfailed'
		}\x1B[0m - ${message}`
	);
}

function getMime(extension: string) {
	if (knownMime.has(extension)) {
		return knownMime.get(extension)!;
	} else {
		return 'text/plain; charset=utf-8';
	}
}
const knownMime = new Map([
	['.html', 'text/html; charset=utf-8'],
	['.js', 'text/javascript; charset=utf-8'],
	['.json', 'application/json; charset=utf-8'],
	['.map', 'application/json; charset=utf-8'],
	['.ts', 'text/plain; charset=utf-8'],
	['.css', 'text/css; charset=utf-8'],
	['.scss', 'text/css; charset=utf-8'],
]);
