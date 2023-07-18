const path = require('path');
const myNodeTypes = require('./app/main/package.json').devDependencies['@types/node'];
const myDeps = {};
const renderPkg = require('./app/render/package.json');

Object.assign(myDeps, renderPkg.dependencies, renderPkg.devDependencies);

const ROOT_DIR = path.resolve(__dirname, '../..');

function readPackage(pkg, context) {
	if (pkg.name.startsWith('@app/')) {
		return pkg;
	}

	for (const n of ['react', 'react-dom', '@types/react', '@types/react-dom', '@types/node']) {
		for (const d of [pkg.dependencies, pkg.devDependencies, pkg.peerDependencies]) {
			delete d[n];
		}
	}

	return pkg;
}

module.exports = {
	hooks: {
		readPackage
	}
};
