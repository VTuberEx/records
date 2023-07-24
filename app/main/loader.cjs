const { dialog, app } = require('electron');

try {
	const t0 = Date.now();

	app.on('ready', () => { console.log(' == app ready =='); });
	app.on('will-quit', () => { console.log(' == will quit =='); });
	app.on('quit', () => { console.log(' == quit =='); });
	app.on('before-quit', () => { console.log(' == before quit =='); });
	app.on('render-process-gone', () => { console.log(' == render process gone =='); });
	app.on('child-process-gone', () => { console.log(' == child process gone =='); });

	process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

	console.error('\x1Bc\x1B[2m', ...process.argv.map(value => JSON.stringify(value)), '\x1B[0m');

	if (!process.argv.some(a => a.startsWith('--inspect'))) {
		require('source-map-support/register');
	}
	const { app_main_function } = require('./lib/main.js');
	console.log('[perf] load time: %dms', Date.now() - t0);

	app_main_function().finally(() => {
		console.log('[perf] startup time: %dms', Date.now() - t0);
	}).catch(die);
} catch (e) {
	die(e);
}

function die(e) {
	console.error('致命错误', e);
	dialog.showErrorBox('启动过程出错', e.stack);
	app.quit(1);
}
