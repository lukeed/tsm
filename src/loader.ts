import * as tsm from 'tsm';

let config: tsm.Config;
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

const EXTN = /\.\w+(?=\?|$)/;
async function toOptions(url: string): Promise<tsm.Options|void> {
	config = config || await tsm.options('esm');
	let [extn] = EXTN.exec(url) || [];
	return config[extn as any];
}

export const getFormat: Inspect = async (url, context, fallback) => {
	let options = await toOptions(url);
	if (options == null) return fallback(url, context, fallback);
	return { format: options.format === 'cjs' ? 'commonjs' : 'module' };
}

export const transformSource: Transform = async (source, context, xform) => {
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
