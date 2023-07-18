import type { IElectronAPI } from '@app/protocol';
import { rmSync } from 'fs';
import { promiseBool } from '@idlebox/common';
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
		async relaunch() {
			try {
				return await promiseBool(settingsStore.commit());
			} finally {
				app.relaunch({});
				app.exit(0);
			}
		},
		async verifySettings() {
			
		},
	};

	ipcMain.handle('api', (_e, meta?: IRequestMetadata, ...args) => {
		return Promise.resolve()
			.then(() => {
				if (typeof meta?.request !== 'string') throw new Error('invalid request metadata');

				const callback = handler[meta.request];

				if (callback.length !== args.length) {
					throw `mismatch arguments size. want ${callback.length}, got ${args.length}`;
				}

				return (callback as any)(...args);
			})
			.then(
				(data: any) => {
					return { success: true, data };
				},
				(error: any) => {
					if (error instanceof Error) {
						return {
							success: false,
							error: {
								message: error.message,
								code: (error as any).code,
								stack: error.stack,
							},
						};
					} else {
						return { success: false, error: { message: error } };
					}
				}
			);
	});
}
