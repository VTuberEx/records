export interface ISystemSetting {
	readonly proxyServer: string;
	readonly ffmpegExecPath: string;
	readonly mediainfoExecPath: string;
	readonly whisperModelPath: string;
	readonly whisperModelName: string;
	readonly whisperLanguage: string;
	readonly recordGapMinutes: number;
	readonly recordIgnoreTitle: boolean;
	readonly opTime: number;
	readonly opTimeIsSec: boolean;
	readonly opShowRoom: boolean;
}

export interface ISettingVerify {
	readonly ffmpegVersion: string;
	readonly mediainfoVersion: string;
	readonly errors: readonly string[];
}

export interface IElectronAPI {
	loadSettings(): Promise<ISystemSetting>;
	updateSettings<T extends keyof ISystemSetting>(key: T, value: ISystemSetting[T]): Promise<void>;
	uninstall(): never;
	relaunch(): Promise<boolean>;
	verifySettings(): Promise<void>;
}

export interface IElectronEvents {
	on(name: string, callback: Function): void;
	once(name: string, callback: Function): void;
	off(name: string, callback: Function): void;
	removeAllListeners(name: string): void;
}

export type ProtocolEvent = 'focus';

export interface ITimeSection {
	start: number;
	end: number;
}

export interface ICutSection extends ITimeSection {
	title: string;
	comment: string;
	color: string;
}

export interface IIFileInfo {
	time: {
		physical: ITimeSection;
		logical: ITimeSection;
		length: number;
	};
	file: {
		index: number;
		path: string;
		bytes: number;
	};
	video: {
		frameCount: number;
		fps: number;
		width: number;
		height: number;
		bytes: number;
	};
	audio: {
		bitRate: number;
		channel: number;
		sampleRate: number;
		bytes: number;
	};
	live: {
		title: string;
		liver: string;
		roomId: number;
	};

	rawMediaInfo: any;
}
