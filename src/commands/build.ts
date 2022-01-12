#!/usr/bin/env tsm

import { build as esbuild, BuildOptions } from "esbuild";
import { readFile, rm } from "fs/promises";
import glob from "fast-glob";
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
      target: "es2021",
      minify: false,
      define: {
        PACKAGE_JSON: pkgJson,
      }
    };

    const distDir = resolve(cwd, "dist");
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

if (process.env.TSM_BOOTSTRAP) {
  build();
}