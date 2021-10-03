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

When using tsm through a [`--require` hook](/docs/usage.md#require-hook), then tsm also intercepts all `.mjs` files loaded via the `require()` method.


## Config File

When a `tsm.js` file exists in the current working directory ([`process.cwd()`](https://nodejs.org/api/process.html#process_process_cwd)), it's automatically loaded and merged with the [tsm default configuration](#defaults).

The module format of the `tsm.js` file is controlled by the root [`package.json` file](https://nodejs.org/api/esm.html#esm_enabling), also located in the current working directory. For example, if it contains `"type": "module"` then the `tsm.js` file may be written in ESM syntax (`import`/`export`). Otherwise it must be in CommonJS format. (This is true for all `.js` files.)

Additionally, when using tsm as a `node` replacement, you may provide a path to an alternate configuration file through the `--tsmconfig` argument. For example, to load a `tsm.config.mjs` file, you should run:

```sh
$ tsm server.ts --tsmconfig tsm.config.mjs
```

> **Note:** Any `--tsmconfig` value is always resolved from the `process.cwd()`

When using tsm through a `--require` or `--loader` hook, the `--tsmconfig` flag is respected and your custom configuration file will be autoloaded, if found.


### Contents

There multiple ways to define your configuration.

> **Note:** See [Examples](#examples) below for demonstrations.

Conceptually, configuration is broken down by extension, allowing each each extension to take its own `esbuild.transform` options. The extensions themselves are used as keys within the configuration object; for example, `.ts` **not** `ts`. While verbose, this is the clearest way to visualize and understand what/how each extension is handled.

The extensions' configuration can remain free-standing, but you may also wrap it in a `config` key for added clarity. This object may be exported from the file as a named `config` export or the default export.

However, as you might imagine, this may become overwhelming and/or repetitive. To alleviate this, tsm allows a `common` object to extract and share common options across _all_ extensions. The `common` key may coexist with all other configuration formats (see below) and may be exported from the configuration file as a named `common` export or as a `common` key on the default exported object.

After extracting shared options to a `common` key, you may find that all your `config` is doing is defining an esbuild `loader` option. If this is the case, you may replace the `config` object with a `loaders` object that maps an extension to its (string) loader name. For example:

```diff
--let config = {
--  '.ts': {
--    loader: 'ts'
--  },
--  '.html': {
--    loader: 'text'
--  }
--};

++let loaders = {
++  '.ts': 'ts',
++  '.html': 'text',
++};
```

However, when using the `loaders` approach, you **cannot** continue to use a `config` object. The `loaders` key may only coexist with the `common` options object. Should you need to add additional, extension-specific configuration, then you cannot use `loaders` and must use the `config` approach instead.

Finally, the `tsm/config` submodule offers a `define` method that can be used to typecheck/validate your configuration. All previous approaches and combinations still apply when using the `define` helper. For simplicity, you should use this helper as your default export; for example:

```js
// ESM syntax
import { define } from 'tsm/config';

export default define({
  common: {
    target: 'es2021',
    minify: true,
  },

  '.ts': {
    minify: false,
  },

  '.html': {
    loader: 'text',
  },

  // ...
});
```


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
    banner: 'import * as preact from "preact";',
    minifyWhitespace: true,
    target: 'es2020',
    loader: 'tsx',
  },
  '.jsx': {
    jsxFactory: 'preact.h',
    jsxFragment: 'preact.Fragment',
    banner: 'import * as preact from "preact";',
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
  banner: 'import * as preact from "preact";',
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
  banner: 'import * as preact from "preact";',
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
    banner: 'import * as preact from "preact";',
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
