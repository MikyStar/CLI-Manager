import { ITask, Task } from './Task';
import { GroupByType, Order, TaskList } from './TaskList';
import { System } from './System'

import { FileAlreadyExistsError } from '../errors/FileErrors';
import { ExtractSyntaxError } from '../errors/CLISyntaxErrors';
import { TaskNotFoundError } from '../errors/TaskErrors';

////////////////////////////////////////

export const DEFAULT_STORAGE_FILE_NAME = "tasks.json"
export const DEFAULT_STORAGE_DATAS: StorageFile =
{
	meta:
	{
		states:
		[
			{
				name: "todo",
				hexColor: "#ff8f00",
				icon: "☐"
			},
			{
				name: "wip",
				hexColor: "#ab47bc",
				icon: "✹"
			},
			{
				name: "done",
				hexColor: "#66bb6a",
				icon: "✔"
			}
		]
	},
	datas:
	[
		{
			name: "Add more stuff",
			description: "There's a lot of things to do",
			state: "todo",
			id: 0,
		}
	]
}


////////////////////////////////////////

export interface Meta
{
	states: TaskState[]
}

export interface TaskState
{
	name: string,
	hexColor: string,
	icon: string
}

export interface StorageFile
{
	meta : Meta,
	datas: ITask[]
}

////////////////////////////////////////

/**
 * Expose and handle tasks datas and metadatas
 */
export class Storage
{
	relativePath : string

	tasks: TaskList
	meta: Meta

	////////////////////////////////////////

	constructor( relativePath : string )
	{
		this.relativePath = relativePath

		const { meta, datas } = System.readJSONFile( this.relativePath ) as StorageFile
		this.tasks = new TaskList( datas )
		this.meta = meta
	}


	////////////////////////////////////////

	addTask = ( task: Task, subTaskOf ?: number ) =>
	{
		const id = this.tasks.addTask( task, subTaskOf )
		this.save()
		return id
	}

	editTask = ( tasksID: number[], newAttributes: ITask, isRecurive ?: boolean ) =>
	{
		const id = this.tasks.editTask( tasksID, newAttributes, isRecurive )
		this.save()
		return id
	}

	incrementTask = ( tasksID: number[], isRecurive ?: boolean ) =>
	{
		const id = this.tasks.incrementTask( tasksID, this.meta, isRecurive )
		this.save()
		return id
	}

	deleteTask = ( tasksID: number[] ) =>
	{
		const id = this.tasks.deleteTask( tasksID )
		this.save()
		return id
	}

	moveTask = ( tasksID: number [], subTaskOf: number ) =>
	{
		const id = this.tasks.moveTask( tasksID, subTaskOf )
		this.save()
		return id
	}

	group = ( groupBy: GroupByType = 'state' ) => this.tasks.group( groupBy, this.meta )

	order = ( order: Order ) => ( order === 'desc' ) && this.tasks.reverse()

	get = ( id: number ): Task =>
	{
		let toReturn : Task = undefined

		this.tasks.retrieveTask( id, ({ task }) => toReturn = task )

		if( toReturn === undefined )
			throw new TaskNotFoundError( id )

		return toReturn
	}

	////////////////////////////////////////

	save = () => System.writeJSONFile( this.relativePath, { meta: this.meta, datas: this.tasks } )
}

////////////////////////////////////////

export const StorageFactory =
{
	init : ( relativePath: string ): Storage =>
	{
		if( System.doesFileExists( relativePath ) )
			throw new FileAlreadyExistsError( relativePath )

		System.writeJSONFile( relativePath, DEFAULT_STORAGE_DATAS )

		return new Storage( relativePath )
	},

	extract : ( newFilePath: string, originStorage: Storage, tasks: Task[] ): Storage =>
	{
		if( System.doesFileExists( newFilePath ) )
			throw new FileAlreadyExistsError( newFilePath )

		const newFile: StorageFile =
		{
			meta: originStorage.meta,
			datas: tasks
		}

		System.writeJSONFile( newFilePath, newFile )

		tasks.forEach( task => originStorage.deleteTask( [ task.id ] ) )

		return new Storage( newFilePath )
	}
}