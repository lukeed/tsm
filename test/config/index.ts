import * as assert from 'assert';

// NOTE: doesn't actually exist yet
import * as js from '../fixtures/math.js';

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

console.log('DONE~!');
