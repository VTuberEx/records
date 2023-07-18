import { app, Menu, protocol } from 'electron';
import { startApi } from './common/api/server-protocol';
import { ApplicationProvider } from './common/app-provider/main';
import { createMainWindow } from './common/main-window';
import { settingsStore } from './common/misc/settings';

console.log('dependencies loaded.');

protocol.registerSchemesAsPrivileged([
	{
		scheme: 'app',
		privileges: {
			standard: true,
			secure: true,
			supportFetchAPI: true,
			allowServiceWorkers: true,
			bypassCSP: true,
			corsEnabled: false,
		},
	},
]);

app.on('window-all-closed', () => {
	console.log('[EVENT] window-all-closed');
	app.quit();
});

app.on('web-contents-created', (_, contents) => {
	contents.on('will-navigate', (event, navigationUrl) => {
		console.log('[EVENT] will-navigate:', navigationUrl);
		event.preventDefault();
	});

	contents.setWindowOpenHandler((edata) => {
		console.log('[EVENT] WindowOpenHandler:', edata);
		return { action: 'deny' };
	});
});

Menu.setApplicationMenu(null);

export async function app_main_function() {
	await app.whenReady();
	console.log('[EVENT] app-ready');

	await settingsStore.init();
	await startApi();
	protocol.handle('app', ApplicationProvider);
	createMainWindow();
}
