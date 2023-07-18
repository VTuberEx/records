import { Plugin } from 'esbuild';

export function SkipElectronPlugin(): Plugin {
	return {
		name: 'skip-electron',
		setup(build) {
			build.onResolve({ filter: /^(electron)($|\/)/ }, (args) => {
				return {
					path: args.path,
					namespace: 'electron',
					sideEffects: true,
				};
			});
			build.onLoad({ filter: /^(electron)($|\/)/ }, (args) => {
				return {
					loader: 'js',
					contents: `module.exports = eval('require')(${JSON.stringify(args.path)});`,
				};
			});
		},
	};
}
