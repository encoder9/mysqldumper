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
		},
		tables: {
			type: 'string',
		}
	},
	strict: true,
	allowPositionals: true,
});

if (values.path == null) { console.error('--path <path/to/mysqldump.sql> is required'); }
if (values.tables != null && values.tables.split(',').length == 0) { console.error('--tables <table1,table2,...> must have at least one table specified'); }
else {
	const quiet = values.quiet ?? false;
	
	if (!quiet) {
		console.info(`mysqldumper - Created by Bradley J. Gibby`);
		console.info(`Version: 1.0.0\n`);
	}
	
	if (values.path != undefined) {
		await QueryManager.init(values.path, quiet, values.tables === undefined ? null : values.tables.split(','));
		
		if (Object.keys(QueryManager.data).length == 0) {
			if (!quiet) { console.error('No data to process'); }
		} else {
			void CLIManager.init();
		}
	}
}
