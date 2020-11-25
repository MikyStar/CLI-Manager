import fs from 'fs';
import path from 'path';
import moment from 'moment';

import { IBoard } from './Board';
import { ITask, Task, TIMESTAMP_FORMAT } from './Task';

////////////////////////////////////////

export class Config
{
	private filePath : string

	scripts : string[]
	boards: IBoard[]
	states :
	{
		name: string,
		hexColor: string
	}[]

	////////////////////////////////////////

	constructor( filePath : string )
	{
		this.filePath = path.join( process.cwd(), filePath )

		try
		{
			const data = fs.readFileSync( this.filePath, { encoding: 'utf8', flag: 'r' } )
			const json = JSON.parse( data )

			this.scripts = json.scripts
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

	addTask( task: ITask, boardName : string, subTaskOf : number = undefined )
	{
		if( subTaskOf !== undefined )
			console.log('todo') // TODO

		const boardIndex = this.boards.findIndex( board => board.name === boardName )

		const finalTask : ITask =
		{
			...task,
			id: Task.straightBoard( this.boards[ boardIndex ] ).length + 1,
			timestamp: moment().format( TIMESTAMP_FORMAT )
		}

		this.boards[ boardIndex ].tasks.push( finalTask )

		this.save()
	}

	save()
	{
		try
		{
			fs.writeFileSync( this.filePath, JSON.stringify( this, null, 4 ) )
		}
		catch( error )
		{
			console.error( 'Error during saving')

			process.exit( -1 )
		}
	}
}

////////////////////////////////////////

export const config = new Config('tasks.json')
