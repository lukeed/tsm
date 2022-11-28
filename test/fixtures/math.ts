export const sum = (a: number, b: number) => a + b;
export const div = (a: number, b: number) => a / b;
export const mul = (a: number, b: number) => a * b;

export const foobar = sum(1, 2);

export const dynamic = {
	async cjs() {
		// @ts-ignore – tsc cant find type defs
		let m = await import('./utils.cjs');
		return m.dashify('FooBar');
	},
	async cts() {
		// @ts-ignore – tsc doesnt like
		let m = await import('./utils.cts');
		return m.dashify('FooBar');
	},
	async mjs() {
		// @ts-ignore – tsc cant find type defs
		let m = await import('./utils.mjs');
		return m.capitalize('hello');
	},
	async mts() {
		// @ts-ignore – tsc doesnt like
		let m = await import('./utils.mts');
		return m.capitalize('hello');
	},
}
