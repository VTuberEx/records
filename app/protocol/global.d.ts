export interface ISystemSetting {
	readonly proxyServer: string;
	readonly ffmpegExecPath: string;
	readonly mediainfoExecPath: string;
	readonly whisperModelPath: string;
	readonly whisperModelName: string;
	readonly whisperLanguage: string;
	readonly recordGapMinutes: number;
	readonly recordIgnoreTitle: boolean;
}

export interface IElectronAPI {
	loadSettings(): Promise<ISystemSetting>;
	updateSettings<T extends keyof ISystemSetting>(key: T, value: ISystemSetting[T]): Promise<void>;
	uninstall(): never;
	verifySettings(): Promise<void>;
}

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
