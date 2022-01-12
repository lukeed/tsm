import { existsSync, promises as fs } from "fs";
import { fileURLToPath, URL } from "url";
import { transform } from "esbuild";

import type { Config, Extension, Options } from "../config";
import { finalize, initialize } from "../utils/index.js";

let config: Config;

const EXTN = /\.\w+(?=\?|$)/;
const isTS = /\.[mc]?tsx?(?=\?|$)/;
const isJS = /\.([mc])?js$/;

type Promisable<T> = Promise<T> | T;
type Source = string | SharedArrayBuffer | Uint8Array;
type Format = "builtin" | "commonjs" | "json" | "module" | "wasm";

type Resolve = (
  ident: string,
  context: {
    conditions: string[];
    parentURL?: string;
  },
  fallback: Resolve
) => Promisable<{
  url: string;
  format?: Format;
}>;

type Inspect = (
  url: string,
  context: object,
  fallback: Inspect
) => Promisable<{ format: Format }>;

type Transform = (
  source: Source,
  context: Record<"url" | "format", string>,
  fallback: Transform
) => Promisable<{ source: Source }>;

type Load = (
  url: string,
  context: { format?: Format },
  fallback: Load
) => Promisable<{
  format: Format;
  source: Source;
}>;

async function toConfig(): Promise<Config> {
  const env = initialize();
  const setup = env.file && import("file:///" + env.file);

  let mod = await setup;
  mod = mod && mod.default || mod;
  return finalize(env, mod);
}

async function toOptions(uri: string): Promise<Options|void> {
  config = config || await toConfig();
  const [extn] = EXTN.exec(uri) || [];
  return config[extn as `.${string}`];
}

function check(fileurl: string): string | void {
  const tmp = fileURLToPath(fileurl);
  if (existsSync(tmp)) return fileurl;
}

export const resolve: Resolve = async function (ident, context, fallback) {
  const root = new URL("file:///" + process.cwd() + "/");

  // ignore "prefix:" and non-relative identifiers
  if (/^\w+\:?/.test(ident)) return fallback(ident, context, fallback);

  let match: RegExpExecArray | null;
  let idx: number, ext: Extension, path: string | void;
  const output = new URL(ident, context.parentURL || root);

  // source ident includes extension
  if (match = EXTN.exec(output.href)) {
    ext = match[0] as Extension;
    if (!context.parentURL || isTS.test(ext)) {
      return { url: output.href };
    }
    // source ident exists
    path = check(output.href);
    if (path) return { url: path };
    // parent importer is a ts file
    // source ident is js & NOT exists
    if (isJS.test(ext) && isTS.test(context.parentURL)) {
      // reconstruct ".js" -> ".ts" source file
      path = output.href.substring(0, idx = match.index);
      if (path = check(path + ext.replace("js", "ts"))) {
        idx += ext.length;
        if (idx > output.href.length) {
          path += output.href.substring(idx);
        }
        return { url: path };
      }
      // return original, let it error
      return fallback(ident, context, fallback);
    }
  }

  config = config || await toConfig();

  for (ext in config) {
    path = check(output.href + ext);
    if (path) return { url: path };
  }

  return fallback(ident, context, fallback);
};

export const load: Load = async function (uri, context, fallback) {
  // note: inline `getFormat`
  const options = await toOptions(uri);
  if (options == null) return fallback(uri, context, fallback);
  const format: Format = options.format === "cjs" ? "commonjs" : "module";

  // TODO: decode SAB/U8 correctly
  const path = fileURLToPath(uri);
  const source = await fs.readFile(path);

  // note: inline `transformSource`
  const result = await transform(source.toString(), {
    ...options,
    sourcefile: path,
    format: format === "module" ? "esm" : "cjs",
  });

  return { format, source: result.code };
};

/** @deprecated */
export const getFormat: Inspect = async function (uri, context, fallback) {
  const options = await toOptions(uri);
  if (options == null) return fallback(uri, context, fallback);
  return { format: options.format === "cjs" ? "commonjs" : "module" };
};

/** @deprecated */
export const transformSource: Transform = async function (source, context, xform) {
  const options = await toOptions(context.url);
  if (options == null) return xform(source, context, xform);

  // TODO: decode SAB/U8 correctly
  const result = await transform(source.toString(), {
    ...options,
    sourcefile: context.url,
    format: context.format === "module" ? "esm" : "cjs",
  });

  return { source: result.code };
};
