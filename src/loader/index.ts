import { existsSync, promises as fs } from "fs";
import { fileURLToPath, URL } from "url";
import { transform } from "esbuild";

import type { Config, Options } from "../config/types";
import type { ModuleFormat, Inspect, ModuleLoader, ModuleResolver, Transform } from "./types";
import { extname, join } from "path";
import { finalize, initialize } from "../config/index.js";

let config: Config;

const getConfig = async (): Promise<Config> => {
  if (config) {
    return config;
  } else {
    const env = initialize();
    if (env.file) {
      const loadedModule = await import("file:///" + env.file);
      return finalize(env, loadedModule.default || loadedModule);
    }
  
    config = finalize(env);
    return config;
  }
};

const getOptions = async (uri: string): Promise<Options | void> => {
  const config = await getConfig();
  const extension = extname(uri);
  return config[extension as `.${string}`];
};

const fileExists = (fileUrl: string): string | void => {
  const tmp = fileURLToPath(fileUrl);
  if (existsSync(tmp)) {
    return fileUrl;
  }
};

const checkExtensions = async (specifier: string) => {
  const config = await getConfig();
  /**
   * Check for valid file extensions first.
   */
  const possibleExtensions = Object.keys(config).concat([".js"]);
  for (const possibleExtension of possibleExtensions) {
    const url = fileExists(specifier + possibleExtension);
    if (url) {
      return url;
    }
  }
};

export const resolve: ModuleResolver = async (specifier, context, defaultResolve) => {
  // console.log({ specifier, context });
  /**
   * Ignore "prefix:" and non-relative identifiers.
   */
  if (/^\w+\:?/.test(specifier)) {
    return defaultResolve(specifier, context, defaultResolve);
  }

  const root = new URL("file:///" + process.cwd());
  const { parentURL } = context;
  const { href } = new URL(specifier, parentURL || root);
  const parentExtension = extname(parentURL ?? "").toLowerCase();
  const specifierExtension = extname(href).toLowerCase();

  /**
   * Resolve TypeScript's bare import syntax.
   */
  if (!specifierExtension) {
    /**
     * Check for valid file extensions first.
     */
    const url = await checkExtensions(href);
    if (url) {
      return { url };
    }
    /**
     * Then, index resolution.
     */
    const indexUrl = await checkExtensions(join(href, "index"));
    if (indexUrl) {
      return { url: indexUrl };
    }
  } else {
    const unresolvedSpecifier = href.substring(0, href.lastIndexOf(specifierExtension));
    /**
     * JS being imported by a TS file.
     */
    if (specifierExtension.startsWith(".js") && parentExtension.startsWith(".ts")) {
      const originalTsFile = `${unresolvedSpecifier}.ts`;
      if (fileExists(originalTsFile)) {
        return { url: originalTsFile };
      }
    }
    /**
     * Resolve to the specifier if the file exists or there is no parent URL.
     */
    if (fileExists(unresolvedSpecifier) || !context.parentURL) {
      return { url: unresolvedSpecifier };
    }
  }

  return defaultResolve(specifier, context, defaultResolve);
};

export const load: ModuleLoader = async (url, context, defaultLoad) => {
  // note: inline `getFormat`
  const options = await getOptions(url);
  if (!options) {
    return defaultLoad(url, context, defaultLoad);
  }

  // TODO: decode SAB/U8 correctly
  const format: ModuleFormat = options.format === "cjs" ? "commonjs" : "module";
  const path = fileURLToPath(url);
  const source = await fs.readFile(path);

  const result = await transform(
    source.toString(), {
      ...options,
      sourcefile: path,
      format: format === "module" ? "esm" : "cjs",
    }
  );

  return { format, source: result.code };
};

/**
 * @deprecated As of Node 17.
 */
export const getFormat: Inspect = async (url, context, defaultGetFormat) => {
  const options = await getOptions(url);
  if (!options) {
    return defaultGetFormat(url, context, defaultGetFormat);
  }

  return { format: options.format === "cjs" ? "commonjs" : "module" };
};

/**
 * @deprecated As of Node 17.
 */
export const transformSource: Transform = async (source, context, defaultTransformSource) => {
  const options = await getOptions(context.url);
  if (!options) {
    return defaultTransformSource(source, context, defaultTransformSource);
  }

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
