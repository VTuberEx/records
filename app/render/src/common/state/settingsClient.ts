import { ISystemSetting } from '@app/protocol';
import { Signal, signal } from '@preact/signals';
import { ChangeEvent } from 'react';
import { objectEntries } from 'ts-extras';
import { CheckboxChangeEvent } from 'primereact/checkbox';
import { DropdownChangeEvent } from 'primereact/dropdown';
import { InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { ToggleButtonChangeEvent } from 'primereact/togglebutton';
import { electronAPI } from '../electron/bridge';
import { toastError } from '../ui-lib/globalToast';

type SystemSettings = {
	readonly [key in keyof ISystemSetting]: Signal<ISystemSetting[key]>;
};

class AppSettings {
	public readonly observables: SystemSettings = {
		proxyServer: new Signal(''),
		ffmpegExecPath: new Signal(''),
		tempFolder: new Signal(''),
		mediainfoExecPath: new Signal(''),
		whisperModelPath: new Signal(''),
		whisperModelName: new Signal(''),
		whisperLanguage: new Signal(''),
		recordGapMinutes: new Signal(0),
		recordIgnoreTitle: new Signal(false),
		opTime: new Signal(1),
		opTimeIsSec: new Signal(true),
		opShowRoom: new Signal(true),
	};

	public readonly settingHasError = signal(true);

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
		await this.verify().catch();
	}

	async verify() {
		try {
			await electronAPI.verifySettings();
			this.settingHasError.value = true;
		} catch (e: any) {
			this.settingHasError.value = false;
			throw e;
		}
	}

	async set<T extends keyof ISystemSetting>(key: T, value: ISystemSetting[T]) {
		this.observables[key].value = value;
		await electronAPI.updateSettings(key, value);
	}

	setNotify<T extends keyof ISystemSetting>(key: T, value: ISystemSetting[T]) {
		this.observables[key].value = value;
		electronAPI.updateSettings(key, value).catch((e) => {
			console.log(e);
			toastError(e);
		});
	}

	getInputProps<T extends keyof ISystemSetting>(key: T) {
		return {
			value: this.watch(key),
			onChange: (e: ChangeEvent<HTMLInputElement>) => this.setNotify(key, e.currentTarget.value as any),
		};
	}
	getInputNumberProps<T extends keyof ISystemSetting>(key: T) {
		return {
			value: this.watch(key),
			onValueChange: (e: InputNumberValueChangeEvent) => this.setNotify(key, e.value as any),
		};
	}
	getCheckboxProps<T extends keyof ISystemSetting>(key: T) {
		return {
			checked: this.watch(key),
			onChange: (a: ToggleButtonChangeEvent | CheckboxChangeEvent) => {
				const e: any = a;
				this.setNotify(key, e.checked ?? e.value);
			},
		};
	}
	getComboboxProps<T extends keyof ISystemSetting>(key: T) {
		return {
			value: this.watch(key),
			onChange: (e: DropdownChangeEvent) => this.setNotify(key, e.value as any),
		};
	}
}

export const appSettings = new AppSettings();
