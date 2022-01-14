import * as assert from "assert";

// NOTE: doesn't actually exist yet
import * as esm from "../fixtures/module";
import * as js from "../fixtures/math";
import * as mjs from "../fixtures/utils.mjs";

// NOTE: avoid need for syntheticDefault + analysis
import * as data from "../fixtures/data.json";
assert.equal(typeof data, "object");

// NOTE: raw JS missing
assert.equal(typeof js, "object", "JS :: typeof");
assert.equal(typeof js.sum, "function", "JS :: typeof :: sum");
assert.equal(typeof js.div, "function", "JS :: typeof :: div");
assert.equal(typeof js.mul, "function", "JS :: typeof :: mul");
assert.equal(js.foobar, 3, "JS :: value :: foobar");

// NOTE: raw MJS missing
assert.equal(typeof mjs, "object", "MJS :: typeof");
assert.equal(typeof mjs.capitalize, "function", "MJS :: typeof :: capitalize");
assert.equal(mjs.capitalize("hello"), "Hello", "MJS :: value :: capitalize");

// Checking ".js" with ESM content (type: module)
assert.equal(typeof esm, "object", "ESM.js :: typeof");
assert.equal(typeof esm.hello, "function", "ESM.js :: typeof :: hello");
assert.equal(esm.hello("you"), "hello, you", "ESM.js :: value :: hello");

console.log("DONE~!");
