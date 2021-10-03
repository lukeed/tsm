const { extname } = require('path');
const tsm = require('./utils');

import type { Config } from 'tsm/config';

type Module = NodeJS.Module & {
	_compile?(source: string, filename: string): typeof loader;
};

const loadJS = require.extensions['.js'];

let esbuild: typeof import('esbuild');
let { file, options } = tsm.$defaults('cjs');
let config: Config = tsm.$finalize(options, file && require(file));

function loader(Module: Module, sourcefile: string) {
	let extn = extname(sourcefile);
	let pitch = Module._compile!.bind(Module);

	Module._compile = source => {
		let options = config[extn];
		if (options == null) return pitch(source, sourcefile);

		esbuild = esbuild || require('esbuild');
		let result = esbuild.transformSync(source, { ...options, sourcefile });
		return pitch(result.code, sourcefile);
	};

	return loadJS(Module, sourcefile);
}

for (let extn in config) {
	require.extensions[extn] = loader;
}
