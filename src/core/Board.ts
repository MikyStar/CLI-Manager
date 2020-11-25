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
		toReturn.push( getStats( board ) )
		toReturn.push('')

		return toReturn
	}

	export const getStats = ( board : IBoard ) : string =>
	{
		let toReturn = ' '
	
		const tasks = Task.straightBoard( board )

		// TODO it could be the responsability of task, and like retrieve stats from task array
		config.states.forEach( ( state, index ) =>
		{
			const count = tasks.filter( task => task.state === state.name ).length
			const percent = ( count / tasks.length ) * 100

			if( ( index !== 0 ) && ( index !== config.states.length ) )
				toReturn += ' ► '

			const text = `${ count } ${ state.name } (${ percent }%)`

			toReturn += chalk.hex( state.hexColor )( text )
		});

		return toReturn
	}

}
