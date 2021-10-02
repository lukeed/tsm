import type { LogLevel, TransformOptions } from 'esbuild';

exports.define = (c: TransformOptions) => c;

// TODO: check/load config file
// TODO: options vs loaders
exports.options = function (): TransformOptions {
	let { FORCE_COLOR, NO_COLOR, NODE_DISABLE_COLORS, TERM } = process.env;
	let argv = new Set(process.argv.slice(2));

	// @see lukeed/kleur
	let enabled = !NODE_DISABLE_COLORS && NO_COLOR == null && TERM !== 'dumb' && (
		FORCE_COLOR != null && FORCE_COLOR !== '0' || process.stdout.isTTY
	);

	let level: LogLevel = (argv.has('-q')||argv.has('--quiet')) ? 'silent'
		: (argv.has('-V')||argv.has('--verbose')) ? 'verbose'
		: 'warning';

	return {
		charset: 'utf8',
		sourcemap: 'inline',
		target: 'node' + process.versions.node,
		logLevel: level,
		color: enabled,
	};
}
