/**
 * @param {string} name
 */
export function hello(name) {
	return `hello, ${name}`;
}

export const dynamic = {
	async cjs() {
		let m = await import('../utils.cjs');
		return m.dashify('FooBar');
	},
	async cts() {
		// @ts-ignore – tsc doesnt like
		let m = await import('../utils.cts');
		return m.dashify('FooBar');
	},
	async mjs() {
		let m = await import('../utils.mjs');
		return m.capitalize('hello');
	},
	async mts() {
		// @ts-ignore – tsc doesnt like
		let m = await import('../utils.mts');
		return m.capitalize('hello');
	},
}
