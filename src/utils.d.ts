import type { Format } from 'esbuild';
import type { Config, Options } from './config';

export interface Defaults {
	file: string | false;
	isESM: boolean;
	options: Options;
}

export function $defaults(format: Format): Defaults;
export function $finalize(env: Defaults, custom?: Config): Config;
