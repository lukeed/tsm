// @ts-check
import * as assert from 'assert';

// @ts-ignore allowSyntheticDefaultImports
import json from './fixtures/data.json';

import jsx from './fixtures/App1';
// @ts-ignore – tsc does not like
import * as mts from './fixtures/utils.mts';
// @ts-ignore – tsc does not like
import * as cts from './fixtures/utils.cts';
// @ts-ignore – prefers extensionless
import * as ts from './fixtures/math.ts';
// @ts-ignore – prefers extensionless
import tsx from './fixtures/App2.tsx';

import * as esm1 from './fixtures/module/index.js';
import * as esm2 from './fixtures/module/index.mjs';

const props = {
	foo: 'bar'
};

const vnode = {
	tag: 'div',
	attr: {
		className: 'bar'
	},
	children: ['hello world']
};

// Note: for Node 12.x tests
(async function () {
	assert(json != null, 'JSON :: load');
	assert.equal(typeof json, 'object', 'JSON :: typeof');
	assert.equal(json.foo, 123, 'JSON :: value');

	// NOTE: no "default" key
	assert(jsx, 'JSX :: typeof');
	assert.equal(typeof jsx, 'function', 'JSX :: typeof');
	assert.deepEqual(jsx(props), vnode, 'JSX :: value');

	// NOTE: no "default" key
	assert(tsx, 'TSX :: typeof');
	assert.equal(typeof tsx, 'function', 'TSX :: typeof');
	assert.deepEqual(tsx(props), vnode, 'TSX :: value');

	assert(ts, 'TS :: typeof');
	assert.equal(typeof ts, 'object', 'TS :: typeof');
	assert.equal(typeof ts.sum, 'function', 'TS :: typeof :: sum');
	assert.equal(typeof ts.div, 'function', 'TS :: typeof :: div');
	assert.equal(typeof ts.mul, 'function', 'TS :: typeof :: mul');
	assert.equal(ts.foobar, 3, 'TS :: value :: foobar');

	assert.equal(typeof ts.dynamic, 'function', 'TS :: typeof :: dynamic');
	assert.equal(await ts.dynamic(), 'Hello', 'TS :: value :: dynamic');

	assert.equal(typeof mts, 'object', 'MTS :: typeof');
	assert.equal(typeof mts.capitalize, 'function', 'MTS :: typeof :: capitalize');
	assert.equal(mts.capitalize('hello'), 'Hello', 'MTS :: value :: capitalize');

	assert.equal(typeof cts, 'object', 'CTS :: typeof');
	assert.equal(typeof cts.dashify, 'function', 'CTS :: typeof :: dashify');
	assert.equal(cts.dashify('FooBar'), 'foo-bar', 'CTS :: value :: dashify');

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
