#!/usr/bin/env node
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { fileURLToPath, URL } from "url";
import { spawn } from "child_process";

/**
 * Silence experimental warnings.
 */
process.env.NODE_OPTIONS = "--no-warnings";

const __filename = import.meta.url;
const loaderUrl = new URL("../loader/index.js", __filename);

const nodeArgs = [
  "--loader",
  fileURLToPath(loaderUrl.href),
  ...process.argv.slice(2)
];

spawn("node", nodeArgs, { stdio: "inherit" })
  .on("exit", process.exit);