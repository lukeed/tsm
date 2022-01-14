import { dirname, extname, isAbsolute, relative, resolve as resolvePath } from "path";
import { build as esbuild, BuildOptions } from "esbuild";
import { readFile, rm } from "fs/promises";
import chalk from "chalk";
import glob from "fast-glob";
import { pathToFileURL } from "url";

import { Plugin as RollupPlugin, rollup } from "rollup";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore No types available for this plugin.
import shebang from "rollup-plugin-preserve-shebang";

/**
 * TODO: Version the loader independently so it can be used for bootstrapping.
 * Until then, there's no way around manually specifying full specifiers in
 * internal source (for bootstrap code path).
 */
import { debugLog } from "../utils/log.js";
import { resolve } from "../loader/index.js";

const forceUnixPath = (path: string) => {
  return path.replace("file://", "");
};

const getRelativePath = (baseUrl: string, path: string) => {
  const relativePath = relative(baseUrl, forceUnixPath(path));
  return (
    relativePath.startsWith(".")
      ? relativePath
      : `./${relativePath}`
  );
};

/**
 * Matches a complete import statement, including the import keyword, as well as
 * dynamic imports and requires.
 */
export const importPattern = (importSource: string) => {
  const exprBreak = "[^\n\r;]*";
  const escaped = importSource.replace(".", "\\.").replace("/", "\\/");
  const padded = `${exprBreak}["']${escaped}["']${exprBreak}`;

  const importFrom = `(import${exprBreak}from)`;
  const dynamicImport = `(import|require)${exprBreak}\\(`;
  const exportFrom = `(export${exprBreak}from)`;
  return new RegExp(
    `(${importFrom}|${dynamicImport}|${exportFrom})${padded}`,
    "g",
  );
};

export const rewriteImport = (
  importStatement: string,
  importToReplace: string,
  importReplacement: string,
) => {
  debugLog({ importStatement, importToReplace, importReplacement });
  const [, sourcePart] = importStatement.split(/from|\(/);
  const rewrittenSource = sourcePart
    .replace(importToReplace, importReplacement)
    .trim();

  return importStatement.replace(sourcePart, rewrittenSource);
};

export const rewriteImports: () => RollupPlugin = () => {
  return {
    name: "Rewrite imports",
    renderChunk: async (code: string, chunk, options) => {
      for (const importedChunk of chunk.imports) {
        // debugLog({ importedChunk });
        /**
         * If no absolute module ID, bail.
         */
        const input = chunk.facadeModuleId;
        if (!input) continue;

        /**
         * Just a named module. Skip.
         */
        if (!importedChunk.includes("/")) {
          debugLog(`- Skipping named module: ${importedChunk}`);
          continue;
        }

        if (extname(importedChunk)) {
          /**
           * Full import specifiers (are absolute and have file extensions) are
           * never rewritten.
           */
          if (isAbsolute(importedChunk)) {
            debugLog(`Ignoring absolute specifier: ${importedChunk}`);
            continue;
          }
          /**
           * Otherwise, just a package ending in `.js` or something, or some
           * other incomplete specifier that must be resolved.
           */
        }

        const baseDir = dirname(input);
        let importToReplace = importedChunk;

        /**
         * Rewrite remaining absolute specifiers relative to baseDir for
         * replacement.
         */
        if (isAbsolute(importedChunk)) {
          debugLog(`Rewriting partial specifier: ${importedChunk}`);
          importToReplace = getRelativePath(baseDir, importedChunk);
        }

        /**
         * Read the matched import/require statements and replace them.
         */
        const importMatch = importPattern(importToReplace);
        const importStatements = code.match(importMatch) ?? [];
        // debugLog({ importStatements });

        // debugLog({ file: options.file, imports: chunk.imports, importStatements });
        for (const importStatement of importStatements) {
          if (options.file) {
            const parentURL = pathToFileURL(resolvePath(input)).href;
            const resolvedImport = await resolve(
              importedChunk,
              {
                parentURL,
                conditions: [ "node", "import", "node-addons" ]
              },
              async (url) => await import(url),
            );
            /**
             * Rewrite import identifiers for seamless CJS support. Ignore dynamic
             * imports.
             */
            if (resolvedImport.url) {
              const unixLikePath = resolvedImport.url.replace("file://", "");
              const rewrittenImport = rewriteImport(
                importStatement,
                importToReplace,
                getRelativePath(baseDir, unixLikePath),
              );

              debugLog({ input, importStatement, rewrittenImport });
              code = code.replace(importStatement, rewrittenImport);
            }
            // debugLog(parentURL);
            // debugLog(rewrittenImport);
          }
        }
      }
      
      // return null;
      return {
        code,
        sourcemap: false,
      };
      // for (const chunkImport of chunk.imports) {
      //   debugLog({ chunkImport });
      // }
    },
  };
};

export const build = async (production = false) => {
  try {
    if (production) {
      debugLog(chalk.grey("Building for production..."));
    }

    const cwd = process.cwd();
    const pkgJsonFile = resolvePath(cwd, "package.json");
    const pkgJson = await readFile(pkgJsonFile, "utf-8");
    const shared: BuildOptions = {
      logLevel: production ? "info" : "debug",
      charset: "utf8",
      target: "es2021",
      minify: production,
      define: {
        PACKAGE_JSON: pkgJson,
      }
    };

    const distDir = resolvePath(cwd, "dist");
    await rm(distDir, { force: true, recursive: true });
          
    const tsFiles = await glob("src/**/*.{ts,tsx}", { cwd });
    await esbuild({
      ...shared,
      entryPoints: tsFiles.filter((file) => !file.endsWith(".d.ts")),
      outdir: "dist",
      assetNames: "[name].js",
    });

    await postBuild();
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  }
};

export const postBuild = async () => {
  const filesToOptimize = await glob("dist/**/*.js");
  await Promise.all(
    filesToOptimize.map(
      async (file) => {
        debugLog("Optimizing", file);
        const build = await rollup({
          input: file,
          external: (id: string) => id !== file,
          plugins: [rewriteImports(), shebang()],
          // onwarn: () => void 0,
        });

        await build.write({
          file,
          format: "es",
        });
      }
    )
  );
};

if (process.env.TSM_BOOTSTRAP) {
  build();
}