import fs from 'fs';
import path from 'path';
import moment from 'moment';

import { IBoard, Board } from './Board';
import { ITask, Task, TIMESTAMP_FORMAT } from './Task';
import { Printer } from './Printer';

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
	straightTasks : ITask[]

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

			let straightTasks = []
			this.boards.forEach( board => straightTasks = [ ...straightTasks, ...Task.straightBoard( board ) ] )
			this.straightTasks = straightTasks
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

		const taskID = this.straightTasks.length

		const finalTask : ITask =
		{
			...task,
			id: taskID,
			timestamp: moment().format( TIMESTAMP_FORMAT )
		}

		this.boards[ boardIndex ].tasks.push( finalTask )

		this.save()

		console.log('')
		console.log(` Task n°${ taskID } added`)
		console.log('')
	}

	save()
	{
		try
		{
			const finalFormat =
			{
				scripts : this.scripts,
				states: this.states,
				boards : this.boards,
			}

			fs.writeFileSync( this.filePath, JSON.stringify( finalFormat, null, 4 ) )
		}
		catch( error )
		{
			console.error( 'Error during saving')

			process.exit( -1 )
		}
	}

	/*
	 * If no name provided, print all boards
	 */
	printBoard( boardName?: string )
	{
		if( !boardName )
			this.boards.forEach( board => Printer.printStringified( Board.stringify( board ) ) )
		else
		{
			const index = this.boards.findIndex( board => board.name === boardName )

			if( index === -1 )
				console.error(`Can't find board ${ boardName }`)
			else
				Printer.printStringified( Board.stringify( this.boards[ index ] ) )
		}
	}
}

////////////////////////////////////////

export const config = new Config('tasks.json')
