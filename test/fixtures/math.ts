export const sum = (a: number, b: number) => a + b;
export const div = (a: number, b: number) => a / b;
export const mul = (a: number, b: number) => a * b;

export const foobar = sum(1, 2);

export async function dynamic() {
	let m = await import('./utils.mjs');
	return m.capitalize('hello');
}
