// TODO: config check extensions -> do something?

// const { FORCE_COLOR, NO_COLOR, NODE_DISABLE_COLORS } = process.env;
const version = process.versions.node;
const loadJS = require.extensions['.js'];

type Module = NodeJS.Module & {
	_compile?(source: string, filename: string): typeof loader;
};

let esbuild: typeof import('esbuild');
import type { Loader } from 'esbuild';

function loader(type: Loader, Module: Module, filename: string) {
	const pitch = Module._compile!.bind(Module);

	Module._compile = source => {
		esbuild = esbuild || require('esbuild');
		let result = esbuild.transformSync(source, {
			format: 'cjs',
			target: 'node' + version,
			color: true, // TODO: FORCE_COLOR > NO_COLOR/NODE_DISABLE_COLORS
			sourcefile: filename,
			logLevel: 'warning', // TODO: --verbose
			sourcemap: 'inline',
			loader: type
		});

		return pitch(result.code, filename);
	};

	return loadJS(Module, filename);
}

require.extensions['.ts'] = loader.bind(0, 'ts');
require.extensions['.tsx'] = loader.bind(0, 'tsx');
require.extensions['.jsx'] = loader.bind(0, 'jsx');
require.extensions['.mjs'] = loader.bind(0, 'js');
