import fs from 'fs';
import path from 'path';

import { IBoard } from './Board';

////////////////////////////////////////

export class Config
{
	scripts : string[]
	editor : string
	boards: IBoard[]
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
