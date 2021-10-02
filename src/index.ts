const { resolve } = require('path');
const { existsSync } = require('fs');

import type { Format, LogLevel } from 'esbuild';
import type { Config, Options } from '../';

exports.define = (c: Config) => c;

// TODO: check/load config file
// TODO: options vs loaders
exports.options = async function (format?: Format): Promise<Config> {
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

	let base: Options = {
		format: format,
		charset: 'utf8',
		sourcemap: 'inline',
		target: 'node' + process.versions.node,
		logLevel: level,
		color: enabled,
	};

	let config: Config = {
		'.jsx': { ...base, loader: 'jsx' },
		'.tsx': { ...base, loader: 'tsx' },
		'.mjs': { ...base, loader: 'js' },
		'.ts': { ...base, loader: 'ts' },
	};

	if (existsSync(file)) {
		// TODO: support named exports: config, options (defaults), loaders[]
		let m = await import('file:///' + file);
		let extn, map: Config = m.default || m;
		for (extn in map) {
			// @ts-ignore - interpolated string key vs string key
			config[extn.charAt(0) === '.' ? extn : `.${extn}`] = { ...base, ...map[extn] };
		}
	}

	return config;
}
