import { ITask, Task } from './Task';
import { GroupByType, Order, TaskList } from './TaskList';
import { System } from './System'

import { FileAlreadyExistsError } from '../errors/FileErrors';

////////////////////////////////////////

export const DEFAULT_STORAGE_FILE_NAME = "tasks.json"
export const DEFAULT_STORAGE_DATAS: TaskList = new TaskList(
[
	{
		name: "Add more stuff",
		description: "There's a lot of things to do",
		state: "todo",
		id: 0,
	}
])

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

interface StorageFile
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

	editTask = ( tasksID: number | number[], newAttributes: ITask, isRecurive ?: boolean ) =>
	{
		const id = this.tasks.editTask( tasksID, newAttributes, isRecurive )
		this.save()
		return id
	}

	incrementTask = ( tasksID: number | number[], isRecurive ?: boolean ) =>
	{
		const id = this.tasks.incrementTask( tasksID, this.meta, isRecurive )
		this.save()
		return id
	}

	deleteTask = ( tasksID: number | number[] ) =>
	{
		const id = this.tasks.deleteTask( tasksID )
		this.save()
		return id
	}

	moveTask = ( tasksID: number | number [], subTaskOf: number ) =>
	{
		const id = this.tasks.moveTask( tasksID, subTaskOf )
		this.save()
		return id
	}

	group = ( groupBy: GroupByType = 'state' ) => this.tasks.group( groupBy, this.meta )

	order = ( order: Order ) => ( order === 'asc' ) && this.tasks.reverse()

	////////////////////////////////////////

	save = () => System.writeJSONFile( this.relativePath, this.tasks )
}