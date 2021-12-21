import chalk from "chalk"
import moment from "moment"

import { ConfigState, Config } from "./Config"
import { Task, ITask,TIMESTAMP_FORMAT } from "./Task"

import { TaskIdDuplicatedError, TaskNotFoundError, TaskStateUnknownError } from "../errors/TaskErrors"

////////////////////////////////////////

export const handledGroupings = [ 'state', 'priority', 'tag', 'deadline', 'load', 'linked' ] as const
export type GroupByType = typeof handledGroupings[ number ]

export type Order = 'asc' | 'desc'

////////////////////////////////////////

interface RetrieveTaskCallback
{
	task: Task,
	taskIndex: number,
	parentTaskID ?: number
}

export interface TaskActions
{
	addTask : ( task: Task, subTaskOf: number ) => number | number[]
	editTask : ( tasksID: number | number[], newAttributes: ITask, isRecurive ?: boolean ) => number | number[]
	incrementTask : ( tasksID: number | number[], configStates: string[], isRecurive ?: boolean ) => number | number[]
	deleteTask : ( tasksID: number | number[] ) => number | number[]
	moveTask : ( tasksID: number | number [], subTaskOf: number ) => number | number[]
}

////////////////////////////////////////

export class TaskList extends Array<Task> implements TaskActions
{
	allIDs: number[]

	//////////

	constructor( items?: Task[])
	{
		super()

		this.allIDs = []

		items && items.forEach( item => this.push( item ) )
	}

	//////////

	/** @override */
	push = ( ...tasks: Task[] ) =>
	{
		tasks.forEach( task =>
		{
			const { id } = task

			if( this.allIDs.includes( id ) )
				throw new TaskIdDuplicatedError( id )
			else
			{
				this.allIDs.push( id )
				this.push( task )
			}
		})

		return this.length
	}

	addTask = ( task: Task, subTaskOf ?: number ) =>
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

		if( subTaskOf )
		{
			this.retrieveTask( subTaskOf, ({ task }) =>
			{
				if( task.subtasks === undefined )
					task.subtasks = [ finalTask ]
				else
					task.subtasks = [ ...task.subtasks, finalTask ];
			})
		}
		else
			this.push( finalTask )

		return taskID
	}

	editTask = ( tasksID: number | number[], newAttributes: ITask, isRecurive ?: boolean ) =>
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

		return tasksID
	}

	deleteTask = ( tasksID: number | number[] ) =>
	{
		tasksID = Array.isArray( tasksID ) ? tasksID : [ tasksID ]

		tasksID.forEach( id =>
		{
			let wasTaskFound = false

			// @see: https://stackoverflow.com/questions/43612046/how-to-update-value-of-nested-array-of-objects
			this.forEach( ( task, taskIndex ) =>
			{
				if( task.id === id )
				{
					wasTaskFound = true

					this.splice( taskIndex, 1 )
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
		this.forEach( function iter( task, taskIndex )
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
		this.forEach( function iter( task )
		{
			if( task[ taskAttribute ] === value )
			{
				tasks.push( task )
			}

			Array.isArray( task.subtasks ) && task.subtasks.forEach( iter );
		})

		return new TaskList( tasks )
	}

	/**
	 * Use recursion to return a count of every tasks and subtasks included in list
	 */
	countTaskAndSub = () =>
	{
		let count = 0

		// @see: https://stackoverflow.com/questions/43612046/how-to-update-value-of-nested-array-of-objects
		this.forEach( function iter( task )
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
		this.forEach( function iter( task )
		{
			if( task[ taskAttribute ] === value )
				toReturn.push( task )

			Array.isArray( task.subtasks ) && task.subtasks.forEach( iter );
		});

		return new TaskList( toReturn )
	}

	groupBy = ( groupBy: GroupByType = 'state', order: Order = 'desc', config : Config ) =>
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

				toReturn = this.sort( sortFunc )
			}
		}

		return new TaskList( ( order === 'asc' ) ? toReturn : toReturn.reverse() )
	}
}