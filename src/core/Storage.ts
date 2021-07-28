import moment from 'moment';

import { IBoard, Board } from './Board';
import { ITask, TIMESTAMP_FORMAT } from './Task';

import { TaskNotFoundError, TaskStateUnknownError } from '../errors/TaskErrors';
import { BoardNotFoundError, BoardAlreadyExistsError } from '../errors/BoardErrors';
import { System } from './System'

////////////////////////////////////////

export const DEFAULT_STORAGE_FILE_NAME = "tasks.json"
export const DEFAULT_STORAGE_DATAS =
[
    {
        "name": "backlog",
		"description": "Where everything lies",
        "tasks": []
    }
]

////////////////////////////////////////

/**
 * Expose and handle boards and tasks datas
 */
export class Storage
{
	relativePath : string

	boards: IBoard[]
	straightTasks : ITask[]

	////////////////////////////////////////

	constructor( relativePath : string )
	{
		this.relativePath = relativePath
		const storageDatas = System.readJSONFile( this.relativePath )

		this.boards = storageDatas

		let straightTasks = []
		this.boards.forEach( board => straightTasks = [ ...straightTasks, ...Board.straightBoard( board ) ] )
		this.straightTasks = straightTasks

		// TODO : search for dusplicates and gracefully print error
	}

	////////////////////////////////////////

	addTask = ( task: ITask, { boardName, subTaskOf } : { boardName ?: string, subTaskOf ?: number } ) =>
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
				throw new BoardNotFoundError( boardName )
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

		return taskID
	}

	editTask = ( tasksID: number | number[], newAttributes: ITask, isRecurive ?: boolean ) =>
	{
		tasksID = Array.isArray( tasksID ) ? tasksID : [ tasksID ]

		tasksID.forEach( id =>
		{
			this.retrieveNestedTask( id, task =>
			{
				for( const [k, v] of Object.entries( newAttributes ) )
					task[ k ] = v

				if( isRecurive )
				{
					const subtasksIDs = task.subtasks?.map( sub => sub.id ) || []

					if( subtasksIDs.length !== 0 )
						this.editTask( subtasksIDs, newAttributes, true )
				}
			});
		});

		this.save()

		return tasksID
	}

	incrementTask = ( tasksID: number | number[], configStates: string[], isRecurive ?: boolean ) =>
	{
		tasksID = Array.isArray( tasksID ) ? tasksID : [ tasksID ]

		tasksID.forEach( id =>
		{
			this.retrieveNestedTask( id, task =>
			{
				const currentStateIndex = configStates.indexOf( task.state )

				if( currentStateIndex === -1 )
					throw new TaskStateUnknownError( id, task.state )

				if( currentStateIndex !== configStates.length -1 )
					task.state = configStates[ currentStateIndex + 1 ]

				if( isRecurive )
				{
					const subtasksIDs = task.subtasks?.map( sub => sub.id ) || []

					if( subtasksIDs.length !== 0 )
						this.incrementTask( subtasksIDs, configStates, true )
				}
			})
		});

		this.save()

		return tasksID
	}

	deleteTask = ( tasksID: number | number[] ) =>
	{
		tasksID = Array.isArray( tasksID ) ? tasksID : [ tasksID ]

		tasksID.forEach( id =>
		{
			let wasTaskFound = false

			// @see: https://stackoverflow.com/questions/43612046/how-to-update-value-of-nested-array-of-objects
			this.boards.forEach( board =>
			{
				board.tasks.forEach( ( task, taskIndex ) =>
				{
					if( task.id === id )
					{
						wasTaskFound = true

						board.tasks.splice( taskIndex, 1 )
					}
					else
					{
						if( Array.isArray( task.subtasks ) && ( task.subtasks.length !== 0 ) )
						{
							task.subtasks.forEach( function iter( sub, subIndex )
							{
								if( sub.id === id )
								{
									wasTaskFound = true

									task.subtasks.splice( subIndex, 1 )
								}
								else if( Array.isArray( sub.subtasks ) &&  ( sub.subtasks.length !== 0 ) )
									sub.subtasks.forEach( iter )
							})
						}
					}
				});
			});

			if( !wasTaskFound )
				throw new TaskNotFoundError( id )
		});

		this.save()

		return tasksID
	}

	deleteBoard = ( boardNames: string | string[] ) =>
	{
		boardNames = Array.isArray( boardNames ) ? boardNames : [ boardNames ]

		let wasBoardFound = false

		boardNames.forEach( name =>
		{
			this.boards.forEach( ( board, index ) =>
			{
				if( board.name === name )
				{
					wasBoardFound = true

					this.boards.splice( index, 1 )
				}
			})

			if( !wasBoardFound )
				throw new BoardNotFoundError( name )
		})

		this.save()

		return boardNames
	}

	addBoard = ( boardName: string, description ?: string ) =>
	{
		const nameAlreadyTaken = this.boards.filter( board => board.name === boardName ).length !== 0
		if( nameAlreadyTaken )
			throw new BoardAlreadyExistsError( boardName )

		this.boards.push( { name: boardName, tasks: [], description } )
		this.save()

		return boardName
	}

	/**
	 * Use recursion to return a single task  given id within any boards and any subtask
	 */
	retrieveNestedTask = ( taskID: number, callback: ( task: ITask, board ?: IBoard, taskIndex ?: number, boardIndex ?: number ) => void ) =>
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
			throw new TaskNotFoundError( taskID )
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

	////////////////////////////////////////

	save = () => System.writeJSONFile( this.relativePath, this.boards )
}