#!/usr/bin/env tsm

const a = "hello world";
console.log({ a });

import { resolve } from "../src/loader";
(async () => {
  console.log(
    await resolve(
      "../config/index.js",
      {
        parentURL: "file:/home/christian/PersonalProjects/tsm/src/loader/index.ts",
        conditions: [ "node", "import", "node-addons" ]
      },
      async (url) => await import(url),
    )
  );
})();