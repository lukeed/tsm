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

declare const $$req: NodeJS.Require;
const tsrequire = 'var $$req=require;require=(' + function () {
	let { existsSync } = $$req('fs');
	let { URL, pathToFileURL } = $$req('url');

	return new Proxy($$req, {
		// NOTE: only here if source is TS
		apply(req, ctx, args: [id: string]) {
			let [ident] = args;
			if (!ident) return req.apply(ctx || $$req, args);

			// ignore "prefix:" and non-relative identifiers
			if (/^\w+\:?/.test(ident)) return $$req(ident);

			// exit early if no extension provided
			let match = /\.([mc])?js(?=\?|$)/.exec(ident);
			if (match == null) return $$req(ident);

			let base = pathToFileURL(__filename) as import('url').URL;
			let file = new URL(ident, base).pathname as string;
			if (existsSync(file)) return $$req(ident);

			// ?js -> ?ts file
			file = file.replace(
				new RegExp(match[0] + '$'),
				match[0].replace('js', 'ts')
			);

			// return the new "[mc]ts" file, or let error
			return existsSync(file) ? $$req(file) : $$req(ident);
		}
	})
} + ')();'

function loader(Module: Module, sourcefile: string) {
	let extn = extname(sourcefile);
	let pitch = Module._compile!.bind(Module);

	Module._compile = source => {
		let options = config[extn];
		if (options == null) return pitch(source, sourcefile);

		let banner = options.banner || '';
		if (/\.[mc]?tsx?$/.test(extn)) {
			banner = tsrequire + banner;
		}

		esbuild = esbuild || require('esbuild');
		let result = esbuild.transformSync(source, { ...options, banner, sourcefile });
		return pitch(result.code, sourcefile);
	};

	return loadJS(Module, sourcefile);
}

for (let extn in config) {
	require.extensions[extn] = loader;
}
