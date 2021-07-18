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

	defaultArgs : string[]
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

			this.defaultArgs = json.args
			this.boards = json.boards
			this.states = json.states

			let straightTasks = []
			this.boards.forEach( board => straightTasks = [ ...straightTasks, ...Board.straightBoard( board ) ] )
			this.straightTasks = straightTasks

			// TODO : search for dusplicates and gracefully print error
		}
		catch( err )
		{
			console.error("Can't find tasks.json in current working directory, run 'tasks init'")

			process.exit(-1)
		}
	}

	////////////////////////////////////////

	addTask( task: ITask, { boardName, subTaskOf } : { boardName ?: string, subTaskOf ?: number } )
	{
		const createUniqueId = () =>
		{
			const allTasksId = []
			this.straightTasks.forEach( task => allTasksId.push( task.id ) )

			const maxInArray = Math.max( ...allTasksId )

			if( maxInArray === ( allTasksId.length -1 ) )
				return allTasksId.length
			else
			{
				let id = 0

				while( allTasksId.includes( id ) )
					id++
				
				return id
			}
		}
		const taskID = createUniqueId()

		const finalTask : ITask =
		{
			...task,
			id: taskID,
			timestamp: moment().format( TIMESTAMP_FORMAT )
		}

		if( boardName )
		{
			const boardIndex = this.boards.findIndex( board => board.name === boardName )

			if( boardIndex !== -1 )
				this.boards[ boardIndex ].tasks.push( finalTask )
			else
				throw new Error(`Board '${ boardName }' not found`)
		}
		else if( subTaskOf )
		{
			let wasParentFound = false

			// @see: https://stackoverflow.com/questions/43612046/how-to-update-value-of-nested-array-of-objects
			this.boards.forEach( ( board, boardIndex ) =>
			{
				board.tasks.forEach( function iter( task )
				{
					if( task.id === subTaskOf )
					{
						wasParentFound = true

						if( task.subtasks === undefined )
							task.subtasks = [ finalTask ]
						else
							task.subtasks = [ ...task.subtasks, finalTask ];
					}

					Array.isArray( task.subtasks ) && task.subtasks.forEach( iter );
				});
			});

			if( !wasParentFound )
				throw new Error(`Task '${ subTaskOf }' not found`)
		}
		else
			throw new Error('Should be either add to board or task')

		// this.save() // ! put back

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
				args : this.defaultArgs,
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

	/**
	 * If neither boardName nor taskId provided, prints all boards otherwise prints with decoration multiple boards or tasks
	 */
	print( options : { boardNames?: string[], tasksId ?: number[], hideDesc ?: boolean, depth ?: number } )
	{
		const { boardNames, tasksId, hideDesc, depth } = options

		if( boardNames && tasksId )
			throw new Error('Should eaither be printing board(s) or task(s) not both for now')

		////////////////////

		if( ( !boardNames && !tasksId ) || ( boardNames?.length === 0 ) && ( tasksId?.length === 0 ) )
			this.print({ boardNames: this.boards.map( board => board.name ), hideDesc, depth })
		else
		{
			console.log( Printer.charAccrossScreen( '-' ), '\n' )

			////////////////////

			if( boardNames?.length > 0 )
			{
				boardNames.forEach( ( name, index ) =>
				{
					const matchingBoard = this.boards.find( board => board.name === name )
		
					if( !matchingBoard )
						console.error(`Can't find board ${ name }`)
					else
					{
						const options =
						{
							board: matchingBoard,
							hideDescription: hideDesc,
							depth
						}
						Printer.printStringified( Board.stringify( options ) )
						console.log('')
	
						if( index !== ( boardNames.length - 1 ) )
							console.log( Printer.separator('-'), '\n' )
					}
				});
			}
			else if( tasksId?.length > 0 )
			{
				tasksId.forEach( ( id, index ) =>
				{
					const matchingTask = this.straightTasks.find( task => task.id === id )
		
					if( !matchingTask )
						console.error(`Can't find task ${ id }`)
					else
					{
						const options =
						{
							task: matchingTask,
							hideDescription: hideDesc,
							depth
						}
						Printer.printStringified( Task.stringify( options ) )
						console.log('')
	
						if( index !== ( tasksId.length - 1 ) )
							console.log( Printer.separator('-'), '\n' )
					}
				});
			}
	
			////////////////////
	
			console.log( Printer.charAccrossScreen( '-' ) )
		}
	}
}

////////////////////////////////////////

export const config = new Config('tasks.json')