import { define } from 'tsm/config';
import type * as tsm from 'tsm/config';

let loaders: tsm.Loaders = {
	'.ts': 'ts',
	'.tsm': 'ts',
	'.tsx': 'tsx',
};

let config: tsm.Config = {
	'.tsx': {
		loader: 'tsx',
		banner: 'import * as preact from "preact";'
	},
	'.jsx': {
		loader: 'jsx',
		banner: 'import * as preact from "preact";'
	}
};

let common: tsm.Options = {
	target: 'es2021',
	jsxFactory: 'preact.h',
	jsxFragment: 'preact.Fragment',
};

// ---
// INVALID: loaders + config
// ---

// @ts-expect-error
define({ loaders, config });
// @ts-expect-error
define({ common, loaders, config });

// ---
// INVALID: config + extns
// ---

// @ts-expect-error
define({ config, '.tsx': config['.tsx'] });
// @ts-expect-error
define({ common, config, '.tsx': config['.tsx'] });
// @ts-expect-error
define({ '.tsx': config['.tsx'], config });

// ---
// INVALID: loaders + extns
// ---

// @ts-expect-error
define({ loaders, '.tsx': config['.tsx'] });
// @ts-expect-error
define({ common, loaders, '.tsx': config['.tsx'] });
// @ts-expect-error
define({ '.tsx': config['.tsx'], loaders });

// ---
// VALID
// ---

define({ loaders, common });
define({ common, loaders });

define({ config, common });
define({ common, config });

define({ common });
define({ loaders });
define({ config });
define(config);

define({
	common,
	'.tsx': {
		target: 'es2017'
	}
});

define({
	'.tsx': {
		target: 'es2017'
	}
});
