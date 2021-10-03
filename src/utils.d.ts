import type { Format } from 'esbuild';
import type { Config, Options } from '../config';

export function $defaults(format?: Format): {
	file: string | false;
	options: Options;
}

export function $finalize(base: Options, custom?: Config): Config;
