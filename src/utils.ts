const { resolve } = require('path');
const { existsSync } = require('fs');

import type { Format } from 'esbuild';
import type * as tsm from 'tsm/config';
import type { Defaults } from './utils.d';

exports.$defaults = function (format: Format): Defaults {
	let { FORCE_COLOR, NO_COLOR, NODE_DISABLE_COLORS, TERM } = process.env;

	let argv = process.argv.slice(2);

	let flags = new Set(argv);
	let isQuiet = flags.has('-q') || flags.has('--quiet');

	// @see lukeed/kleur
	let enabled = !NODE_DISABLE_COLORS && NO_COLOR == null && TERM !== 'dumb' && (
		FORCE_COLOR != null && FORCE_COLOR !== '0' || process.stdout.isTTY
	);

	let idx = flags.has('--tsmconfig') ? argv.indexOf('--tsmconfig') : -1;
	let file = resolve('.', !!~idx && argv[++idx] || 'tsm.js');

	return {
		file: existsSync(file) && file,
		isESM: format === 'esm',
		options: {
			format: format,
			charset: 'utf8',
			sourcemap: 'inline',
			target: 'node' + process.versions.node,
			logLevel: isQuiet ? 'silent' : 'warning',
			color: enabled,
		}
	};
};

exports.$finalize = function (env: Defaults, custom?: tsm.ConfigFile): tsm.Config {
	let base = env.options;
	if (custom && custom.common) {
		Object.assign(base, custom.common!);
		delete custom.common; // loop below
	}

	let config: tsm.Config = {
		'.jsx': { ...base, loader: 'jsx' },
		'.tsx': { ...base, loader: 'tsx' },
		'.ts': { ...base, loader: 'ts' },
	};

	if (env.isESM) {
		config['.json'] = { ...base, loader: 'json' };
	} else {
		config['.mjs'] = { ...base, loader: 'js' };
	}

	let extn: tsm.Extension;
	if (custom && custom.loaders) {
		for (extn in custom.loaders) config[extn] = {
			...base, loader: custom.loaders[extn]
		};
	} else if (custom) {
		let conf = (custom.config || custom) as tsm.Config;
		for (extn in conf) config[extn] = { ...base, ...conf[extn] };
	}

	return config;
}
