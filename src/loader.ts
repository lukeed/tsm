import * as tsm from 'tsm';
import { existsSync } from 'fs';
import { URL, fileURLToPath } from 'url';

let config: tsm.Config;
let esbuild: typeof import('esbuild');

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

async function load(): Promise<tsm.Config> {
	let { file, options } = tsm.$defaults('esm');
	let m = file && await import('file:///' + file);
	return tsm.$finalize(options, m && m.default || m);
}

const EXTN = /\.\w+(?=\?|$)/;
async function toOptions(url: string): Promise<tsm.Options|void> {
	config = config || await load();
	let [extn] = EXTN.exec(url) || [];
	return config[extn as any];
}

const root = new URL('file:///' + process.cwd() + '/');
export const resolve: Resolve = async function (ident, context, fallback) {
	// ignore "prefix:" and non-relative identifiers
	if (/^\w+\:?/.test(ident)) return fallback(ident, context, fallback);

	let output = new URL(ident, context.parentURL || root);
	if (EXTN.test(output.pathname)) return { url: output.href };

	config = config || await load();

	let tmp, ext, path;
	for (ext in config) {
		path = fileURLToPath(tmp = output.href + ext);
		if (existsSync(path)) return { url: tmp };
	}

	return fallback(ident, context, fallback);
}

export const getFormat: Inspect = async function (url, context, fallback) {
	let options = await toOptions(url);
	if (options == null) return fallback(url, context, fallback);
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
