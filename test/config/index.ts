import * as assert from 'assert';

// NOTE: avoid need for syntheticDefault + analysis
import * as data from '../fixtures/data.json';
assert.equal(typeof data, 'object');

// @ts-ignore - generally doesn't exist
assert.equal(typeof data.default, 'string');

console.log('DONE~!');
