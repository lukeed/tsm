import { existsSync, promises as fs } from 'fs';
import { fileURLToPath, URL } from 'url';
import * as tsm from './utils.js';

import type { Config, Extension, Options } from 'tsm/config';
type TSM = typeof import('./utils.d');

let config: Config;
let esbuild: typeof import('esbuild');

let env = (tsm as TSM).$defaults('esm');
let setup = env.file && import('file:///' + env.file);

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
) => Promisable<{
	url: string;
	format?: Format;
}>;

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

type Load = (
	url: string,
	context: { format?: Format },
	fallback: Load
) => Promisable<{
	format: Format;
	source: Source;
}>;

async function toConfig(): Promise<Config> {
	let mod = await setup;
	mod = mod && mod.default || mod;
	return (tsm as TSM).$finalize(env, mod);
}

const EXTN = /\.\w+(?=\?|$)/;
const isTS = /\.[mc]?tsx?(?=\?|$)/;
const isJS = /\.([mc])?js$/;
async function toOptions(uri: string): Promise<Options|void> {
	config = config || await toConfig();
	let [extn] = EXTN.exec(uri) || [];
	return config[extn as `.${string}`];
}

function check(fileurl: string): string | void {
	let tmp = fileURLToPath(fileurl);
	if (existsSync(tmp)) return fileurl;
}

const root = new URL('file:///' + process.cwd() + '/');
export const resolve: Resolve = async function (ident, context, fallback) {
	// ignore "prefix:" and non-relative identifiers
	if (/^\w+\:?/.test(ident)) return fallback(ident, context, fallback);

	let match: RegExpExecArray | null;
	let idx: number, ext: Extension, path: string | void;
	let output = new URL(ident, context.parentURL || root);

	// source ident includes extension
	if (match = EXTN.exec(output.href)) {
		ext = match[0] as Extension;
		if (!context.parentURL || isTS.test(ext)) {
			return { url: output.href };
		}
		// source ident exists
		path = check(output.href);
		if (path) return { url: path };
		// parent importer is a ts file
		// source ident is js & NOT exists
		if (isJS.test(ext) && isTS.test(context.parentURL)) {
			// reconstruct ".js" -> ".ts" source file
			path = output.href.substring(0, idx = match.index);
			if (
        (path =
          check(path + ext.replace("js", "ts")) ||
          check(path + ext.replace("js", "tsx")))
			) {
				idx += ext.length;
				if (idx > output.href.length) {
					path += output.href.substring(idx);
				}
				return { url: path };
			}
			// return original, let it error
			return fallback(ident, context, fallback);
		}
	}

	config = config || await toConfig();

	for (ext in config) {
		path = check(output.href + ext);
		if (path) return { url: path };
	}

	return fallback(ident, context, fallback);
}

export const load: Load = async function (uri, context, fallback) {
	// note: inline `getFormat`
	let options = await toOptions(uri);
	if (options == null) return fallback(uri, context, fallback);
	let format: Format = options.format === 'cjs' ? 'commonjs' : 'module';

	// TODO: decode SAB/U8 correctly
	let path = fileURLToPath(uri);
	let source = await fs.readFile(path);

	// note: inline `transformSource`
	esbuild = esbuild || await import('esbuild');
	let result = await esbuild.transform(source.toString(), {
		...options,
		sourcefile: path,
		format: format === 'module' ? 'esm' : 'cjs',
	});

	return { format, source: result.code };
}

/** @deprecated */
export const getFormat: Inspect = async function (uri, context, fallback) {
	let options = await toOptions(uri);
	if (options == null) return fallback(uri, context, fallback);
	return { format: options.format === 'cjs' ? 'commonjs' : 'module' };
}

/** @deprecated */
export const transformSource: Transform = async function (source, context, xform) {
	let options = await toOptions(context.url);
	if (options == null) return xform(source, context, xform);

	// TODO: decode SAB/U8 correctly
	esbuild = esbuild || await import('esbuild');
	let result = await esbuild.transform(source.toString(), {
		...options,
		sourcefile: context.url,
		format: context.format === 'module' ? 'esm' : 'cjs',
	});

	return { source: result.code };
}
