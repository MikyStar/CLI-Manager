import chalk from 'chalk'

import { config, Task } from './ConfigFile'
import { Board } from './ConfigFile'

////////////////////////////////////////

export namespace Printer
{
	export const stringifyBoard = ( board : Board ) : string[] =>
	{
		let toReturn : string[] = []

		toReturn.push( chalk.underline( '@' + board.name ) )
		toReturn.push('')

		board.tasks.forEach( task =>
		{
			const result = Printer.stringifyTask( task )

			toReturn = [ ...toReturn, ...result ]
		})

		return toReturn
	}

	export const stringifyTask = ( task : Task, indentLevel : number = 1 ) =>
	{
		let toReturn : string[] = []
		let currentTask = ''

		const isFinalState = task.state === config.states[ config.states.length - 1 ].name

		const stateColor = config.states.filter( state => task.state === state.name )[0].hexColor

		for( let i = 0; i < indentLevel; i++ )
			currentTask += '\t'

		currentTask +=  chalk.hex( stateColor )( isFinalState ? '☒' : '☐' )
		currentTask += ' ' + task.name

		toReturn.push( isFinalState ? chalk.strikethrough( currentTask ) : currentTask )

		if( !task.subtasks || task.subtasks.length === 0 )
			return toReturn
		else
		{
			task.subtasks.forEach( sub =>
			{
				const result = Printer.stringifyTask( sub, indentLevel + 1 )

				toReturn = [ ...toReturn, ...result ]
			});

			return toReturn
		}
	}

	////////////////////////////////////////

	export const printStringified = ( array : string[] ) => array.forEach( str => console.log( str ) )
}
