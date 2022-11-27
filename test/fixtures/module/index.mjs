/**
 * @param {string} name
 */
export function hello(name) {
	return `hello, ${name}`;
}

export async function dynamicCJS() {
	let m = await import('../utils.cts');
	return m.dashify('FooBar');
}

export async function dynamicMJS() {
	let m = await import('../utils.mts');
	return m.capitalize('hello');
}
