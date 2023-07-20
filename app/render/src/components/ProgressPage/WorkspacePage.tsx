import { Component } from 'react';
import { Card } from 'primereact/card';
import { ProgressBar } from 'primereact/progressbar';
import { Button } from 'primereact/button';

const bar_size = '100px';

export class ProgressPage extends Component {
	override render() {
		return (
			<>
				<Card className="fixed bottom-0 left-0 w-full" style={{ height: bar_size }}>
					<div className="flex flex-row gap-1">
						<div className="flex-grow-1 flex flex-column justify-content-between">
							<ProgressBar mode="indeterminate" style={{ height: '12px' }} />
							<ProgressBar mode="indeterminate" style={{ height: '12px' }} />
						</div>
						<Button label='test' />
					</div>
				</Card>
				<div className="cc">
					<div className="p-terminal p-component h-auto">
						<div className="p-terminal-content">
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
							<div>wow!</div>
						</div>
					</div>

					<div className="" style={{ height: bar_size }}>
						&nbsp;
					</div>
				</div>
			</>
		);
	}
}
