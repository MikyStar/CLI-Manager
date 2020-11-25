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
	export const stringify = ( board : IBoard ) : string[] =>
	{
		let toReturn : string[] = []

		toReturn.push( Printer.charAccrossScreen( '-' ) )
		toReturn.push( ' ' + chalk.bold.underline( '@' + board.name ) )
		toReturn.push('')

		board.tasks.forEach( task =>
		{
			const result = Task.stringify( task )

			toReturn = [ ...toReturn, ...result ]
		})

		toReturn.push('')
		toReturn.push( Task.getStats( Task.straightBoard( board ) ) )
		toReturn.push('')

		return toReturn
	}
}
