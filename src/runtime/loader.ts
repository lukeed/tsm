import { existsSync, promises as fs } from "fs";
import { fileURLToPath, URL } from "url";
import { transform } from "esbuild";

import type { Config, Options } from "../config";
import { finalize, initialize } from "../utils/index.js";
import { extname } from "path";

let config: Config;

const isExtension = /\.\w+(?=\?|$)/;
const isTS = /\.[mc]?tsx?(?=\?|$)/;
const isJS = /\.([mc])?js$/;

type Promisable<T> = Promise<T> | T;
type Source = string | SharedArrayBuffer | Uint8Array;
type Format = "builtin" | "commonjs" | "json" | "module" | "wasm";

type ModuleResolver = (
  specifier: string,
  context: {
    conditions: string[];
    parentURL?: string;
  },
  fallback: ModuleResolver
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
  if (env.file) {
    const loadedModule = await import("file:///" + env.file);
    return finalize(env, loadedModule.default || loadedModule);
  }
  
  return finalize(env);
}

async function toOptions(uri: string): Promise<Options|void> {
  config = config || await toConfig();
  const [extension] = isExtension.exec(uri) || [];
  return config[extension as `.${string}`];
}

function checkFileExists(fileUrl: string): string | void {
  const tmp = fileURLToPath(fileUrl);
  if (existsSync(tmp)) {
    return fileUrl;
  }
}

export const checkExtensions = async (specifier: string) => {
  config = config || await toConfig();
  /**
     * Check for valid file extensions first.
     */
  const possibleExtensions = Object.keys(config).concat([".js"]);
  for (const possibleExtension of possibleExtensions) {
    const url = checkFileExists(specifier + possibleExtension);
    if (url) {
      return url;
    }
  }
};

export const resolve: ModuleResolver = async function (specifier, context, fallback) {
  // ignore "prefix:" and non-relative identifiers
  if (/^\w+\:?/.test(specifier)) {
    return fallback(specifier, context, fallback);
  }

  const root = new URL("file:///" + process.cwd());
  const output = new URL(specifier, context.parentURL || root);
  const specifierUrl = output.href;
  const extension = extname(specifierUrl);

  if (!extension) {
    config = config || await toConfig();
    /**
     * Check for valid file extensions first.
     */
    const url = await checkExtensions(specifierUrl);
    if (url) {
      return { url };
    }
    /**
     * Then, index resolution.
     */
    const indexUrl = await checkExtensions(specifierUrl + "/index");
    if (indexUrl) {
      return { url: indexUrl };
    }
  } else  {
    if (!context.parentURL || isTS.test(extension)) {
      return { url: specifierUrl };
    }
    
    const url = checkFileExists(specifierUrl);
    if (url) {
      return { url };
    }
    
    if (isJS.test(extension) && isTS.test(context.parentURL)) {
      // reconstruct ".js" -> ".ts" source file
      const baseUrl = specifierUrl.substring(0, specifierUrl.lastIndexOf(extension));
      const url = checkFileExists(baseUrl + extension.replace("js", "ts"));
      if (url) {
        return { url };
      }
      // return original, let it error
      return fallback(specifier, context, fallback);
    }
  }

  return fallback(specifier, context, fallback);
};

export const load: Load = async function (uri, context, fallback) {
  // note: inline `getFormat`
  const options = await toOptions(uri);
  if (options == null) {
    return fallback(uri, context, fallback);
  }

  // TODO: decode SAB/U8 correctly
  const format: Format = options.format === "cjs" ? "commonjs" : "module";
  const path = fileURLToPath(uri);
  const source = await fs.readFile(path);

  // note: inline `transformSource`
  const result = await transform(
    source.toString(), {
      ...options,
      sourcefile: path,
      format: format === "module" ? "esm" : "cjs",
    }
  );

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
  const result = await transform(
    source.toString(), {
      ...options,
      sourcefile: context.url,
      format: context.format === "module" ? "esm" : "cjs",
    }
  );

  return { source: result.code };
};
