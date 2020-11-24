import chalk from 'chalk'

import { config } from './ConfigFile'
import { Task, ITask } from './Task'

////////////////////////////////////////

export interface IBoard
{
	name: string,
	tasks: ITask[],
}

////////////////////////////////////////

export namespace Board
{
	export const stringify = ( board : IBoard ) : string[] =>
	{
		let toReturn : string[] = []

		// const boardName = 

		toReturn.push( ' ' + chalk.underline( '@' + board.name ) )

		board.tasks.forEach( task =>
		{
			const result = Task.stringify( task )

			toReturn = [ ...toReturn, ...result ]
		})

		toReturn.push('')
		toReturn.push( getStats( board ) )

		return toReturn
	}

	export const getStats = ( board : IBoard ) : string =>
	{
		let toReturn = ' '
	
		const tasks = Task.straightBoard( board )

		config.states.forEach( ( state, index ) =>
		{
			const count = tasks.filter( task => task.state === state.name ).length
			const percent = ( count / tasks.length ) * 100

			if( ( index !== 0 ) && ( index !== config.states.length ) )
				toReturn += ' • '

			const text = `${ count } ${ state.name } (${ percent }%)`

			toReturn += chalk.hex( state.hexColor )( text )
		});

		return toReturn
	}

}
