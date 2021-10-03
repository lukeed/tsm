import type { TransformOptions } from 'esbuild';
export type Options = TransformOptions;

export type Config = {
	[extn: `.${string}`]: Options;
}

/**
 * TypeScript helper for writing `tsm.js` contents.
 */
export function define(config: Config): Config;
