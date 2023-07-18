import { IElectronEvents } from '@app/protocol';
import { ipcRenderer } from 'electron';
import { EventEmitter } from 'node:events';

const events = new EventEmitter();

ipcRenderer.on('main-events', (_event, kind, ...args) => {
	events.emit(kind, ...args);
});

export const renderEvents: IElectronEvents = {
	on: events.on.bind(events),
	once: events.once.bind(events),
	off: events.off.bind(events),
	removeAllListeners: events.removeAllListeners.bind(events),
};
