import { render } from 'react';
import { Button } from './components/button';

console.log('hello');

render(
	<div>
		<Button />
	</div>,
	document.getElementById('MainContainer')!
);
