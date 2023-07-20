import { mkdirSync } from 'fs';
import { platform } from 'os';
import { resolve } from 'path';
import { normalizePath } from '@idlebox/common';
import { PathEnvironment } from '@idlebox/node';
import { app } from 'electron';

declare const ESBUILD_INPUT: any;

export const RENDER_PROJ_ROOT = resolve(__dirname, ESBUILD_INPUT.SOURCE_ROOT);
console.log('RENDER_PROJ_ROOT = %s', RENDER_PROJ_ROOT);

export const NODE_MODULES_ROOT = resolve(__dirname, ESBUILD_INPUT.MODULES_ROOT);
console.log('NODE_MODULES_ROOT = %s', NODE_MODULES_ROOT);

export const MONOREPO_ROOT = resolve(__dirname, ESBUILD_INPUT.APP_ROOT);
console.log('MONOREPO_ROOT=%s', MONOREPO_ROOT);

export const STORAGE_ROOT = app.getPath('userData');
console.log('STORAGE_ROOT=%s', STORAGE_ROOT);

mkdirSync(STORAGE_ROOT, { recursive: true });

export const originalPathVar = process.env.path;

export const pathVar = new PathEnvironment();
if (platform() === 'win32') {
	pathVar.add('C:/Program Files (x86)/K-Lite Codec Pack/Tools');
}

export const CLIENT_PATH = normalizePath(
	app.isPackaged ? resolve(process.resourcesPath, 'assets') : resolve(RENDER_PROJ_ROOT, 'lib')
);
console.log('CLIENT_PATH = %s', CLIENT_PATH);

export const PRELOAD_FILE = resolve(__dirname, ESBUILD_INPUT.PRELOAD_FILE);
