import type { IElectronAPI } from '@app/protocol';
import { rmSync } from 'fs';
import { app, ipcMain } from 'electron';
import { STORAGE_ROOT } from '../constants';
import { settingsStore } from '../misc/settings';

interface IRequestMetadata {
	readonly request: keyof IElectronAPI;
}

export async function startApi() {
	const handler: IElectronAPI = {
		async loadSettings() {
			return settingsStore.current;
		},
		async updateSettings(k, v) {
			settingsStore.set(k, v as any);
		},
		uninstall() {
			rmSync(STORAGE_ROOT, { recursive: true, force: true });
			app.exit(0);
			throw new Error('???');
		},
		async verifySettings() {
			throw new Error('not impl');
		},
	};

	ipcMain.handle('api', (_e, meta?: IRequestMetadata, ...args) => {
		if (typeof meta?.request !== 'string') throw new Error('invalid request metadata');

		const callback = handler[meta.request];

		if (callback.length !== args.length) {
			throw new Error('mismatch arguments size');
		}
		return (callback as any)(...args);
	});
}
