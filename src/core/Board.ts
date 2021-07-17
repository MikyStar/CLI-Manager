import chalk from 'chalk'

import { config } from './Config'
import { Task, ITask } from './Task'
import { Printer } from './Printer'

////////////////////////////////////////

export interface IBoard
{
	name: string,
	tasks: ITask[],
	default: boolean,
}

////////////////////////////////////////

export namespace Board
{
	export const stringify = ( { board, hideDescription, depth } : { board : IBoard, hideDescription ?: boolean, depth ?: number } ) : string[] =>
	{
		let toReturn : string[] = []

		toReturn.push( ' ' + chalk.bold.underline( '@' + board.name ) )
		toReturn.push('')

		board.tasks.forEach( task =>
		{
			const options =
			{
				task: task,
				indentLevel: 1,
				hideDescription,
				depth
			}
			const result = Task.stringify( options )

			toReturn = [ ...toReturn, ...result ]
		})

		if( board.tasks && board.tasks.length !== 0 )
		{
			toReturn.push('')
			toReturn.push( Task.getStats( straightBoard( board ) ) )
		}
		else
			toReturn.push( chalk.dim( ' \t' + 'No tasks yet' ) )

		return toReturn
	}

	/**
	 * Transform the tree of tasks and subtasks to an array of tasks
	 */ 
	export const straightBoard = ( board : IBoard ) =>
	{
		let toReturn : ITask[] = []

		/////////////////

		board.tasks.forEach( task =>
		{
			const result = Task.straightTask( task )

			toReturn = [ ...toReturn, ...result ]
		})

		return toReturn
	}
}
