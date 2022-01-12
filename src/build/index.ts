#!/usr/bin/env tsm

import { build, BuildOptions } from "esbuild";
import glob from "fast-glob";
import { readFile } from "fs/promises";

(async () => {
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const filesToBuild = await glob("src/**/*.{ts,tsx}");

  const shared: BuildOptions = {
    logLevel: "info",
    charset: "utf8",
    minify: true,
    target: "es2021",
    minifySyntax: true,
    define: {
      VERSION: JSON.stringify(pkg.version)
    }
  };

  try {
    await build({
      ...shared,
      entryPoints: filesToBuild,
      outdir: "dist",
      assetNames: "[name].js",
    });
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  }
})();