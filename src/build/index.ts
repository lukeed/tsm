#!/usr/bin/env tsm

import { build, BuildOptions } from 'esbuild'
import { readFile } from 'fs/promises';

const pkg = JSON.parse(await readFile('package.json', 'utf-8'));

try {
	let shared: BuildOptions = {
		logLevel: 'info',
		charset: 'utf8',
		minify: true,
		define: {
			VERSION: JSON.stringify(pkg.version)
		}
	};

	await build({
		...shared,
		entryPoints: ['src/utils/index.ts'],
		outfile: './dist/utils/index.js',
	});

	await build({
		...shared,
		entryPoints: ['src/bin.ts'],
		outfile: pkg.bin,
	});

	await build({
		...shared,
		entryPoints: ['src/require.ts'],
		outfile: pkg.exports['.'].require,
	});

	await build({
		...shared,
		entryPoints: ['src/loader.ts'],
		outfile: pkg.exports['.'].import,
	});

} catch (err: any) {
	console.error(err.stack || err);
	process.exitCode = 1;
}
