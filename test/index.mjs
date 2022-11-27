// @ts-check
import assert from 'assert';

import jsx from './fixtures/App1';
import json from './fixtures/data.json';
// @ts-ignore – expects definitions
import * as mts from './fixtures/utils.mts';
// @ts-ignore – expects definitions
import * as cts from './fixtures/utils.cts';
// @ts-ignore – prefers extensionless
import * as ts from './fixtures/math.ts';
// @ts-ignore – prefers extensionless
import tsx from './fixtures/App2.tsx';
// @ts-ignore – prefers extensionless
import * as esm1 from './fixtures/module/index.js';
// @ts-ignore – prefers extensionless
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

assert.equal(typeof esm1, 'object', 'ESM.js :: typeof');
assert.equal(typeof esm1.hello, 'function', 'ESM.js :: typeof :: hello');
assert.equal(esm1.hello('you'), 'hello, you', 'ESM.js :: value :: hello');

assert.equal(typeof esm1.dynamicCJS, 'function', 'ESM.js :: typeof :: dynamicCJS');
assert.equal(await esm1.dynamicCJS(), 'foo-bar', 'ESM.js :: value :: dynamicCJS');

assert.equal(typeof esm1.dynamicMJS, 'function', 'ESM.js :: typeof :: dynamicMJS');
assert.equal(await esm1.dynamicMJS(), 'Hello', 'ESM.js :: value :: dynamicMJS');

assert.equal(typeof esm2, 'object', 'ESM.mjs :: typeof');
assert.equal(typeof esm2.hello, 'function', 'ESM.mjs :: typeof :: hello');
assert.equal(esm2.hello('you'), 'hello, you', 'ESM.mjs :: value :: hello');

assert.equal(typeof esm2.dynamicCJS, 'function', 'ESM.mjs :: typeof :: dynamicCJS');
assert.equal(await esm2.dynamicCJS(), 'foo-bar', 'ESM.mjs :: value :: dynamicCJS');

assert.equal(typeof esm2.dynamicMJS, 'function', 'ESM.mjs :: typeof :: dynamicMJS');
assert.equal(await esm2.dynamicMJS(), 'Hello', 'ESM.mjs :: value :: dynamicMJS');

console.log('DONE~!');
