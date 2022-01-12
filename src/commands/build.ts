#!/usr/bin/env tsm

import { build as esbuild, BuildOptions } from "esbuild";
import glob from "fast-glob";
import { readFile } from "fs/promises";
import { resolve } from "path";

export const build = async (production = false) => {
  try {
    if (production) {
      console.log("Building for production...");
    }

    const cwd = process.cwd();

    const pkgJsonFile = resolve(cwd, "package.json");
    const pkgJson = await readFile(pkgJsonFile, "utf-8");
    const shared: BuildOptions = {
      logLevel: production ? "info" : "debug",
      charset: "utf8",
      minify: production,
      target: "es2021",
      minifySyntax: true,
      define: {
        PACKAGE_JSON: pkgJson,
      }
    };

    await esbuild({
      ...shared,
      entryPoints: await glob("src/**/*.{ts,tsx}", { cwd }),
      outdir: "dist",
      assetNames: "[name].js",
    });
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  }
};

if (process.env.TSM_BOOTSTRAP) {
  build();
}