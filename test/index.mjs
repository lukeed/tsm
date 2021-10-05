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

assert.equal(typeof mts, 'object', 'MTS :: typeof');
assert.equal(typeof mts.capitalize, 'function', 'MTS :: typeof :: capitalize');
assert.equal(mts.capitalize('hello'), 'Hello', 'MTS :: value :: capitalize');

assert.equal(typeof cts, 'object', 'CTS :: typeof');
assert.equal(typeof cts.dashify, 'function', 'CTS :: typeof :: dashify');
assert.equal(cts.dashify('FooBar'), 'foo-bar', 'CTS :: value :: dashify');

console.log('DONE~!');
