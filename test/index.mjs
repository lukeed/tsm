// @ts-check
import assert from 'assert';

import jsx from './fixtures/App1';
import json from './fixtures/data.json';
import * as ts from './fixtures/math';
import tsx from './fixtures/App2';

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

console.log('DONE~!');
