export default abstract class QueryManager {
	private static tables: Map<string, string[]> = new Map();
	private static lines: string[] = [];
	public static data: { [tableName: string]: { [columnName: string]: any }[] } = {};
	
	public static async init(path: string, quiet: boolean, specificTablesOnly: string[] | null) {
		if (!quiet) { console.info(`Loading file from path: ${path}`); }
		QueryManager.lines = await QueryManager.loadFile(path);
		
		if (QueryManager.lines.length > 0) {
			if (!quiet) { console.info(`Loading ${QueryManager.lines.length} lines into memory`); }
			QueryManager.loadDataIntoMemory(specificTablesOnly);
			QueryManager.lines = [];
		} else {
			console.error('File is empty');
		}
	}
	
	public static async loadFile(path: string) {
		const file = Bun.file(path);
		
		if (file == null) {
			console.error(`File not found: ${path}`);
			return [];
		} else {
			return (await file.text()).split('\n');
		}
	}
	
	private static loadDataIntoMemory(specificTablesOnly: string[] | null) {
		let currentTable = '';
		let currentTableStartIndex = -1;
		
		for (let i = 0; i < QueryManager.lines.length; i++) {
			if (QueryManager.lines[i].startsWith('CREATE TABLE')) {
				const tableName = QueryManager.lines[i].split(' ')[2];
				currentTable = tableName.replace(/`/g, '');
				
				if (specificTablesOnly == null || (specificTablesOnly != null && currentTable != '' && specificTablesOnly.includes(currentTable))) {
					currentTableStartIndex = i;
					QueryManager.data[currentTable] = [];
				}
			}
			
			if (specificTablesOnly != null && currentTable != '' && !specificTablesOnly.includes(currentTable)) { continue; }
			
			if (currentTable !== '' && QueryManager.lines[i].startsWith(') ENGINE=')) {
				QueryManager.extractTableColumns(currentTable, currentTableStartIndex, i);
			}
			
			if (currentTable !== '' && QueryManager.lines[i].startsWith(`INSERT INTO \`${currentTable}\``)) {
				const insertItems = QueryManager.lines[i].split(`),(`);
				
				insertItems[0] = insertItems[0].replace(`INSERT INTO \`${currentTable}\` VALUES (`, '');
				insertItems[insertItems.length - 1] = insertItems[insertItems.length - 1].replace(');', '');
				
				const columnMapping = QueryManager.tables.get(currentTable);
				
				if (columnMapping != null) {
					for (const item of insertItems) {
						const row: { [columnName: string]: any } = {};
						const values = item.match(/'[^']*'|[^,]+/g) ?? [];
						
						for (let j = 0; j < columnMapping.length; j++) {
							if (values[j] == null) {
								row[columnMapping[j]] = null;
							} else {
								if (values[j].startsWith(`'{`) && values[j].endsWith(`}'`)) {
									row[columnMapping[j]] = JSON.parse(values[j].substring(1, values[j].length - 1).replace(/\\/g,""));
								} else if (values[j].startsWith(`'[`) && values[j].endsWith(`]'`)) {
									row[columnMapping[j]] = JSON.parse(values[j].substring(1, values[j].length - 1).replace(/\\/g,""));
								} else if (values[j].startsWith(`'`) && values[j].endsWith(`'`)) {
									row[columnMapping[j]] = values[j].substring(1, values[j].length - 1);
								} else if (values[j] == 'NULL') {
									row[columnMapping[j]] = null;
								} else {
									row[columnMapping[j]] = parseFloat(values[j]);
								}
							}
						}
						
						QueryManager.data[currentTable].push(row);
					}
				}
			}
		}
	}
	
	private static extractTableColumns(tableName: string, startIndex: number, endIndex: number) {
		const columns: string[] = [];
		
		for (let i = startIndex + 1; i < endIndex; i++) {
			const column = QueryManager.lines[i].split(' ')[2].replace(/`/g, '');
			
			if ([
				'PRIMARY',
				'KEY',
				'UNIQUE',
				'FULLTEXT',
				'SPATIAL',
			].every(keyword => !column.includes(keyword))) {
				columns.push(column);
			}
		}
		
		if (columns.length > 0) {
			QueryManager.tables.set(tableName, columns);
		}
	}
}
