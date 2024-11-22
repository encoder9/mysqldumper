# mysqldumper

**Created by Bradley J. Gibby**
*Version 1.0.0*

I hate having to take a mysqldump file, create a dummy database, source the file into the database and wait forever for the data to be available so that I can run a query or extract some data quickly. To that end, I created this tool to help me take the .sql file created from mysqldump (not using the --extended-insert=FALSE flag, inserts on a single line) and read the data into memory, quickly and easily, so that I could just ask javascript to be able to access the data as I see fit.

This tool is designed to act like a CLI tool. Give it your file, it’ll load the data into a variable globally accessibly in the CLI called “data”, then perform whatever you want to against the data variable to show, query, extract the data as though it is a variable in a dev console.

I’m using the dreaded javascript EVAL command to run your commands against the data object so anything that can be executed in javascript is at your full disposal.

This is not meant to be released into production, it’s a dev tool designed to help dev’s who need to restore data or get something quickly and easily to be able to query the mysqldump data in an environment they’re typically normally used to, with tools they normally use daily. This is not meant to be the pinnacle of software development, it’s just a tool I use to query the mysqldump data without having to load it.

My experience with the command line is limited so any help there would be most appreciated. Anything regarding the parsing of the data is also appreciated.

# Installation

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts --path <PATH_TO_MYSQLDUMP_SQL_FILE>
```

This project was created using `bun init` in bun v1.1.20. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
