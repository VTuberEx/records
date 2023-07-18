import { Component } from 'react';
import { MenuItem } from 'primereact/menuitem';
import { TabMenu } from 'primereact/tabmenu';
import { TopLevelPage } from '../common/state/globalStates';
import { globalStateTabPage } from '../common/state/page';
import { ProgressPage } from '../components/ProgressPage/WorkspacePage';
import { SettingsPage } from '../components/SettingsPage/SettingsPage';
import { ToolBoxPage } from '../components/ToolBoxPage/ToolBoxPage';
import { WorkspacePage } from '../components/WorkspacePage/WorkspacePage';
import { className } from './mainLayout.scss';

export class MainLayout extends Component {
	override render() {
		const { page, isWorking } = globalStateTabPage.compute();

		const mainTabPages: MenuItem[] = [
			{ id: TopLevelPage.Settings, disabled: isWorking, label: '设置' },
			{ id: TopLevelPage.ToolBox, disabled: isWorking, label: '工具' },
			{ id: TopLevelPage.Workspace, disabled: isWorking, label: '项目' },
			{ id: TopLevelPage.Progress, disabled: !isWorking, label: '进度' },
		];

		const commonClass = 'p-5';

		return (
			<div className={className}>
				<TabMenu
					model={mainTabPages}
					activeIndex={mainTabPages.findIndex((e) => e.id === page)}
					onTabChange={(e) => {
						globalStateTabPage.update(e.value.id as TopLevelPage);
					}}
				/>
				<div id="SettingsPage" className={commonClass + (page === TopLevelPage.Settings ? '' : ' hidden')}>
					<SettingsPage />
				</div>
				<div id="WorkspacePage" className={commonClass + (page === TopLevelPage.Workspace ? '' : ' hidden')}>
					<WorkspacePage />
				</div>
				<div id="ProgressPage" className={commonClass + (page === TopLevelPage.Progress ? '' : ' hidden')}>
					<ProgressPage />
				</div>
				<div id="ToolBoxPage" className={commonClass + (page === TopLevelPage.ToolBox ? '' : ' hidden')}>
					<ToolBoxPage />
				</div>
			</div>
		);
	}
}

/*

			<div className="flex flex-row h-full">
				<div className="menu md:w-16rem h-full">
					<DateSelectList />
				</div>
				<div className="main flex-grow-1 h-full"></div>
			</div>
			*/
