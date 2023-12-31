import type { HeftConfiguration, IHeftLifecyclePlugin, IHeftLifecycleSession } from '@rushstack/heft';

export default class ClearScreenPlugin implements IHeftLifecyclePlugin {
	apply(
		session: IHeftLifecycleSession,
		_heftConfiguration: HeftConfiguration,
		_pluginOptions?: void | undefined
	): void {
		session.hooks.toolStart.tap('clear-screen', () => {
			if (process.stderr.isTTY) process.stderr.write('\x1Bc');
		});
	}
}
