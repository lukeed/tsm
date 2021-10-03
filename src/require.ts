const { extname } = require('path');
const tsm = require('./utils');

import type { Config } from 'tsm/config';
type TSM = typeof import('./utils.d');

type Module = NodeJS.Module & {
	_compile?(source: string, filename: string): typeof loader;
};

const loadJS = require.extensions['.js'];

let esbuild: typeof import('esbuild');
let env = (tsm as TSM).$defaults('cjs');
let uconf = env.file && require(env.file);
let config: Config = (tsm as TSM).$finalize(env, uconf);

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
