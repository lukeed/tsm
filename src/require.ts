const { readFileSync } = require('fs');
const { extname } = require('path');
const tsm = require('./utils');

import type { Config, Extension, Options } from 'tsm/config';
type TSM = typeof import('./utils.d');

type Module = NodeJS.Module & {
	_compile?(source: string, filename: string): typeof loader;
};

const loadJS = require.extensions['.js'];

let esbuild: typeof import('esbuild');
let env = (tsm as TSM).$defaults('cjs');
let uconf = env.file && require(env.file);
let config: Config = (tsm as TSM).$finalize(env, uconf);

declare const $$req: NodeJS.Require;
const tsrequire = 'var $$req=require("module").createRequire(__filename);require=(' + function () {
	let { existsSync } = $$req('fs') as typeof import('fs');
	let $url = $$req('url') as typeof import('url');

	return new Proxy(require, {
		// NOTE: only here if source is TS
		apply(req, ctx, args: [id: string]) {
			let [ident] = args;
			if (!ident) return req.apply(ctx || $$req, args);

			// ignore "prefix:" and non-relative identifiers
			if (/^\w+\:?/.test(ident)) return $$req(ident);

			// exit early if no extension provided
			let match = /\.([mc])?[tj]sx?(?=\?|$)/.exec(ident);
			if (match == null) return $$req(ident);

			let base = $url.pathToFileURL(__filename);
			let file = $url.fileURLToPath(new $url.URL(ident, base));
			if (existsSync(file)) return $$req(ident);

			let extn = match[0] as Extension;
			let rgx = new RegExp(extn + '$');

			// [cm]?jsx? -> [cm]?tsx?
			let tmp = file.replace(rgx, extn.replace('js', 'ts'));
			if (existsSync(tmp)) return $$req(tmp);

			// look for ".[tj]sx" if ".js" given & still here
			if (extn === '.js') {
				tmp = file.replace(rgx, '.tsx');
				if (existsSync(tmp)) return $$req(tmp);

				tmp = file.replace(rgx, '.jsx');
				if (existsSync(tmp)) return $$req(tmp);
			}

			// let it error
			return $$req(ident);
		}
	})
} + ')();';

function transform(source: string, options: Options): string {
	esbuild = esbuild || require('esbuild');
	return esbuild.transformSync(source, options).code;
}

function loader(Module: Module, sourcefile: string) {
	let extn = extname(sourcefile) as Extension;

	let options = config[extn] || {};
	let pitch = Module._compile!.bind(Module);
	options.sourcefile = sourcefile;

	if (/\.[mc]?[tj]sx?$/.test(extn)) {
		options.banner = tsrequire + (options.banner || '');
		// https://github.com/lukeed/tsm/issues/27
		options.supported = options.supported || {};
		options.supported['dynamic-import'] = false;
	}

	if (config[extn] != null) {
		Module._compile = source => {
			let result = transform(source, options);
			return pitch(result, sourcefile);
		};
	}

	try {
		return loadJS(Module, sourcefile);
	} catch (err) {
		let ec = err && (err as any).code;
		if (ec !== 'ERR_REQUIRE_ESM') throw err;

		let input = readFileSync(sourcefile, 'utf8');
		let result = transform(input, { ...options, format: 'cjs' });
		return pitch(result, sourcefile);
	}
}

for (let extn in config) {
	require.extensions[extn] = loader;
}

if (config['.js'] == null) {
	require.extensions['.js'] = loader;
}
