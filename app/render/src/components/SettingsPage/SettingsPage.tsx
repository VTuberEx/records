import { Component } from 'react';
import { PrimeIcons } from 'primereact/api';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { Panel } from 'primereact/panel';
import { electronAPI } from '../../common/electron/bridge';
import { appSettings } from '../../common/state/settings';
import { disableEvent } from '../../common/uitls/events';

export class SettingsPage extends Component {
	override render() {
		return (
			<div className="flex flex-column gap-4">
				<Panel header="自动下载" icons={<i className={PrimeIcons.BOOKMARK} />} toggleable={false}>
					<form className="cc" onSubmit={disableEvent}>
						<div className="p-inputgroup">
							<label htmlFor="proxy" className="p-inputgroup-addon">
								代理服务器
							</label>
							<InputText
								id="proxy"
								placeholder="http|socks5://user:pass@host:port"
								{...appSettings.getInputProps('proxyServer')}
							/>
							<Button icon="pi pi-question" severity="secondary" label="测试" disabled />
						</div>
						<div className="cr">
							<Button icon="pi pi-cloud-download" severity="secondary" label="ffmpeg" disabled />
							<Button icon="pi pi-cloud-download" severity="secondary" label="mediainfo" disabled />
							<Button icon="pi pi-cloud-download" severity="secondary" label="ggml-medium.bin" disabled />
						</div>
					</form>
				</Panel>
				<Panel header="基础工具">
					<form className="cc" onSubmit={disableEvent}>
						<div className="p-inputgroup">
							<label htmlFor="ffmpeg-path" className="p-inputgroup-addon">
								ffmpeg路径
							</label>
							<InputText
								id="ffmpeg-path"
								placeholder="输入路径、拖动exe，或者点右边打开"
								{...appSettings.getInputProps('ffmpegExecPath')}
							/>
							<Button icon="pi pi-folder-open" severity="secondary" disabled />
						</div>

						<div className="p-inputgroup">
							<label htmlFor="mediainfo-path" className="p-inputgroup-addon">
								mediainfo路径
							</label>
							<InputText
								id="mediainfo-path"
								placeholder="输入路径、拖动exe，或者点右边打开"
								{...appSettings.getInputProps('mediainfoExecPath')}
							/>
							<Button icon="pi pi-folder-open" severity="secondary" disabled />
						</div>
					</form>
				</Panel>
				<Panel header="Whisper设置">
					<form className="cc" onSubmit={disableEvent}>
						<div className="p-inputgroup">
							<label htmlFor="wisper-model-path" className="p-inputgroup-addon">
								模型路径
							</label>
							<InputText
								id="wisper-model-path"
								placeholder="输入路径、拖动bin文件，或者点右边打开"
								{...appSettings.getInputProps('whisperModelPath')}
							/>
							<Dropdown
								id="wisper-model-type"
								{...appSettings.getComboboxProps('whisperModelName')}
								options={['tiny', 'base', 'small', 'medium', 'large'].map((e) => ({
									value: e,
									label: e,
								}))}
								placeholder="选择模型类型（不推荐修改）"
								className="flex-grow-0 w-2"
							/>
							<Button icon="pi pi-folder-open" severity="secondary" />
						</div>
						<div className="cr">
							<div className="p-inputgroup flex-grow-0 w-2">
								<label htmlFor="wisper-lang" className="p-inputgroup-addon">
									语言
								</label>
								<Dropdown id="wisper-lang" disabled options={[]} placeholder="" />
							</div>
						</div>
					</form>
				</Panel>
				<Panel header="程序设置">
					<form className="cc" onSubmit={disableEvent}>
						<div className="cr">
							<div className="p-inputgroup flex-grow-0 w-5">
								<label htmlFor="gap-time" className="p-inputgroup-addon">
									中断时长小于
								</label>
								<InputNumber
									{...appSettings.getInputNumberProps('recordGapMinutes')}
									inputId="gap-time"
									name="gap-time"
									placeholder=""
									mode="decimal"
									min={0}
									useGrouping={false}
								/>
								<label htmlFor="gap-time" className="p-inputgroup-addon">
									分钟，判定为同一场直播
								</label>
							</div>

							<label className="flex align-items-center w-2">
								<Checkbox
									{...appSettings.getCheckboxProps('recordIgnoreTitle')}
									name="ignore-title-change"
									value="yes"
								/>
								<span>无视标题发生改变</span>
							</label>
						</div>

						<Divider />
						<div className="cr">
							<Button
								size="small"
								label="重新启动软件"
								severity="secondary"
								onClick={electronAPI.relaunch}
							/>
							<Button disabled size="small" label="重置本页内容" severity="warning" />
						</div>
						<div className="cr">
							<Button
								size="small"
								label="删除文件并退出"
								severity="danger"
								onClick={electronAPI.uninstall}
							/>

							<Message text="这会删除所有向系统中添加的数据，例如注册表、程序配置、缓存文件。但不包括程序本身、用户制作的内容。" />
						</div>
					</form>
				</Panel>
			</div>
		);
	}
}
