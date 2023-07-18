import { ISystemSetting } from '@app/protocol';
import { Signal } from '@preact/signals';
import { objectEntries } from 'ts-extras';
import { electronAPI } from '../electron/bridge';

type SystemSettings = {
	readonly [key in keyof ISystemSetting]: Signal<ISystemSetting[key]>;
};

class AppSettings {
	public readonly observables: SystemSettings = {
		proxyServer: new Signal(''),
		ffmpegExecPath: new Signal(''),
		mediainfoExecPath: new Signal(''),
		whisperModelPath: new Signal(''),
		whisperModelName: new Signal(''),
		whisperLanguage: new Signal(''),
		recordGapMinutes: new Signal(0),
		recordIgnoreTitle: new Signal(false),
	};

	public peek<T extends keyof ISystemSetting>(key: T): ISystemSetting[T] {
		return this.observables[key].peek();
	}
	public watch<T extends keyof ISystemSetting>(key: T): ISystemSetting[T] {
		return this.observables[key].valueOf();
	}

	async load() {
		const data = await electronAPI.loadSettings();
		for (const [name, signal] of objectEntries(this.observables)) {
			signal.value = data[name];
		}
	}

	async set<T extends keyof ISystemSetting>(key: T, value: ISystemSetting[T]) {
		this.observables[key].value = value;
		await electronAPI.updateSettings(key, value);
	}

	getInputProps<T extends keyof ISystemSetting>(key: T) {
		return {
			value: this.watch(key),
			// onInput: (e: InputEvent) => this.set(key, ''),
		};
	}
}

export const appSettings = new AppSettings();

appSettings.set('mediainfoExecPath', '');
