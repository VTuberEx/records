import { app, Event } from 'electron';

interface ICallback {
	(): Promise<any>;
}

class AppShutdownHandler {
	private quitting = false;
	private readonly handlers: ICallback[] = [];
	constructor() {
		app.on('will-quit', this.onWillQuit.bind(this));
	}

	private async onWillQuit(e: Event) {
		console.log('[EVENT] will-qiut: quitting=%s, callbacks=%s', this.quitting, this.handlers.length);
		if (this.quitting) {
			return app.exit(1);
		} else if (this.handlers.length > 0) {
			e.preventDefault();
		} else {
			return;
		}

		this.quitting = true;
		for (const cb of this.handlers) {
			await cb().catch((e) => {
				console.error('清理过程出错', e);
			});
		}
		this.handlers.length = 0;
		this.quitting = false;
		console.error('清理完成');

		app.quit();
	}

	register(cb: ICallback) {
		this.handlers.push(cb);
	}
}

export const shutdown = new AppShutdownHandler();
