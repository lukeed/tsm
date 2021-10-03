# Configuration

You must define configuration on a _per-extension_ basis. Any unknown extensions are ignored by tsm, deferring to Node's native handling of that file type. By default, tsm will _always_ handle the `.jsx`, `.tsx`, and `.ts` extensions, but you may redefine these in your configuration file to override default options.

## Options

Every extension is given its own set of [`esbuild.transform`](https://esbuild.github.io/api/#transform-api) options. tsm provides moderate defaults per extension, but _does not_ enforce any option values or offer any custom options of its own.

### Defaults

All extensions are loaded with these default `esbuild` options:

> **Important:** Any configuration that you define also inherits these defaults. Provide a new value to override the default setting.

```js
let options = {
  format: format, // "esm" for CLI or --loader, else "cjs"
  charset: 'utf8',
  sourcemap: 'inline',
  target: 'node' + process.versions.node,
  logLevel: isQuiet ? 'silent' : 'warning',
  color: enabled, // determined via `process` analysis
}
```

Additionally, tsm defines a few extensions by default, each of which is assigned an appropriate [esbuild loader](https://esbuild.github.io/content-types/). The _entire_ default tsm configuration is as follows:

```js
let config = {
  '.jsx': { ...options, loader: 'jsx' },
  '.tsx': { ...options, loader: 'tsx' },
  '.ts': { ...options, loader: 'ts' },
}
```

## Config File

When a `tsm.js` file exists in the current working directory ([`process.cwd()`](https://nodejs.org/api/process.html#process_process_cwd)), it's automatically loaded and merged with the [tsm default configuration](#defaults).

The module format of the `tsm.js` file is controlled by the root [`package.json` file](https://nodejs.org/api/esm.html#esm_enabling), also located in the current working directory. For example, if it contains `"type": "module"` then the `tsm.js` file may be written in ESM syntax (`import`/`export`). Otherwise it must be in CommonJS format. (This is true for all `.js` files.)

Additionally, when using tsm as a `node` replacement, you may provide a path to an alternate configuration file through the `--config` argument. For example, to load a `tsm.config.mjs` file, you should run:

```sh
$ tsm server.ts --config tsm.config.mjs
```

> **Note:** Any `--config` value is always resolved from the `process.cwd()`


### Contents

There multiple ways to define your configuration.

### Examples

> **Important:** Ignoring the authoring format (CommonJS vs ESM), all snippets produce the identical final configuration.


***Define each extension***

```js
let config = {
  '.ts': {
    minifyWhitespace: true,
    target: 'es2020',
    loader: 'ts',
  },
  '.tsx': {
    jsxFactory: 'preact.h',
    jsxFragment: 'preact.Fragment',
    banner: 'import * as preact from "preact";'
    minifyWhitespace: true,
    target: 'es2020',
    loader: 'tsx',
  },
  '.jsx': {
    jsxFactory: 'preact.h',
    jsxFragment: 'preact.Fragment',
    banner: 'import * as preact from "preact";'
    minifyWhitespace: true,
    target: 'es2020',
    loader: 'jsx',
  }
};

/**
 * PICK ONE
 */

// ESM - default
export default config;

// ESM - named
export { config };

// CommonJS - default
module.exports = config;

// CommonJS - named
exports.config = config;
```

***Hoist `common` options***

```js
// Merged with default options
// Shared with *all* extensions
let common = {
  minifyWhitespace: true,
  target: 'es2020',
  jsxFactory: 'preact.h',
  jsxFragment: 'preact.Fragment',
  banner: 'import * as preact from "preact";'
}

// Retain unique per-extension config
let config = {
  '.ts': {
    loader: 'ts',
  },
  '.tsx': {
    loader: 'tsx',
  },
  '.jsx': {
    loader: 'jsx',
  }
};

/**
 * PICK ONE
 */

// ESM - named
export { config, common };

// CommonJS - named
exports.config = config;
exports.common = common;
```

***Invoke `loaders` shortcut***

```js
// Merged with default options
// Shared with *all* extensions
let common = {
  minifyWhitespace: true,
  target: 'es2020',
  jsxFactory: 'preact.h',
  jsxFragment: 'preact.Fragment',
  banner: 'import * as preact from "preact";'
}

// When *only* need to define a loader
// use `loaders` object as a shortcut
// NOTE:
//  You CANNOT define `config` *and* `loaders`.
//  If both are present, only `loaders` will apply.
let loaders = {
  '.ts': 'ts',
  '.tsx': 'tsx',
  '.jsx': 'jsx',
};

/**
 * PICK ONE
 */

// ESM - named
export { loaders, common };

// CommonJS - named
exports.loaders = loaders;
exports.common = common;
```

***Import `define` helper***

```js
// Includes TypeScript checks
// NOTE: use `require` for CommonJS
import { define } from 'tsm/config';

export default define({
  common: {
    minifyWhitespace: true,
    target: 'es2020',
    jsxFactory: 'preact.h',
    jsxFragment: 'preact.Fragment',
    banner: 'import * as preact from "preact";'
  },

  // Here you can define (exclusive):
  // - a `config` object;
  // - a `loaders` object;
  // - inline extension configs; OR
  // - nothing else

  loaders: {
    '.ts': 'ts',
    '.tsx': 'tsx',
    '.jsx': 'jsx',
  }
});
```
