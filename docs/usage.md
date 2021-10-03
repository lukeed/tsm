# Usage

There are three ways you can use tsm in your project:

1. As a `node` CLI replacement
2. As a CommonJS [`--require`](https://nodejs.org/api/cli.html#cli_r_require_module) hook
3. As an ESM [`--loader`](https://nodejs.org/api/esm.html#esm_loaders)

## CLI

***Examples***

```sh
# run a file
$ tsm server.tsx

# run a file w/ Node flags
# NOTE: flags are forwarded to `node` directly
$ tsm main.ts --trace-warnings

# run a file w/ ENV variables
# NOTE: any ENV is forwarded to `node` directly
$ NO_COLOR=1 PORT=8080 tsm main.ts

# use npx/pnpx with tsm
$ pnpx tsm server.tsx
$ npx tsm server.tsx
```

## Require Hook

The `--require` hook has existed for a _very_ long time and many tools throughout the ecosystem support/integrate with this feature. However, not _every_ tool – so please consult with your tools' documentation to see if they support a `-r/--require` flag.

> **Background:** Essentially, the `--require/-r` hook subjects any `require()`d file to additional and/or custom transformation(s). Even though this works on a per-extension basis, it can be quite costly (performance-wise) and there is discouraged; however, for tools like `tsm`, it's still valuable.

A [configuration file](/docs/configuration.dm) is still auto-loaded (if exists) when using `--require tsm` or `-r tsm`.

***Examples***

```sh
# node with require hook(s)
$ node --require tsm server.tsx
$ node -r dotenv/register -r tsm server.tsx

# external tool with require hook support
$ uvu -r tsm packages tests
$ uvu --require tsm
```

## Loader Hook

The `--loader` hook is ESM's version of the `--require` hook. A loader is **only** applied to file(s) loaded through `import` or `import()` – anything loaded through `require` is ignored by the loader.

> **Important:** ESM loaders are **experimental** and _will be_ redesigned. tsm will conform to new design(s) as the feature stabilizes.

You may use `--loader tsm` or `--experimental-loader tsm` anywhere that supports ESM loaders. At time of writing, this seems to be limited to `node` itself.

***Examples***

```sh
# run node with tsm loader
$ node --loader tsm server.tsx
$ node --experimental-loader tsm main.ts
```
