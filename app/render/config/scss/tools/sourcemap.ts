import { dirname, isAbsolute } from 'path';
import { fileURLToPath } from 'url';
import { relativePath } from '@idlebox/node';
import { CompileResult } from 'sass';

export type RawSourceMap = Required<CompileResult>['sourceMap'];

export function inlineSourceMap({ ...sourceMap }: RawSourceMap, sourceRoot: string, entryFile: string) {
	fixSourceMap(sourceMap, sourceRoot, entryFile);

	// console.log(sourceMap?.sources);

	const smTxt = JSON.stringify(sourceMap);

	let output = '\n\n';
	// output += '/*' + smTxt + '*/\n\n';
	output += '/*# sourceMappingURL=data:application/json;charset=utf-8;';
	output += 'base64,' + base64(smTxt);
	output += ' */\n';

	return output;
}

function base64(txt: string) {
	return Buffer.from(txt, 'utf-8').toString('base64');
}

export function fixSourceMap(sm: RawSourceMap, sourceRoot: string, entryFile: string) {
	sm.sourceRoot = sourceRoot;

	sm.sources = sm.sources?.map((file) => {
		if (file.startsWith('file://')) {
			file = fileURLToPath(file);
		}
		if (isAbsolute(file)) {
			file = relativePath(dirname(entryFile), file);
		}
		return file;
	});

	delete sm.file;
}
