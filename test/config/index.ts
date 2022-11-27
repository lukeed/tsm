import * as assert from 'assert';

// NOTE: doesn't actually exist yet
import * as js from '../fixtures/math.js';
import * as mjs from '../fixtures/utils.mjs';
import * as cjs from '../fixtures/utils.cjs';

import * as esm1 from '../fixtures/module/index.js';
import * as esm2 from '../fixtures/module/index.mjs';

// NOTE: avoid need for syntheticDefault + analysis
import * as data from '../fixtures/data.json';

// NOTE: for CJS test runner
(async function () {
	assert.equal(typeof data, 'object');

	// @ts-ignore - generally doesn't exist
	assert.equal(typeof data.default, 'string');

	// NOTE: raw JS missing
	assert.equal(typeof js, 'object', 'JS :: typeof');
	assert.equal(typeof js.sum, 'function', 'JS :: typeof :: sum');
	assert.equal(typeof js.div, 'function', 'JS :: typeof :: div');
	assert.equal(typeof js.mul, 'function', 'JS :: typeof :: mul');
	assert.equal(js.foobar, 3, 'JS :: value :: foobar');

	// DYANMIC IMPORTS via TS file
	assert.equal(typeof js.dynamic, 'object', 'JS :: typeof :: dynamic');
	assert.equal(await js.dynamic.cjs(), 'foo-bar', 'JS :: dynamic :: import(cjs)');
	assert.equal(await js.dynamic.cts(), 'foo-bar', 'JS :: dynamic :: import(cts)');
	assert.equal(await js.dynamic.mjs(), 'Hello', 'JS :: dynamic :: import(mjs)');
	assert.equal(await js.dynamic.mts(), 'Hello', 'JS :: dynamic :: import(mts)');

	// NOTE: raw MJS missing
	assert.equal(typeof mjs, 'object', 'MJS :: typeof');
	assert.equal(typeof mjs.capitalize, 'function', 'MJS :: typeof :: capitalize');
	assert.equal(mjs.capitalize('hello'), 'Hello', 'MJS :: value :: capitalize');

	// NOTE: raw CJS missing
	assert.equal(typeof cjs, 'object', 'CJS :: typeof');
	assert.equal(typeof cjs.dashify, 'function', 'CJS :: typeof :: dashify');
	assert.equal(cjs.dashify('FooBar'), 'foo-bar', 'CJS :: value :: dashify');

	// Checking ".js" with ESM content (type: module)
	assert.equal(typeof esm1, 'object', 'ESM.js :: typeof');
	assert.equal(typeof esm1.hello, 'function', 'ESM.js :: typeof :: hello');
	assert.equal(esm1.hello('you'), 'hello, you', 'ESM.js :: value :: hello');

	// DYANMIC IMPORTS via JS file
	assert.equal(typeof esm1.dynamic, 'object', 'ESM.js :: typeof :: dynamic');
	assert.equal(await esm1.dynamic.cjs(), 'foo-bar', 'ESM.js :: dynamic :: import(cjs)');
	assert.equal(await esm1.dynamic.cts(), 'foo-bar', 'ESM.js :: dynamic :: import(cts)');
	assert.equal(await esm1.dynamic.mjs(), 'Hello', 'ESM.js :: dynamic :: import(mjs)');
	assert.equal(await esm1.dynamic.mts(), 'Hello', 'ESM.js :: dynamic :: import(mts)');

	// Checking ".mjs" with ESM content
	assert.equal(typeof esm2, 'object', 'ESM.mjs :: typeof');
	assert.equal(typeof esm2.hello, 'function', 'ESM.mjs :: typeof :: hello');
	assert.equal(esm2.hello('you'), 'hello, you', 'ESM.mjs :: value :: hello');

	// DYANMIC IMPORTS via MJS file
	assert.equal(typeof esm2.dynamic, 'object', 'ESM.mjs :: typeof :: dynamic');
	assert.equal(await esm2.dynamic.cjs(), 'foo-bar', 'ESM.mjs :: dynamic :: import(cjs)');
	assert.equal(await esm2.dynamic.cts(), 'foo-bar', 'ESM.mjs :: dynamic :: import(cts)');
	assert.equal(await esm2.dynamic.mjs(), 'Hello', 'ESM.mjs :: dynamic :: import(mjs)');
	assert.equal(await esm2.dynamic.mts(), 'Hello', 'ESM.mjs :: dynamic :: import(mts)');

	console.log('DONE~!');
})();
