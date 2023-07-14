import { Component } from 'react';
import { className } from './button.scss';

export class Button extends Component {
	render() {
		return (
			<div class={className}>
				<label>
					TODO:
					<button>123</button>
				</label>
			</div>
		);
	}
}
