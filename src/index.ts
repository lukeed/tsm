#!/usr/bin/env tsm

import { Command } from "commander";
import { build } from "./commands/build";
import { load } from "./commands/load";

if (process.argv.length >= 2) {
  const program = new Command();

  program
    .command("build")
    .option("-d, --dev", "Build development version (default: production)")
    .description("Builds TS in src/ to output in dist/.")
    .action(async ({ dev }) => await build(!dev));

  program
    .command("load <file>", { isDefault: true })
    .description("Execute the given TS program, analogous to `node <file>`.")
    .action(load);
  // .action(async () => {
  //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //   //@ts-ignore Need to force the dist runtime.
  //   await import("../dist/runtime/bin.js");
  // });

  program
    .command("version")
    .description("Print the current version.")
    .action(() => {
      if (typeof PACKAGE_JSON === "undefined") {
        console.log("Cannot read version in development mode.");
      } else {
        console.log(`v${PACKAGE_JSON.version}`);
      }
    });

  program.parse(process.argv);
}