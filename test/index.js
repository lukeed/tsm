// @ts-check
const assert = require('assert');

const jsx = require('./fixtures/App1.jsx');
const json = require('./fixtures/data.json');
// @ts-ignore – prefers extensionless
const tsx = require('./fixtures/App2.tsx');
// @ts-ignore – prefers extensionless
const ts = require('./fixtures/math.ts');
// @ts-ignore – prefers extensionless
const mts = require('./fixtures/utils.mts');
// @ts-ignore – prefers extensionless
const cts = require('./fixtures/utils.cts');

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

assert(mts, 'MTS :: typeof');
assert.equal(typeof mts, 'object', 'MTS :: typeof');
assert.equal(typeof mts.capitalize, 'function', 'MTS :: typeof :: capitalize');
assert.equal(mts.capitalize('hello'), 'Hello', 'MTS :: value :: capitalize');

assert(cts, 'CTS :: typeof');
assert.equal(typeof cts, 'object', 'CTS :: typeof');
assert.equal(typeof cts.dashify, 'function', 'CTS :: typeof :: dashify');
assert.equal(cts.dashify('FooBar'), 'foo-bar', 'CTS :: value :: dashify');

console.log('DONE~!');
