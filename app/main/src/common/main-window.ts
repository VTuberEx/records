import { BrowserWindow } from 'electron';

export function createMainWindow() {
	const win = new BrowserWindow({
		width: 1824,
		height: 1008,
	});

	win.loadURL('app://dist/index.html', {});

	win.on('ready-to-show', () => {
		win.show();
		win.webContents.openDevTools();
	});
	// win.webContents.on('console-message', (ev, level, message, line, file) => {
	// 	console.log('child log event: ', { ev, level, message, line, file });
	// });
}
