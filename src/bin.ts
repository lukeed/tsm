#!/usr/bin/env node

/**
 * Silence experimental warnings.
 */
process.env.NODE_OPTIONS = "--no-warnings";

let argv = process.argv.slice(2);
declare const VERSION: string;

if (argv.includes('-h') || argv.includes('--help')) {
	let msg = '';
	msg += '\n  Usage\n    $ tsm [options] -- <command>\n';
	msg += '\n  Options';
	msg += `\n    --tsmconfig    Configuration file path (default: tsm.js)`;
	msg += `\n    --quiet        Silence all terminal messages`;
	msg += `\n    --version      Displays current version`;
	msg += '\n    --help         Displays this message\n';
	msg += '\n  Examples';
	msg += '\n    $ tsm server.ts';
	msg += '\n    $ node -r tsm input.jsx';
	msg += '\n    $ node --loader tsm input.jsx';
	msg += '\n    $ NO_COLOR=1 tsm input.jsx --trace-warnings';
	msg += '\n    $ tsm server.tsx --tsmconfig tsm.mjs\n';
	console.log(msg);
	process.exit(0);
}

if (argv.includes('-v') || argv.includes('--version')) {
	console.log(`tsm, v${VERSION}`);
	process.exit(0);
}

let { URL, pathToFileURL } = require('url') as typeof import('url');
argv = ['--loader', new URL('loader.mjs', pathToFileURL(__filename)).href, ...argv];
require('child_process').spawn('node', argv, { stdio: 'inherit' }).on('exit', process.exit);
