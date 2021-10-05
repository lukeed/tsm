import * as assert from 'assert';

// NOTE: doesn't actually exist yet
import * as js from '../fixtures/math.js';
// @ts-ignore - cannot find types
import * as mjs from '../fixtures/utils.mjs';
// @ts-ignore - cannot find types
import * as cjs from '../fixtures/utils.cjs';

// NOTE: avoid need for syntheticDefault + analysis
import * as data from '../fixtures/data.json';
assert.equal(typeof data, 'object');

// @ts-ignore - generally doesn't exist
assert.equal(typeof data.default, 'string');

// NOTE: raw JS missing
assert.equal(typeof js, 'object', 'JS :: typeof');
assert.equal(typeof js.sum, 'function', 'JS :: typeof :: sum');
assert.equal(typeof js.div, 'function', 'JS :: typeof :: div');
assert.equal(typeof js.mul, 'function', 'JS :: typeof :: mul');
assert.equal(js.foobar, 3, 'JS :: value :: foobar');

// NOTE: raw MJS missing
assert.equal(typeof mjs, 'object', 'MJS :: typeof');
assert.equal(typeof mjs.capitalize, 'function', 'MJS :: typeof :: capitalize');
assert.equal(mjs.capitalize('hello'), 'Hello', 'MJS :: value :: capitalize');

// NOTE: raw CJS missing
assert.equal(typeof cjs, 'object', 'CJS :: typeof');
assert.equal(typeof cjs.dashify, 'function', 'CJS :: typeof :: dashify');
assert.equal(cjs.dashify('FooBar'), 'foo-bar', 'CJS :: value :: dashify');

console.log('DONE~!');
