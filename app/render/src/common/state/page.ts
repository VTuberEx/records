import { globalState, TopLevelPage } from './globalStates';

export const globalStateTabPage = {
	compute() {
		const isWorking = globalState.isWorking.value;
		if (isWorking) return { isWorking, page: TopLevelPage.Progress };

		switch (globalState.selectedPage.value) {
			case TopLevelPage.ToolBox:
				return { isWorking, page: TopLevelPage.ToolBox };
			case TopLevelPage.Workspace:
				return { isWorking, page: TopLevelPage.Workspace };
			default:
				return { isWorking, page: TopLevelPage.Settings };
		}
	},
	update(page: TopLevelPage) {
		globalState.selectedPage.value = page;
	},

	isActive(self: TopLevelPage) {
		const { page } = this.compute();
		return self === page;
	},
};
