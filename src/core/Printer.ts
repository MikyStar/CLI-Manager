import chalk from 'chalk'

import { config } from './ConfigFile'
import { Board } from './ConfigFile'
import { ITask, Task } from './Task'

////////////////////////////////////////

export namespace Printer
{
	export const stringifyBoard = ( board : Board ) : string[] =>
	{
		let toReturn : string[] = []

		toReturn.push( chalk.underline( '@' + board.name ) )

		board.tasks.forEach( task =>
		{
			const result = Task.stringifyTask( task )

			toReturn = [ ...toReturn, ...result ]
		})

		toReturn.push('')
		toReturn.push( getBoardStats( board ) )

		return toReturn
	}

	export const getBoardStats = ( board : Board ) : string =>
	{
		let toReturn = ' '
	
		const tasks = Task.straightTasks( board )

		config.states.forEach( ( state, index ) =>
		{
			const count = tasks.filter( task => task.state === state.name ).length

			if( ( index !== 0 ) && ( index !== config.states.length ) )
				toReturn += ' • '

			toReturn += chalk.hex( state.hexColor )( count + ' ' + state.name )
		});

		return toReturn
	}

	////////////////////////////////////////

	export const printStringified = ( array : string[] ) => array.forEach( str => console.log( str ) )
}
