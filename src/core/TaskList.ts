import chalk from "chalk"
import moment from "moment"

import { Task, ITask,TIMESTAMP_FORMAT } from "./Task"

import { NoFurtherStateError, TaskIdDuplicatedError, TaskNotFoundError, TaskStateUnknownError } from "../errors/TaskErrors"
import { Meta } from "./Storage"

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

////////////////////////////////////////

export class TaskList extends Array<Task>
{
	allIDs: number[]

	//////////

	constructor( items ?: ITask[] )
	{
		super()

		this.allIDs = []

		items && this.push( ...items.map( item => new Task( item ) ) )
	}

	//////////

	/** @override */
	push = ( ...tasks: Task[] ) =>
	{
		tasks.forEach( ( task: Task ) =>
		{
			const containedIDS = task.straightTask().map( within => within.id )

			containedIDS.forEach( id =>
			{
				if( this.allIDs.includes( id ) )
					throw new TaskIdDuplicatedError( id )
				else
					this.allIDs.push( id )
			})

			super.push( task )
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
		const taskID = ( task.id && !this.allIDs.includes( task.id ) ) ? task.id : createUniqueId()

		task.id = taskID
		task.timestamp = moment().format( TIMESTAMP_FORMAT )

		if( subTaskOf )
		{
			this.retrieveTask( subTaskOf, ({ task: parent }) =>
			{
				if( parent.subtasks === undefined )
					parent.subtasks = [ task ]
				else
					parent.subtasks = [ ...parent.subtasks, task ];

				this.allIDs.push( taskID )
			})
		}
		else
			this.push( task )

		return taskID
	}

	editTask = ( tasksID: number | number[], newAttributes: ITask, isRecurive ?: boolean ) =>
	{
		tasksID = Array.isArray( tasksID ) ? tasksID : [ tasksID ]

		tasksID.forEach( id =>
		{
			this.retrieveTask( id, ({ task }) =>
			{
				const impactedTasks = isRecurive ? task.straightTask() : [ task ]

				for( const [k, v] of Object.entries( newAttributes ) )
					impactedTasks.forEach( aTask => aTask[ k ] = v )
			});
		});

		return tasksID
	}

	incrementTask = ( tasksID: number | number[], meta: Meta, isRecurive ?: boolean ) =>
	{
		tasksID = Array.isArray( tasksID ) ? tasksID : [ tasksID ]

		const { states } = meta
		const statesNames = states.map( state => state.name )

		const handleIncrement = ( task: Task ) =>
		{
			const currentStateIndex = statesNames.indexOf( task.state )

			if( currentStateIndex === -1 )
				throw new TaskStateUnknownError( task.id, task.state )

			if( currentStateIndex !== statesNames.length -1 )
				task.state = statesNames[ currentStateIndex + 1 ]
			else
				throw new NoFurtherStateError( task.id )
		}

		tasksID.forEach( id =>
		{
			this.retrieveTask( id, ({ task }) =>
			{
				handleIncrement( task )

				if( isRecurive && task.subtasks )
				{
					const flatten = task.straightTask()

					flatten.forEach( aTask => handleIncrement( aTask ) )
				}
			})
		});

		return tasksID
	}

	/** @see: https://stackoverflow.com/questions/49349195/using-splice-method-in-subclass-of-array-in-javascript -> Exact same problem */
	private remove = ( task: Task ) =>
	{
		const idIndex = this.allIDs.findIndex( anId => anId === task.id )
		this.allIDs.splice( idIndex, 1 )

		let index = this.indexOf( task );

		if( index > -1 )
		{
			const newLength = this.length - 1;
			while( index < newLength )
			{
				this[index] = this[index + 1];
				++index;
			}
			this.length = newLength;

			return [ task ];
		}
		return [];
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

					this.remove( task )
				}
				else
				{
					if( Array.isArray( task.subtasks ) && ( task.subtasks.length !== 0 ) )
					{
						const iter = ( sub: Task, subIndex: number ) =>
						{
							if( sub.id === id )
							{
								wasTaskFound = true

								task.subtasks.splice( subIndex, 1 )
							}
							else if( Array.isArray( sub.subtasks ) &&  ( sub.subtasks.length !== 0 ) )
								sub.subtasks.forEach( iter )
						}

						task.subtasks.forEach( iter)
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

		const iter = ( task : Task, taskIndex: number ) =>
		{
			if( task.id === taskID )
			{
				wasTaskFound = true

				return callback( { task, taskIndex, parentTaskID: lastParentTaskId })
			}
			else
			{
				if( Array.isArray( task.subtasks ) )
				{
					lastParentTaskId = task.id
					task.subtasks.forEach( iter );
				}
				else
					lastParentTaskId = undefined
			}
		}

		// @see: https://stackoverflow.com/questions/43612046/how-to-update-value-of-nested-array-of-objects
		this.forEach( iter );

		if( !wasTaskFound )
			throw new TaskNotFoundError( taskID )
	}

	/**
	 * Use recursion to return all tasks matching value
	 */
	search = <K extends keyof Task>( taskAttribute: K, value: any ) =>
	{
		const tasks : Task[] = []

		this.forEach( task =>
		{
			const within = task.straightTask()

			within.forEach( withinTask =>
			{
				if( withinTask[ taskAttribute ] === value )
					tasks.push( withinTask )
			})
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
		this.forEach( function iter( task )
		{
			count++

			Array.isArray( task.subtasks ) && task.subtasks.forEach( iter );
		})

		return count
	}

	getStats = ( meta: Meta ) : string =>
	{
		let toReturn = ''
		const totalCount = this.countTaskAndSub()

		const { states } = meta

		states.forEach( ( state, index ) =>
		{
			const count = this.search( 'state', state.name ).length
			const percent = ( count / totalCount ) * 100

			if( ( index !== 0 ) && ( index !== states.length ) )
				toReturn += ' ► '

			const text = `${ count } ${ state.name } (${ percent.toFixed(0) }%)`

			toReturn += chalk.hex( state.hexColor )( text )
		});

		toReturn += ` ❯ ${ totalCount }`

		return toReturn
	}

	group = ( groupBy: GroupByType = 'state', meta: Meta ) =>
	{
		let sortFunction = ( a: Task, b: Task ) => 0

		switch( groupBy )
		{
			case 'state':
			{
				const stateNames = meta.states.map( state => state.name )

				sortFunction = ( a: Task, b: Task ) =>
				{
					if( a.state === b.state ) return 0

					return ( stateNames.indexOf( a.state ) < stateNames.indexOf( b.state ) ) ? -1 : 1
				}
			}
		}

		this.sort( sortFunction )
	}
}