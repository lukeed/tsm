#!/usr/bin/env tsm

import { Command } from "commander";
import { build } from "./commands/build";
import { load } from "./commands/load";
const program = new Command();

program
  .command("build")
  .description("Builds TS in src/ to dist/.")
  .action(async () => await build(true));

program
  .command("load <file>", { isDefault: true })
  .description("Execute the given TS program, analogous to `node <file>`.")
  .action(load);

program.parse(process.argv);