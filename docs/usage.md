# Usage

There are a number of ways you can use tsm in your project:

1. As a `node` CLI replacement
2. As a CommonJS [`--require`](https://nodejs.org/api/cli.html#cli_r_require_module) hook
3. As an ESM [`--loader`](https://nodejs.org/api/esm.html#esm_loaders)
4. As a [shell shebang](https://linuxize.com/post/bash-shebang/) interpreter

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

A [configuration file](/docs/configuration.md#config-file) is still auto-loaded (if exists) when using `--require tsm` or `-r tsm`.

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

A [configuration file](/docs/configuration.md#config-file) is still auto-loaded (if exists) when using `--loader tsm`.

***Examples***

```sh
# run node with tsm loader
$ node --loader tsm server.tsx
$ node --experimental-loader tsm main.ts
```

## Shell / Shebang

If you have `tsm` installed globally on your system, you may write shell scripts with tsm as the interpreter. Here's an example:

```ts
// file: example.ts
#!/usr/bin/env tsm
import { sum } from './math';
import { greet } from './hello';

let [who] = process.argv.slice(2);

greet(who || 'myself');

let answer = sum(11, 31);
console.log('the answer is:', answer);

// file: math.ts
export const sum = (a: number, b: number) => a + b;

// file: hello.ts
export function greet(name: string) {
  console.log(`Hello, ${name}~!`);
}
```

> **Important:** These are three separate TypeScript files.

Here, the main `example.ts` file imports/references functionality defined in the two other files. Additionally, the first line within `example.ts` contains a shebang (`#!`) followed by `/usr/bin/env tsm`, which tells the shell to use the `tsm` binary within the user's environment to process this file. Effectively, this means that the shebang is a shortcut for running this in your terminal:

```sh
$ tsm example.ts
```

However, by including the shebang, you are embedding the instructions for _how_ this file should be executed. This also allows you to include additional CLI flags within the shebang, meaning you don't have to redefine or remember them later on. For example, you can forward the `--trace-warnings` argument through tsm, which will always be there whenever the `example.ts` script executes.

```diff
--#!/usr/bin/env tsm
++#!/usr/bin/env tsm --trace-warnings
```

Now, in order to actually execute the `example.ts` script directly, you have to modify its permissions and mark it as executable:

```sh
$ chmod +x example.ts
```

At this point, you can run the file directly in your terminal:

```sh
$ ./example.ts
#  ExperimentalWarning: --experimental-loader is an experimental feature. This feature could change at any time
#    at emitExperimentalWarning (node:internal/util:227:11)
#    at initializeLoader (node:internal/process/esm_loader:54:3)
#    at Object.loadESM (node:internal/process/esm_loader:67:11)
#    at runMainESM (node:internal/modules/run_main:46:31)
#    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:76:5)
#    at node:internal/main/run_main_module:17:47
# Hello, myself~!
# the answer is: 42
```

> **Note:** The large block of `ExperimentalWarning` text is from the `--trace-warnings` argument. This flag is forwarded to `node`, which prints this output natively.
