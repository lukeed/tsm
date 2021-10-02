// import { URL } from 'url';

// const { FORCE_COLOR, NO_COLOR, NODE_DISABLE_COLORS } = process.env;
const version = process.versions.node;

let esbuild: typeof import('esbuild');

type Promisable<T> = Promise<T> | T;
type Source = string | SharedArrayBuffer | Uint8Array;
type Format = 'builtin' | 'commonjs' | 'json' | 'module' | 'wasm';

type Inspect = (
	url: string,
	context: object,
	defaultInspect: Inspect
) => Promisable<{ format: Format }>;

type Transform = (
	source: Source,
	context: Record<'url' | 'format', string>,
	defaultTransform: Transform
) => Promisable<{ source: Source }>;

export const getFormat: Inspect = (url, context, fallback) => {
	if (/\.(tsx?|mjs|jsx|json)(\?|$)/.test(url)) return { format: 'module' };
	return fallback(url, context, fallback);
}

export const transformSource: Transform = async (source, context, xform) => {
	// TODO: config check extensions -> do something?
	// let { pathname } = new URL(context.url);
	// if (no match) return xform(source, context, xform);

	esbuild = esbuild || await import('esbuild');
	let result = await esbuild.transform(source.toString(), {
		format: context.format === 'module' ? 'esm' : 'cjs',
		target: 'node' + version,
		sourcefile: context.url,
		logLevel: 'warning', // TODO: --verbose
		color: true, // TODO: FORCE_COLOR > NO_COLOR/NODE_DISABLE_COLORS
		sourcemap: 'inline',
		loader: 'tsx' // TODO
	});

	return { source: result.code };
}
