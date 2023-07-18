import type { IElectronAPI } from '@app/protocol';
import { ipcRenderer } from 'electron';

export const renderApi: IElectronAPI = {
	async loadSettings() {
		return await invoke('loadSettings');
	},
	async updateSettings(key, value) {
		await invoke('updateSettings', key, value);
	},
	uninstall() {
		invoke('uninstall');
		document.body.innerHTML = '';
		throw new Error('即将退出');
	},
	async relaunch() {
		return await invoke('relaunch');
	},
	async verifySettings() {
		await invoke('verifySettings');
	},
};

function invoke(request: keyof IElectronAPI, ...args: any[]) {
	return ipcRenderer
		.invoke('api', { request }, ...args)
		.then((data) => {
			if (data.success) {
				return data.data;
			} else {
				const e = new Error(data.error.message);
				Object.assign(e, { stack: data.error.stack, code: data.error.code });
				throw e;
			}
		})
		.catch((e) => {
			console.log('%c[ipc] error: %s', 'color:red', e.message);
			throw e;
		});
}
