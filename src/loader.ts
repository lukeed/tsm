import * as tsm from 'tsm';
import { existsSync } from 'fs';
import * as url from 'url';

let config: tsm.Config;
let env = tsm.$defaults('esm');
let esbuild: typeof import('esbuild');
let setup = env.file && import(env.file);

type Promisable<T> = Promise<T> | T;
type Source = string | SharedArrayBuffer | Uint8Array;
type Format = 'builtin' | 'commonjs' | 'json' | 'module' | 'wasm';

type Resolve = (
	ident: string,
	context: {
		conditions: string[];
		parentURL?: string;
	},
	fallback: Resolve
) => Promisable<{ url: string }>;

type Inspect = (
	url: string,
	context: object,
	fallback: Inspect
) => Promisable<{ format: Format }>;

type Transform = (
	source: Source,
	context: Record<'url' | 'format', string>,
	fallback: Transform
) => Promisable<{ source: Source }>;

async function load() {
	let mod = await setup;
	mod = mod && mod.default || mod;
	return tsm.$finalize(env.options, mod);
}

const EXTN = /\.\w+(?=\?|$)/;
async function toOptions(uri: string): Promise<tsm.Options|void> {
	config = config || await load();
	let [extn] = EXTN.exec(uri) || [];
	return config[extn as any];
}

const root = url.pathToFileURL(process.cwd() + '/');
export const resolve: Resolve = async function (ident, context, fallback) {
	// ignore "prefix:" and non-relative identifiers
	if (/^\w+\:?/.test(ident)) return fallback(ident, context, fallback);

	let output = new url.URL(ident, context.parentURL || root);
	if (EXTN.test(output.pathname)) return { url: output.href };

	config = config || await load();

	let tmp, ext, path;
	for (ext in config) {
		path = url.fileURLToPath(tmp = output.href + ext);
		if (existsSync(path)) return { url: tmp };
	}

	return fallback(ident, context, fallback);
}

export const getFormat: Inspect = async function (uri, context, fallback) {
	let options = await toOptions(uri);
	if (options == null) return fallback(uri, context, fallback);
	return { format: options.format === 'cjs' ? 'commonjs' : 'module' };
}

export const transformSource: Transform = async function (source, context, xform) {
	let options = await toOptions(context.url);
	if (options == null) return xform(source, context, xform);

	esbuild = esbuild || await import('esbuild');
	let result = await esbuild.transform(source.toString(), {
		...options,
		sourcefile: context.url,
		format: context.format === 'module' ? 'esm' : 'cjs',
	});

	return { source: result.code };
}
