import { app, BrowserWindow, protocol } from 'electron';
import { ApplicationProvider } from './common/app-provider/main';

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

	function createMainWindow() {
		const win = new BrowserWindow({
			width: 1824,
			height: 1008,
		});

		win.loadURL('app://dist/index.html', {});

		win.on('ready-to-show', () => {
			win.show();
			win.webContents.openDevTools();
		});
	}
});
