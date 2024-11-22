#! /usr/bin/env bun

import { parseArgs } from "util";
import QueryManager from "./queryManager";
import CLIManager from "./cliManager";

const { values, positionals } = parseArgs({
	args: Bun.argv,
	options: {
		path: {
			type: 'string',
		},
		quiet: {
			type: 'boolean',
		}
	},
	strict: true,
	allowPositionals: true,
});

if (values.path == null) {
	console.error('--path <path/to/mysqldump.sql> is required');
} else {
	const quiet = values.quiet ?? false;
	
	if (!quiet) {
		console.info(`mysqldumper - Created by Bradley J. Gibby`);
		console.info(`Version: 1.0.0\n`);
	}
	
	await QueryManager.init(values.path, quiet);
	
	if (Object.keys(QueryManager.data).length == 0) {
		if (!quiet) { console.error('No data to process'); }
	} else {
		void CLIManager.init();
	}
}
