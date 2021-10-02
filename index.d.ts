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
 * Generates full `Config` with defaults and custom file.
 * @note internal utility
 */
export function options(format?: Format): Promise<Config>;
