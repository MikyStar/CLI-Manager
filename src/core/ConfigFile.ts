import fs from 'fs';
import path from 'path';

////////////////////////////////////////

export interface Task
{
	name : string,
	id: string // For subtasks : mainTask.subNumber
	subtasks : Task[],
	dependencies : string[], // Tasks IDS
	timestamp: Date,
	state: string,
}

export interface Board
{
	name: string,
	tasks: Task[],
}

export class Config
{

	scripts : string[]
	editor : string
	boards: Board[]
	states :
	{
		name: string,
		hexColor: string
	}[]

	////////////////////////////////////////

	constructor( filePath : string )
	{
		const workingDirectory = path.join( process.cwd(), filePath )

		try
		{
			const data = fs.readFileSync( workingDirectory, { encoding: 'utf8', flag: 'r' } )
			const json = JSON.parse( data )

			this.scripts = json.scripts
			this.editor = json.editor
			this.boards = json.boards
			this.states = json.states
		}
		catch( err )
		{
			console.error("Can't find tasks.json in current working directory, run 'tasks init'")

			process.exit(-1)
		}
	}

	////////////////////////////////////////
}

////////////////////////////////////////

export const config = new Config('tasks.json')
