import fs from 'fs';
import path from 'path';
import moment from 'moment';

import { IBoard, Board } from './Board';
import { ITask, Task, TIMESTAMP_FORMAT, StringifyArgs } from './Task';
import { Printer } from './Printer';

////////////////////////////////////////

interface PrintArgs extends StringifyArgs
{
	boardNames?: string[],
	tasksId ?: number[],
}

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
			this.retrieveNestedTask( subTaskOf, task =>
			{
				if( task.subtasks === undefined )
					task.subtasks = [ finalTask ]
				else
					task.subtasks = [ ...task.subtasks, finalTask ];
			})
		}
		else
			throw new Error('Should be either add to board or task')

		this.save()

		console.log('')
		console.log(` Task n°${ taskID } added`)
		console.log('')
	}

	/**
	 * Use recursion to return a single given id task within any boards and any subtask
	 */
	retrieveNestedTask = ( taskID: number, callback: ( task: ITask, board ?: IBoard, taskIndex ?: number, boardIndex ?: number ) => any ) =>
	{
		let wasParentFound = false

		// @see: https://stackoverflow.com/questions/43612046/how-to-update-value-of-nested-array-of-objects
		this.boards.forEach( ( board, boardIndex ) =>
		{
			board.tasks.forEach( function iter( task, taskIndex )
			{
				if( task.id === taskID )
				{
					wasParentFound = true

					callback( task, board, taskIndex, boardIndex)
				}

				Array.isArray( task.subtasks ) && task.subtasks.forEach( iter );
			});
		});

		if( !wasParentFound )
			throw new Error(`Task '${ taskID }' not found`)
	}

	/**
	 * Use recursion to return any task within any boards and any subtask matching value
	 */
	searchAllNestedTask = <K extends keyof ITask>( taskAttribute: K, value: any ) =>
	{
		const tasks : ITask[] = []

		// @see: https://stackoverflow.com/questions/43612046/how-to-update-value-of-nested-array-of-objects
		this.boards.forEach( ( board ) =>
		{
			board.tasks.forEach( function iter( task )
			{
				if( task[ taskAttribute ] === value )
				{
					tasks.push( task )
				}

				Array.isArray( task.subtasks ) && task.subtasks.forEach( iter );
			});
		});

		return tasks
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
	print( options ?: PrintArgs )
	{
		if( !options )
		{
			this.print({ boardNames: this.boards.map( board => board.name ) })
			return
		}

		const { boardNames, tasksId } = options

		const printArgs : StringifyArgs = { ...options }

		////////////////////

		if( ( !boardNames && !tasksId ) || ( boardNames?.length === 0 ) && ( tasksId?.length === 0 ) )
			this.print({ boardNames: this.boards.map( board => board.name ), ...printArgs })
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
						Printer.printStringified( Board.stringify( matchingBoard, options ) )
						console.log('')

						if( index !== ( boardNames.length - 1 ) )
							console.log( Printer.separator('-'), '\n' )
					}
				});
			}
			else if( tasksId?.length > 0 )
			{
				const tasks = []

				tasksId.forEach( ( id, index ) =>
				{
					this.retrieveNestedTask( id, task =>
					{
						tasks.push( task )

						Printer.printStringified( Task.stringify( task, options ) )
						console.log('')
	
						if( index !== ( tasksId.length - 1 ) )
							console.log( Printer.separator('-'), '\n' )
						else
							console.log( Task.getStats( tasks ), '\n' )
					})
				});
			}
	
			////////////////////
	
			console.log( Printer.charAccrossScreen( '-' ) )
		}
	}
}

////////////////////////////////////////

export const config = new Config('tasks.json')