// @ts-check
const { resolve } = require('path');
const { existsSync } = require('fs');

import type { Format, LogLevel } from 'esbuild';
import type { Config, Options } from 'tsm/config';

exports.$defaults = function (format?: Format): {
	file: string | false,
	options: Options,
} {
	let { FORCE_COLOR, NO_COLOR, NODE_DISABLE_COLORS, TERM } = process.env;

	let argv = process.argv.slice(2);

	let flags = new Set(argv);
	let idx = flags.has('--config') ? argv.indexOf('--config') : -1;
	let file = resolve('.', !!~idx && argv[++idx] || 'tsm.js');

	// @see lukeed/kleur
	let enabled = !NODE_DISABLE_COLORS && NO_COLOR == null && TERM !== 'dumb' && (
		FORCE_COLOR != null && FORCE_COLOR !== '0' || process.stdout.isTTY
	);

	let level: LogLevel = (flags.has('-q')||flags.has('--quiet')) ? 'silent'
		: (flags.has('-V')||flags.has('--verbose')) ? 'verbose'
		: 'warning';

	return {
		file: existsSync(file) && file,
		options: {
			format: format,
			charset: 'utf8',
			sourcemap: 'inline',
			target: 'node' + process.versions.node,
			logLevel: level,
			color: enabled,
		}
	};
};

// TODO: check/load config file
// TODO: support named exports: default/"config", "options" (shared)
exports.$finalize = function (base: Options, custom?: Config): Config {
	let config: Config = {
		'.jsx': { ...base, loader: 'jsx' },
		'.tsx': { ...base, loader: 'tsx' },
		'.mjs': { ...base, loader: 'js' },
		'.ts': { ...base, loader: 'ts' },
	};

	// TODO: support named exports: config, options (defaults), loaders[]
	if (custom) for (let extn in custom) {
		// @ts-ignore - interpolated string key vs string key
		config[extn.charAt(0) === '.' ? extn : `.${extn}`] = { ...base, ...custom[extn] };
	}

	return config;
}
