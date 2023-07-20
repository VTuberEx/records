import { BrowserWindow, BrowserWindowConstructorOptions, Input } from 'electron';
import { settingsStore } from '../misc/settings-server';
import { PRELOAD_FILE } from './constants';

export function createMainWindow() {
	const options: BrowserWindowConstructorOptions = {
		width: Math.max(settingsStore.current.windowState.w, 1824),
		height: Math.max(settingsStore.current.windowState.h, 1008),
		minWidth: 1200,
		minHeight: 400,
		webPreferences: {
			preload: PRELOAD_FILE,
		},
	};
	if (settingsStore.current.windowState.x > 0 && settingsStore.current.windowState.y > 0) {
		options.x = settingsStore.current.windowState.x;
		options.y = settingsStore.current.windowState.y;
	} else {
		options.center = true;
	}

	const win = new BrowserWindow(options);

	win.loadURL('app://dist/index.html', {});

	win.on('ready-to-show', () => {
		if (settingsStore.current.windowState.max) {
			win.maximize();
		}
		win.show();
		win.webContents.openDevTools();
	});

	win.setBackgroundColor('#eff4f9');
	win.on('focus', () => {
		win.setBackgroundColor('#eff4f9');
		// emitClientEvent(win, 'focus', true);
	});
	win.on('blur', () => {
		win.setBackgroundColor('#f3f3f3');
		// emitClientEvent(win, 'focus', false);
	});

	win.on('close', () => {
		const [w, h] = win.getSize() as [number, number];
		const [x, y] = win.getPosition() as [number, number];
		settingsStore.set('windowState', { max: win.isMaximized(), x, y, w, h });
	});

	// win.webContents.on('console-message', (ev, level, message, line, file) => {
	// 	console.log('child log event: ', { ev, level, message, line, file });
	// });
	win.webContents.on('input-event', (e, ee) => {
		if (ee.type === 'keyUp') {
			if ((ee as Input).key === 'F5') {
				e.preventDefault();
				win.reload();
			} else if ((ee as Input).key === 'r' && (ee as Input).modifiers.includes('control')) {
				e.preventDefault();
				createMainWindow();
				win.close();
			}
		}
	});
}
