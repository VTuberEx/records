import { app, protocol } from 'electron';
import { ApplicationProvider } from './common/app-provider/main';
import { createMainWindow } from './common/main-window';

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
	app.quit();
});

app.on('web-contents-created', (_, contents) => {
	contents.on('will-navigate', (event, navigationUrl) => {
		console.log('will-navigate:', navigationUrl);
		event.preventDefault();
	});

	contents.setWindowOpenHandler((edata) => {
		console.log('WindowOpenHandler:', edata);
		return { action: 'deny' };
	});
});

app.whenReady().then(() => {
	protocol.handle('app', ApplicationProvider);

	createMainWindow();
});
