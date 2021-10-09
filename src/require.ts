const { extname } = require('path');
const { readFileSync } = require('fs');
const tsm = require('./utils');

import type { Config, Options } from 'tsm/config';
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
} + ')();';

function transform(source: string, sourcefile: string, options: Options): string {
	let banner = options.banner || '';
	if (/\.[mc]?tsx?$/.test(sourcefile)) {
		banner = tsrequire + banner;
	}

	esbuild = esbuild || require('esbuild');
	return esbuild.transformSync(source, {
		...options, banner, sourcefile
	}).code;
}

function loader(Module: Module, sourcefile: string) {
	let pitch = Module._compile!.bind(Module);
	let extn = extname(sourcefile);
	let options = config[extn];

	if (options != null) {
		Module._compile = source => {
			let result = transform(source, sourcefile, options);
			return pitch(result, sourcefile);
		};
	}

	try {
		return loadJS(Module, sourcefile);
	} catch (err) {
		let ec = err && (err as any).code;
		if (ec !== 'ERR_REQUIRE_ESM') throw err;

		let input = readFileSync(sourcefile, 'utf8');
		let result = transform(input, sourcefile, {
			...options, format: 'cjs'
		});

		return pitch(result, sourcefile);
	}
}

for (let extn in config) {
	require.extensions[extn] = loader;
}

if (config['.js'] == null) {
	require.extensions['.js'] = loader;
}
