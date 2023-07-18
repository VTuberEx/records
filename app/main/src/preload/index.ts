import { contextBridge } from 'electron';
import { renderEvents } from './client-events';
import { renderApi } from './client-protocol';

contextBridge.exposeInMainWorld('electronAPI', renderApi);
contextBridge.exposeInMainWorld('electronEvents', renderEvents);
