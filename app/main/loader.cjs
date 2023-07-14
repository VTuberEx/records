const { dialog, app } = require('electron');

app.on('ready', () => { console.log(' == app ready =='); });

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

process.stderr.write('\x1Bc');

try {
	require('source-map-support/register');
	require('@gongt/fix-esm').register();
	require('./lib/main.js');
} catch (e) {
	console.error(e);
	dialog.showErrorBox('启动过程出错', e.stack);
	app.quit(1);
}