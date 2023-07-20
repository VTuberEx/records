import 'preact/debug';
import './common/ui-lib/language';
import { render } from 'react-dom';
import { PrimeReactProvider } from 'primereact/api';
import { electronEvents } from './common/electron/bridge';
import { appSettings } from './common/state/settingsClient';
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

electronEvents.on('focus', (isFocus: boolean) => {
	if (isFocus) {
		document.body.classList.remove('inactive');
	} else {
		document.body.classList.add('inactive');
	}
});
