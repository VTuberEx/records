import type { IIFileInfo, ICutSection } from '@app/protocol';
import { Signal, signal } from '@preact/signals';

export enum TopLevelPage {
	Settings = 'settings',
	Workspace = 'workspace',
	Progress = 'progress',
	ToolBox = 'toolbox',
}

const state = {
	isWorking: signal(false),
	selectedPage: signal(TopLevelPage.Settings),
	workingDirectory: signal(''),
	recordCollectionInfo: {
		sourceFolder: signal(''),
		selectedRecordGuid: signal(''),
		files: signal<IIFileInfo[]>([]),
		playhead: {
			logicalTime: signal(0),
		},
		sections: signal<ICutSection[]>([]),
	},
};

type DeepReadonly<T> = T extends Signal
	? T
	: {
			readonly [P in keyof T]: DeepReadonly<T[P]>;
	  };

export type IGlobalState = DeepReadonly<typeof state>;
export const globalState: IGlobalState = state;
