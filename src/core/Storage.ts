import chalk from 'chalk';
import moment from 'moment';

import { Task, TIMESTAMP_FORMAT } from './Task';
import { System } from './System'
import { Config, ConfigState } from './Config';

import { TaskIdDuplicatedError, TaskNotFoundError, TaskStateUnknownError } from '../errors/TaskErrors';
import { FileAlreadyExistsError } from '../errors/FileErrors';

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

interface RetrieveTaskCallback
{
	task: Task,
	taskIndex: number,
	parentTaskID ?: number
}

export const handledGroupings = [ 'state', 'priority', 'tag', 'deadline', 'load', 'linked' ] as const
export type GroupByType = typeof handledGroupings[ number ]

export type Order = 'asc' | 'desc'

////////////////////////////////////////

/**
 * Expose and handle boards and tasks datas
 */
export class Storage
{
	relativePath : string

	tasks: Task[]
	allIDs : number[]

	////////////////////////////////////////

	constructor( relativePath : string, isCreation ?: boolean )
	{
		if( isCreation )
		{
			if( System.doesFileExists( relativePath ) )
				throw new FileAlreadyExistsError( relativePath )
			else
				System.writeJSONFile( relativePath, DEFAULT_STORAGE_DATAS )
		}

		this.relativePath = relativePath
		this.allIDs = []
		this.tasks = System.readJSONFile( this.relativePath )

		this.tasks.map( task =>
		{
			const { id } = task
			if( this.allIDs.includes( id ) )
				throw new TaskIdDuplicatedError( id )
			else
				this.allIDs.push( id )
		})
	}


	////////////////////////////////////////

	addTask = ( task: Task, subTaskOf: number ) =>
	{
		const createUniqueId = () =>
		{
			const maxInArray = Math.max( ...this.allIDs )

			if( maxInArray === ( this.allIDs.length -1 ) )
				return this.allIDs.length
			else
			{
				let id = 0

				while( this.allIDs.includes( id ) )
					id++

				return id
			}
		}
		const taskID = task.id || createUniqueId()

		const finalTask : Task =
		{
			...task,
			id: taskID,
			timestamp: moment().format( TIMESTAMP_FORMAT )
		}

		this.retrieveTask( subTaskOf, ({ task }) =>
		{
			if( task.subtasks === undefined )
				task.subtasks = [ finalTask ]
			else
				task.subtasks = [ ...task.subtasks, finalTask ];
		})

		this.save()

		return taskID
	}

	editTask = ( tasksID: number | number[], newAttributes: Task, isRecurive ?: boolean ) =>
	{
		tasksID = Array.isArray( tasksID ) ? tasksID : [ tasksID ]

		tasksID.forEach( id =>
		{
			this.retrieveTask( id, ({ task }) =>
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
			this.retrieveTask( id, ({ task }) =>
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
			this.tasks.forEach( ( task, taskIndex ) =>
			{
				if( task.id === id )
				{
					wasTaskFound = true

					this.tasks.splice( taskIndex, 1 )
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

			if( !wasTaskFound )
				throw new TaskNotFoundError( id )
		});

		this.save()

		return tasksID
	}

	moveTask = ( tasksID: number | number [], subTaskOf: number ) =>
	{
		tasksID = Array.isArray( tasksID ) ? tasksID : [ tasksID ]

		tasksID.forEach( id => this.retrieveTask( id, ({ task }) =>
		{
			this.deleteTask( id )

			this.addTask( task, subTaskOf )
		}));

		this.save()

		return tasksID
	}

	/**
	 * Use recursion to return a single task given id within any boards and any subtask
	 *
	 * @throws {TaskNotFoundError}
	 */
	retrieveTask = ( taskID: number, callback: ( cbParams : RetrieveTaskCallback ) => void ) =>
	{
		let wasTaskFound = false
		let lastParentTaskId = undefined

		// @see: https://stackoverflow.com/questions/43612046/how-to-update-value-of-nested-array-of-objects
		this.tasks.forEach( function iter( task, taskIndex )
		{
			if( task.id === taskID )
			{
				wasTaskFound = true

				callback( { task, taskIndex, parentTaskID: lastParentTaskId })
			}
			else if( !wasTaskFound )
			{
				lastParentTaskId = task.id
				Array.isArray( task.subtasks ) && task.subtasks.forEach( iter );
			}
		});

		if( !wasTaskFound )
			throw new TaskNotFoundError( taskID )
	}

	/**
	 * Use recursion to return all tasks matching value
	 */
	search = <K extends keyof Task>( taskAttribute: K, value: any ) =>
	{
		const tasks : Task[] = []

		// @see: https://stackoverflow.com/questions/43612046/how-to-update-value-of-nested-array-of-objects
		this.tasks.forEach( function iter( task )
		{
			if( task[ taskAttribute ] === value )
			{
				tasks.push( task )
			}

			Array.isArray( task.subtasks ) && task.subtasks.forEach( iter );
		})

		return tasks
	}

	/**
	 * Use recursion to return a count of every tasks and subtasks included in list
	 */
	countTaskAndSub = () =>
	{
		let count = 0

		// @see: https://stackoverflow.com/questions/43612046/how-to-update-value-of-nested-array-of-objects
		this.tasks.forEach( function iter( task )
		{
			count++

			Array.isArray( task.subtasks ) && task.subtasks.forEach( iter );
		})

		return count
	}

	getStats = ( availableStates : ConfigState[] ) : string =>
	{
		let toReturn = ''
		const totalCount = this.countTaskAndSub()

		availableStates.forEach( ( state, index ) =>
		{
			const count = this.search( 'state', state.name ).length
			const percent = ( count / totalCount ) * 100

			if( ( index !== 0 ) && ( index !== availableStates.length ) )
				toReturn += ' ► '

			const text = `${ count } ${ state.name } (${ percent.toFixed(0) }%)`

			toReturn += chalk.hex( state.hexColor )( text )
		});

		toReturn += ` ❯ ${ totalCount }`

		return toReturn
	}

	/**
	 * Use recursion to return any task and any subtask matching value
	 */
	findAll = <K extends keyof Task>( taskAttribute: K, value: any ) =>
	{
		const toReturn : Task[] = []

		// @see: https://stackoverflow.com/questions/43612046/how-to-update-value-of-nested-array-of-objects
		this.tasks.forEach( function iter( task )
		{
			if( task[ taskAttribute ] === value )
				toReturn.push( task )

			Array.isArray( task.subtasks ) && task.subtasks.forEach( iter );
		});

		return toReturn
	}

	sort = ( groupBy: GroupByType = 'state', order: Order = 'desc', config : Config ) : Task[] =>
	{
		/*
		* if i need both tasks array and config, then it should be a method in Storage
		*/
		let toReturn : Task[] = []

		switch( groupBy )
		{
			case 'state':
			{
				const stateNames = config.states.map( state => state.name )

				const sortFunc = ( a: Task, b: Task ) =>
				{
					if( a.state === b.state ) return 0

					return ( stateNames.indexOf( a.state ) < stateNames.indexOf( b.state ) ) ? -1 : 1
				}

				toReturn = this.tasks.sort( sortFunc )
			}
		}

		return ( order === 'asc' ) ? toReturn : toReturn.reverse()
	}

	////////////////////////////////////////

	save = () => System.writeJSONFile( this.relativePath, this.tasks )
}