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
	shortCircuit: boolean;
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

type LoadResult = Promisable<{
	format: Format;
	shortCircuit: boolean;
	source: Source;
}>

type Load = (
	url: string,
	context: { format?: Format },
	fallback: (url: string, context: { format?: Format }) => LoadResult
) => LoadResult;

async function toConfig(): Promise<Config> {
	let mod = await setup;
	mod = mod && mod.default || mod;
	return (tsm as TSM).$finalize(env, mod);
}

const EXTN = /\.\w+(?=\?|$)/;
const isTS = /\.[mc]?tsx?(?=\?|$)/;

async function toOptions(uri: string): Promise<Options|void> {
	config = config || await toConfig();
	let [extn] = EXTN.exec(uri) || [];
	return config[extn as `.${string}`];
}

function check(fileurl: string): string | void {
	let tmp = fileURLToPath(fileurl);
	if (existsSync(tmp)) return fileurl;
}

/**
 * extension aliases; runs after checking for extn on disk
 * @example `import('./foo.mjs')` but only `foo.mts` exists
 */
const MAPs: Record<Extension, Extension[]> = {
	'.js': ['.ts', '.tsx', '.jsx'],
	'.jsx': ['.tsx'],
	'.mjs': ['.mts'],
	'.cjs': ['.cts'],
};

const root = new URL('file:///' + process.cwd() + '/');
export const resolve: Resolve = async function (ident, context, fallback) {
	// ignore "prefix:", non-relative identifiers, and subpath imports
	if (/^\w+\:?/.test(ident) || ident.startsWith('#')) return fallback(ident, context, fallback);

	let target = new URL(ident, context.parentURL || root);
	let ext: Extension, path: string | void, arr: Extension[];
	let match: RegExpExecArray | null, i=0, base: string;

	// source ident includes extension
	if (match = EXTN.exec(target.href)) {
		ext = match[0] as Extension;
		if (!context.parentURL || isTS.test(ext)) {
			return { url: target.href, shortCircuit: true };
		}

		// target ident exists
		if (path = check(target.href)) {
			return { url: path, shortCircuit: true };
		}

		// target is virtual alias
		if (arr = MAPs[ext]) {
			base = target.href.substring(0, match.index);
			for (; i < arr.length; i++) {
				if (path = check(base + arr[i])) {
					i = match.index + ext.length;
					return {
						shortCircuit: true,
						url: i > target.href.length
							// handle target `?args` trailer
							? base + target.href.substring(i)
							: path
					};
				}
			}
		}

		// return original behavior, let it error
		return fallback(ident, context, fallback);
	}

	config = config || await toConfig();

	for (ext in config) {
		path = check(target.href + ext);
		if (path) return { url: path, shortCircuit: true };
	}

	return fallback(ident, context, fallback);
}

export const load: Load = async function (uri, context, fallback) {
	// note: inline `getFormat`
	let options = await toOptions(uri);
	if (options == null) return fallback(uri, context);
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

	return { format, source: result.code, shortCircuit: true };
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
