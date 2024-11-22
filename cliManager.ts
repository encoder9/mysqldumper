import QueryManager from "./queryManager";
import readline from 'readline';

export default abstract class CLIManager {
	private static kbBuffer: string = '';
	private static commandHistory: string[] = [];
	private static commandHistoryIndex: number = 0;
	private static prompt = 'mysqldumper> ';
	
	public static async init() {
		process.stdout.write(CLIManager.prompt);
		readline.emitKeypressEvents(process.stdin);
		
		if (process.stdin.isTTY) { process.stdin.setRawMode(true); }
		
		process.stdin.on('keypress', (chunk: string, key: any) => {
			if (key != null) {
				if (key.name === 'return') {
					process.stdout.write('\n');
					CLIManager.processCommand(CLIManager.kbBuffer);
					CLIManager.kbBuffer = '';
					process.stdout.write(CLIManager.prompt);
				} else if (key.name === 'backspace') {
					CLIManager.kbBuffer = CLIManager.kbBuffer.slice(0, -1);
					process.stdout.write('\b \b');
				} else if (key.name === 'up') {
					CLIManager.handleUpArrow();
				} else if (key.name === 'down') {
					CLIManager.handleDownArrow();
				} else if (key.name === 'left') {
					CLIManager.handleLeftArrow();
				} else if (key.name === 'right') {
					CLIManager.handleRightArrow();
				} else if (key.name === 'l' && key.ctrl) {
					CLIManager.clearScreen();
					process.stdout.write(CLIManager.prompt);
				} else if (key.name === 'd' && key.ctrl) {
					console.log(`\n`);
					process.exit(0);
				} else {
					if (chunk != null) {
						CLIManager.kbBuffer += chunk;
						process.stdout.write(chunk);
					}
				}
			}
		});
	}
	
	private static processCommand(command: string) {
		if (command.toLowerCase() === 'quit') {
			process.exit(0);
		} else {
			CLIManager.commandHistory.push(command);
			CLIManager.commandHistoryIndex = CLIManager.commandHistory.length;
			
			try {
				const data = QueryManager.data;
				console.log(eval(command));
			} catch (e) {
				console.error(e);
			}
		}
	}
	
	private static clearScreen() {
		process.stdout.write('\x1Bc');
	}
	
	private static handleUpArrow() {
		CLIManager.kbBuffer = CLIManager.commandHistory[--CLIManager.commandHistoryIndex] ?? '';
		process.stdout.write(`\x1b[1G\x1b[0K${CLIManager.prompt}${CLIManager.kbBuffer}`);
	}
	
	private static handleDownArrow() {
		CLIManager.kbBuffer = CLIManager.commandHistory[++CLIManager.commandHistoryIndex] ?? '';
		process.stdout.write(`\x1b[1G\x1b[0K${CLIManager.prompt}${CLIManager.kbBuffer}`);
	}
	
	private static handleLeftArrow() {
		process.stdout.write('\x1b[1D');
	}
	
	private static handleRightArrow() {
		process.stdout.write('\x1b[1C');
	}
}
