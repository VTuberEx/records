const { dialog, app } = require('electron');

app.on('ready', () => { console.log(' == app ready =='); });
app.on('will-quit', () => { console.log(' == will quit =='); });
app.on('quit', () => { console.log(' == quit =='); });
app.on('before-quit', () => { console.log(' == before quit =='); });
app.on('render-process-gone', () => { console.log(' == render process gone =='); });
app.on('child-process-gone', () => { console.log(' == child process gone =='); });

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

process.stderr.write('\x1Bc');

let t0 = Date.now();
require('source-map-support/register');
console.log('[perf] load time: %dms', Date.now() - t0);

t0 = Date.now();
const { app_main_function } = require('./lib/main.js');
console.log('[perf] load time: %dms', Date.now() - t0);

t0 = Date.now();
app_main_function().finally(() => {
	console.log('[perf] startup time: %dms', Date.now() - t0);
}).catch(die);

function die(e) {
	console.error('致命错误', e);
	dialog.showErrorBox('启动过程出错', e.stack);
	app.quit(1);
}
