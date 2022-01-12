import type { Config, ConfigFile, Defaults, Extension } from "./types";
import { existsSync } from "fs";
import { resolve } from "path";

export function initialize(): Defaults {
  const { FORCE_COLOR, NO_COLOR, NODE_DISABLE_COLORS, TERM } = process.env;

  const argv = process.argv.slice(2);
  const flags = new Set(argv);
  const isQuiet = flags.has("-q") || flags.has("--quiet");

  // @see lukeed/kleur
  const enabled = !NODE_DISABLE_COLORS && NO_COLOR == null && TERM !== "dumb" && (
    FORCE_COLOR != null && FORCE_COLOR !== "0" || process.stdout.isTTY
  );

  let idx = flags.has("--tsmconfig") ? argv.indexOf("--tsmconfig") : -1;
  const file = resolve(".", !!~idx && argv[++idx] || "tsm.js");

  return {
    file: existsSync(file) && file,
    options: {
      format: "esm",
      charset: "utf8",
      sourcemap: "inline",
      target: "node16",
      logLevel: isQuiet ? "silent" : "warning",
      color: enabled,
      minify: false,
    }
  };
}

export const finalize = function (env: Defaults, custom?: ConfigFile): Config {
  const base = env.options;
  if (custom && custom.common) {
    Object.assign(base, custom.common);
    delete custom.common; // loop below
  }

  const config: Config = {
    ".mts": { ...base, loader: "ts" },
    ".jsx": { ...base, loader: "jsx" },
    ".tsx": { ...base, loader: "tsx" },
    ".cts": { ...base, loader: "ts" },
    ".ts": { ...base, loader: "ts" },
    ".json": { ...base, loader: "json" },
  };

  let extn: Extension;
  if (custom && custom.loaders) {
    for (extn in custom.loaders) config[extn] = {
      ...base,
      loader: custom.loaders[extn]
    };
  } else if (custom) {
    const conf = (custom.config || custom) as Config;
    for (extn in conf) {
      config[extn] = {
        ...base,
        ...conf[extn]

      };
    }
  }

  return config;
};