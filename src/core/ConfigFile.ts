import fs from 'fs';
import path from 'path';

////////////////////////////////////////

export interface Task
{
	name : string,
	board: string,
	id: string // For subtasks : mainTask.subNumber
	subtasks : Task[],
	dependencies : string[], // Tasks IDS
	timestamp: Date,
	state: string,

}

// TODO I got to work a lot with ids 

export class Config
{
	scripts : string[]
	editor : string
	boards:
	{
		name: string,
		tasks: Task[],
	}
	states :
	{
		name: string,
		hexColor: string
	}[] // todo, wip, done
	defaultBoard: string

	////////////////////////////////////////

	constructor( filePath : string )
	{
		const workingDirectory = path.join( process.cwd(), filePath )

		console.log('path', workingDirectory)

		fs.readFile( workingDirectory, { encoding: 'utf8' }, ( err, data ) =>
		{
			if( err )
			{
				console.error("Can't file tasks.json in current working directory")

				process.exit(-1)
			}
			else
			{
				console.log(data)
			}
		});
	}

	////////////////////////////////////////
}
