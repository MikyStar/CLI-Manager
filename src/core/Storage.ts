import { ITask, Task } from './Task';
import { TaskList, TaskActions } from './TaskList';
import { System } from './System'

import { TaskIdDuplicatedError } from '../errors/TaskErrors';
import { FileAlreadyExistsError } from '../errors/FileErrors';

////////////////////////////////////////

export const DEFAULT_STORAGE_FILE_NAME = "tasks.json"
export const DEFAULT_STORAGE_DATAS =
[
	{
		"name": "Add more stuff",
		"description": "There's a lot of things to do",
		"state": "todo",
		"id": 0,
	}
]

////////////////////////////////////////

/**
 * Expose and handle boards and tasks datas
 */
export class Storage implements TaskActions
{
	relativePath : string

	tasks: TaskList

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
		this.tasks = new TaskList( System.readJSONFile( this.relativePath ) )
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

	incrementTask = ( tasksID: number | number[], configStates: string[], isRecurive ?: boolean ) =>
	{
		const id = this.tasks.incrementTask( tasksID, configStates, isRecurive )
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

	////////////////////////////////////////

	save = () => System.writeJSONFile( this.relativePath, this.tasks )
}