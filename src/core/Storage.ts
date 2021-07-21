import fs from 'fs';
import path from 'path';
import moment from 'moment';

import { IBoard, Board } from './Board';
import { ITask, TIMESTAMP_FORMAT } from './Task';
import { Printer } from './Printer';

import { System } from './System'

////////////////////////////////////////

export const DEFAULT_STORAGE_FILE_NAME = "tasks.json"

////////////////////////////////////////

/**
 * Expose and handle boards and tasks datas
 */
export class Storage
{
	filePath : string

	boards: IBoard[]
	straightTasks : ITask[]

	////////////////////////////////////////

	constructor( relativePath : string )
	{
		this.filePath = System.getAbsolutePath( relativePath )
		const storageDatas = System.readJSONFile( this.filePath )

		this.boards = storageDatas

		let straightTasks = []
		this.boards.forEach( board => straightTasks = [ ...straightTasks, ...Board.straightBoard( board ) ] )
		this.straightTasks = straightTasks

		// TODO : search for dusplicates and gracefully print error
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

		Printer.feedBack( `Task n°${ taskID } added` )
	}

	addBoard = ( boardName: string, description ?: string ) =>
	{
		const nameAlreadyTaken = this.boards.filter( board => board.name === boardName ).length !== 0
		if( nameAlreadyTaken )
			throw new Error( `A board named '${ boardName }' already exists`)

		this.boards.push( { name: boardName, tasks: [], description } )
		this.save()
		Printer.feedBack( `Board '${ boardName }' added` )
	}

	/**
	 * Use recursion to return a single task  given id within any boards and any subtask
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

	////////////////////////////////////////

	save = () => System.writeJSONFile( this.filePath, this.boards )
}