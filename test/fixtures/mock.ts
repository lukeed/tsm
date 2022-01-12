export function createElement(tag: string, attr?: object, ...kids: any[]) {
	return { tag, attr, children: kids.length ? kids : null };
}
