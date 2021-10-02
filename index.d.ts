import type { Format, TransformOptions } from 'esbuild';
export type Options = TransformOptions;

export type Config = {
	[extn: `.${string}`]: Options;
}

/**
 * TypeScript helper for writing `tsm.js` contents.
 */
export function define(config: Config): Config;

/**
 * Analyze ENV and ARGV for default Config object.
 * @note internal utility
 */
export function $defaults(format?: Format): {
	file: string | false;
	options: Options;
}

/**
 * Convert `Options` into `Config` and merge w/ custom `Config` object.
 * @note internal utility
 */
export function $finalize(base: Options, custom?: Config): Config;
