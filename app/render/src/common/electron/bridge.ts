import { IElectronAPI, IElectronEvents } from '@app/protocol';

export const electronAPI: IElectronAPI = (window as any).electronAPI;
export const electronEvents: IElectronEvents = (window as any).electronEvents;
