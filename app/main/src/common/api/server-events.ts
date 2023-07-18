import type { ProtocolEvent } from '@app/protocol';
import { BrowserWindow } from 'electron';

export function emitClientEvent(win: BrowserWindow, eventKind: ProtocolEvent, ...args: any[]) {
	win.webContents.send('main-events', eventKind, ...args);
}
