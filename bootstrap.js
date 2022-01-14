import { build as esbuild } from "esbuild";

const BOOTSTRAP_FILES = [
  "src/commands/build.ts",
  "src/loader/index.ts",
  "src/config/index.ts"
];

await esbuild({
  format: "esm",
  entryPoints: BOOTSTRAP_FILES.filter((file) => !file.endsWith(".d.ts")),
  outdir: "dist",
  assetNames: "[name].js",
});