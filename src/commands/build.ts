import { build as esbuild, BuildOptions } from "esbuild";
import { readFile, rm } from "fs/promises";
import chalk from "chalk";
import glob from "fast-glob";
import { resolve as resolvePath } from "path";

import { Plugin as RollupPlugin, rollup } from "rollup";
import { RenderedChunk } from "rollup";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore No types available for this plugin.
import shebang from "rollup-plugin-preserve-shebang";
import { pathToFileURL } from "url";

/**
 * This import breaks everything.
 */
// import { resolve } from "../loader/index.js";

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
  const [_, sourcePart] = importStatement.split(/from|\(/);
  const rewrittenSource = sourcePart
    .replace(importToReplace, importReplacement)
    .trim();

  return importStatement.replace(sourcePart, rewrittenSource);
};

export const rewriteImports: () => RollupPlugin = () => {
  return {
    name: "Rewrite imports",
    // renderChunk: async (code: string, chunk, options) => {
    //   for (const chunkImport of chunk.imports) {
    //     // console.log({ chunkImport, code });
    //     /**
    //      * Read the matched import/require statements and replace them.
    //      */
    //     const importMatch = importPattern(chunkImport);
    //     const importStatements = code.match(importMatch) ?? [];
    //     for (const importStatement of importStatements) {
    //       if (options.file) {
    //         const parentURL = pathToFileURL(resolvePath(options.file)).href;
    //         const resolvedImport = await resolve(
    //           chunkImport,
    //           {
    //             parentURL,
    //             conditions: [ "node", "import", "node-addons" ]
    //           },
    //           async (url) => await import(url),
    //         );
    //         /**
    //           * Rewrite import identifiers for seamless CJS support. Ignore dynamic
    //           * imports.
    //           */
    //         // const rewrittenImport = rewriteImport(
    //         //   importStatement,
    //         //   chunkImport,
    //         //   resolvedImport.url,
    //         // );
    //         // console.log(parentURL);
    //         console.log(chunkImport);
    //         console.log(resolvedImport.url);
    //         // code = code.replace(importStatement, rewrittenImport);
    //       }
    //     }
    //   }
      
    //   return null;
    //   // for (const chunkImport of chunk.imports) {
    //   //   console.log({ chunkImport });
    //   // }
    // },
  };
};

export const build = async (production = false) => {
  try {
    if (production) {
      console.log(chalk.grey("Building for production..."));
    }

    const cwd = process.cwd();
    const pkgJsonFile = resolvePath(cwd, "package.json");
    const pkgJson = await readFile(pkgJsonFile, "utf-8");
    const shared: BuildOptions = {
      logLevel: production ? "info" : "debug",
      charset: "utf8",
      target: "es2021",
      minify: false,
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
        const build = await rollup({
          input: file,
          external: (id: string) => id !== file,
          plugins: [rewriteImports(), shebang()],
          // onwarn: () => void 0,
        });

        await build.generate({
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