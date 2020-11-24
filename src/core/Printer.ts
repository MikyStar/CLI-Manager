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
			const result = Printer.stringifyTask( task )

			toReturn = [ ...toReturn, ...result ]
		})

		toReturn.push( getBoardStats( board ) )

		return toReturn
	}

	export const getBoardStats = ( board : Board ) : string =>
	{
		let toReturn = ' '
	
		const tasks = Task.straightTasks( board )

		config.states.forEach( state =>
		{
			const count = tasks.filter( task => task.name === state.name ).length

			toReturn += chalk.hex( state.hexColor )( count + ' ' + state.name )
		});

		return toReturn
	}

	export const stringifyTask = ( task : ITask, indentLevel : number = 1 ) =>
	{
		let toReturn : string[] = []
		let indent = ''
		let currentTask = ''

		const isFinalState = task.state === config.states[ config.states.length - 1 ].name

		const stateColor = config.states.filter( state => task.state === state.name )[0].hexColor

		for( let i = 0; i < indentLevel; i++ )
			indent += '  '

		currentTask +=  chalk.hex( stateColor )( isFinalState ? '☒' : '☐' )

		currentTask += ' '
		currentTask += isFinalState ? chalk.strikethrough.grey( task.name ) : task.name
		toReturn.push( indent + currentTask )

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
