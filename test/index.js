// @ts-check
const assert = require('assert');

const jsx = require('./fixtures/App1');
const json = require('./fixtures/data.json');
const tsx = require('./fixtures/App2');
const ts = require('./fixtures/math');

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

assert(jsx, 'JSX :: typeof');
assert.equal(typeof jsx, 'object', 'JSX :: typeof');
assert.equal(typeof jsx.default, 'function', 'JSX :: typeof :: default');
assert.deepEqual(jsx.default(props), vnode, 'JSX :: value');

assert(tsx, 'TSX :: typeof');
assert.equal(typeof tsx, 'object', 'TSX :: typeof');
assert.equal(typeof tsx.default, 'function', 'TSX :: typeof :: default');
assert.deepEqual(tsx.default(props), vnode, 'TSX :: value');

assert(ts, 'TS :: typeof');
assert.equal(typeof ts, 'object', 'TS :: typeof');
assert.equal(typeof ts.sum, 'function', 'TS :: typeof :: sum');
assert.equal(typeof ts.div, 'function', 'TS :: typeof :: div');
assert.equal(typeof ts.mul, 'function', 'TS :: typeof :: mul');
assert.equal(ts.foobar, 3, 'TS :: value :: foobar');

console.log('DONE~!');
