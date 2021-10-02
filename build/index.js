const { build } = require('esbuild');
const pkg = require('../package.json');

(async function () {
	let shared = {
		external: 'tsm',
		logLevel: 'info',
		charset: 'utf8',
		minify: true,
		define: {
			VERSION: JSON.stringify(pkg.version)
		}
	};

	await build({
		...shared,
		entryPoints: ['src/bin.ts'],
		outfile: pkg.bin,
	});

	await build({
		...shared,
		entryPoints: ['src/index.ts'],
		outfile: pkg.exports['.'],
	});

	await build({
		...shared,
		entryPoints: ['src/require.ts'],
		outfile: pkg.exports['./register'].require,
	});

	await build({
		...shared,
		entryPoints: ['src/loader.ts'],
		outfile: pkg.exports['./loader'].import,
	});
})().catch(err => {
	console.error(err.stack || err);
	process.exitCode = 1;
});
