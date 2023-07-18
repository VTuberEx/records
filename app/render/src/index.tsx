import 'preact/debug';
import './common/ui-lib/language';
import { render } from 'react-dom';
import { PrimeReactProvider } from 'primereact/api';
import { MainLayout } from './layout/mainLayout';

render(
	<PrimeReactProvider>
		<MainLayout />
	</PrimeReactProvider>,
	document.getElementById('MainContainer')!
);
