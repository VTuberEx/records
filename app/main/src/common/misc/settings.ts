import type { ISystemSetting } from '@app/protocol';
import { mkdir, writeFile } from 'fs/promises';
import { platform } from 'os';
import { dirname, resolve } from 'path';
import { DeepWriteable, oneMinute } from '@idlebox/common';
import { commandInPath, exists, normalizePath } from '@idlebox/node';
import { loadJsonFile, writeJsonFileBack } from '@idlebox/node-json-edit';
import { APP_ROOT, STORAGE_ROOT } from '../constants';
import { shutdown } from './shutdown';

const defaultSettings: IMainSettings = {
	workingFolder: '',
	recentFolders: [],
	windowState: {
		max: false,
		x: -1,
		y: -1,
		w: -1,
		h: -1,
	},
	proxyServer: '',
	ffmpegExecPath: '',
	mediainfoExecPath: '',
	whisperModelPath: '',
	whisperModelName: '',
	whisperLanguage: '',
	recordGapMinutes: 10,
	recordIgnoreTitle: false,
};

export interface IMainSettings extends DeepWriteable<ISystemSetting> {
	workingFolder: string;
	recentFolders: string[];
	windowState: {
		max: boolean;
		x: number;
		y: number;
		w: number;
		h: number;
	};
}

class SettingsStore {
	public readonly file;

	private declare state: IMainSettings;
	private changed: boolean = false;
	private timer?: NodeJS.Timeout;

	constructor() {
		this.file = resolve(STORAGE_ROOT, 'state.json');
		console.log('配置文件: ' + this.file);
	}

	async init() {
		try {
			await this.read();
		} catch (e: any) {
			await this.reset();
			if (e.code !== 'ENOENT') {
				throw e;
			}
		}

		shutdown.register(this.commit.bind(this));
	}

	private toBeCommit() {
		this.changed = true;

		if (this.timer) clearTimeout(this.timer);
		this.timer = setTimeout(this.commit.bind(this), 1 * oneMinute);
	}

	private resetToBeCommit() {
		this.changed = false;
		if (this.timer) {
			clearTimeout(this.timer);
			delete this.timer;
		}
	}

	get current(): Readonly<IMainSettings> {
		return this.state;
	}

	async reset() {
		console.log('重置配置文件!');
		await mkdir(dirname(this.file), { recursive: true });
		await writeFile(
			this.file,
			JSON.stringify(defaultSettings, null, 1).replace(/^ +/, (e) => '\t'.repeat(e.length)),
			'utf-8'
		);
		await this.read();
	}

	private async read() {
		this.resetToBeCommit();

		this.state = await loadJsonFile(this.file);
		await detectSettings(this.state);

		if (this.state.ffmpegExecPath) this.state.ffmpegExecPath = normalizePath(this.state.ffmpegExecPath);
		if (this.state.mediainfoExecPath) this.state.mediainfoExecPath = normalizePath(this.state.mediainfoExecPath);
		if (this.state.whisperModelPath) this.state.whisperModelPath = normalizePath(this.state.whisperModelPath);

		console.log(JSON.stringify(this.state, null, 2));
	}

	async set<T extends keyof IMainSettings>(key: T, value: IMainSettings[T]) {
		if (typeof value !== typeof this.state[key]) throw new TypeError('mismatch data type.');
		if (value === this.state[key]) return;

		this.state[key] = value;
		this.toBeCommit();
	}

	/** @private */
	apply(newData: IMainSettings) {
		Object.assign(this.state, newData);
		this.toBeCommit();
	}

	async commit() {
		if (this.changed) {
			console.log('写入配置');
			await writeJsonFileBack(this.state);
		}

		this.resetToBeCommit();
	}
}

export const settingsStore = new SettingsStore();
let detected = false;
function detectSettings(settings: IMainSettings) {
	if (detected) return;

	detected = true;
	switch (platform()) {
		case 'win32':
			return detectDefaultSettingsWin32(settings);
	}

	return undefined;
}

async function detectDefaultSettingsWin32(settings: IMainSettings) {
	if (!settings.mediainfoExecPath) {
		const mi = await commandInPath('mediainfo');
		settings.mediainfoExecPath = mi || '';
		console.log('[detect] mediainfoExecPath = %s', mi);
	}
	if (!settings.ffmpegExecPath) {
		const ff = await commandInPath('ffmpeg');
		settings.ffmpegExecPath = ff || '';
		console.log('[detect] ffmpegExecPath = %s', ff);
	}
	if (!settings.whisperModelPath) {
		for (const level of ['tiny', 'base', 'small', 'medium', 'large']) {
			const f = resolve(APP_ROOT, `ggml-${level}.bin`);
			if (await exists(f)) {
				settings.whisperModelName = level;
				settings.whisperModelPath = f;
				break;
			}
		}
	}
}
