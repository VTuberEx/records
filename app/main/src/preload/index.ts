import type { IElectronAPI } from '@app/protocol';
import { contextBridge, ipcRenderer } from 'electron';

const renderApi: IElectronAPI = {
	async loadSettings() {
		return await ipcRenderer.invoke('api', { request: 'loadSettings' });
	},
	async updateSettings(newState) {
		await ipcRenderer.invoke('api', { request: 'updateSettings' }, newState);
	},
	uninstall() {
		ipcRenderer.invoke('api', { request: 'uninstall' });
		document.body.innerHTML = '';
		throw new Error('即将退出');
	},
	async verifySettings() {
		await ipcRenderer.invoke('api', { request: 'verifySettings' });
	},
};

contextBridge.exposeInMainWorld('electronAPI', renderApi);
