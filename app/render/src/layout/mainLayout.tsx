import { bindThis, promiseBool } from '@idlebox/common';
import { signal } from '@preact/signals';
import { Component } from 'react';
import { BlockUI } from 'primereact/blockui';
import { MenuItem } from 'primereact/menuitem';
import { TabMenu, TabMenuTabChangeEvent } from 'primereact/tabmenu';
import { TopLevelPage } from '../common/state/globalStates';
import { appSettings } from '../common/state/settingsClient';
import { toastErrorRethrow } from '../common/ui-lib/globalToast';
import { ProgressPage } from '../components/ProgressPage/WorkspacePage';
import { SettingsPage } from '../components/SettingsPage/SettingsPage';
import { ToolBoxPage } from '../components/ToolBoxPage/ToolBoxPage';
import { WorkspacePage } from '../components/WorkspacePage/WorkspacePage';

export class MainLayout extends Component {
	private readonly selectedPage = signal(TopLevelPage.Settings);
	private readonly blocked = signal(false);

	@bindThis
	private async setPage(event: TabMenuTabChangeEvent) {
		if (this.selectedPage.value === TopLevelPage.Settings) {
			this.blocked.value = true;
			const pass = await promiseBool(appSettings.verify().catch(toastErrorRethrow));
			this.blocked.value = false;
			if (!pass) return;
		}

		this.selectedPage.value = event.value.id as any;
	}

	override render() {
		const mainTabPages: MenuItem[] = [
			{ id: TopLevelPage.Settings, label: '设置' },
			{ id: TopLevelPage.ToolBox, label: '工具' },
			{ id: TopLevelPage.Workspace, label: '项目' },
			{ id: TopLevelPage.Progress, label: '进度' },
		];

		const commonClass = 'tab-page';
		const currentPage = this.selectedPage.value;

		return (
			<div className="overflow-hidden h-full">
				<BlockUI containerClassName="overflow-hidden h-full flex flex-column" blocked={this.blocked.value}>
					<TabMenu
						className="overflow-visible"
						model={mainTabPages}
						activeIndex={mainTabPages.findIndex((e) => e.id === currentPage)}
						onTabChange={this.setPage}
					/>
					<div className="page-container overflow-x-hidden overflow-y-auto p-4">
						<div
							id="SettingsPage"
							className={commonClass + (currentPage === TopLevelPage.Settings ? '' : ' hidden')}
						>
							<SettingsPage />
						</div>
						<div
							id="WorkspacePage"
							className={commonClass + (currentPage === TopLevelPage.Workspace ? '' : ' hidden')}
						>
							<WorkspacePage />
						</div>
						<div
							id="ProgressPage"
							className={commonClass + (currentPage === TopLevelPage.Progress ? '' : ' hidden')}
						>
							<ProgressPage />
						</div>
						<div
							id="ToolBoxPage"
							className={commonClass + (currentPage === TopLevelPage.ToolBox ? '' : ' hidden')}
						>
							<ToolBoxPage />
						</div>
					</div>
				</BlockUI>
			</div>
		);
	}
}
