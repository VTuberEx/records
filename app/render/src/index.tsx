import 'preact/debug';
import './common/ui-lib/language';
import { render } from 'react-dom';
import { PrimeReactProvider } from 'primereact/api';
import { appSettings } from './common/state/settings';
import { GlobalToast } from './common/ui-lib/globalToast';
import { MainLayout } from './layout/mainLayout';

appSettings.load();

render(
	<PrimeReactProvider>
		<GlobalToast />
		<MainLayout />
	</PrimeReactProvider>,
	document.getElementById('MainContainer')!
);
