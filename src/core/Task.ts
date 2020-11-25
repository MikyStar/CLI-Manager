import chalk from 'chalk'

import { IBoard } from './Board'
import { config } from './Config'
import { Printer } from './Printer'

////////////////////////////////////////

export interface ITask
{
	name : string,
	description ?: string,
	id: string // For subtasks : mainTask.subNumber
	subtasks ?: ITask[],
	dependencies ?: string[], // Tasks IDS
	timestamp: Date,
	state: string,
}

////////////////////////////////////////

export namespace Task
{
	/**
	 * Transform the tree of tasks and subtasks to an array of tasks
	 */ 
	export const straightBoard = ( board : IBoard ) =>
	{
		let toReturn : ITask[] = []

		/////////////////

		const straight = ( task : ITask ) =>
		{
			let toReturn : ITask[] = []

			if( !task.subtasks || task.subtasks.length === 0 )
			{
				toReturn.push( task )

				return toReturn
			}
			else
			{
				task.subtasks.forEach( sub =>
				{
					const result = straight( sub )

					toReturn = [ ...toReturn, ...result ]
				})

				delete task.subtasks
				toReturn.push( task )

				return toReturn
			}
		}

		/////////////////

		board.tasks.forEach( task =>
		{
			const result = straight( task )

			toReturn = [ ...toReturn, ...result ]
		})

		return toReturn
	}

	export const stringify = ( task : ITask, indentLevel : number = 1 ) =>
	{
		let toReturn : string[] = []
		let indent = ''
		let currentTask = ''

		const isFinalState = task.state === config.states[ config.states.length - 1 ].name
		const isFirstState = task.state === config.states[ 0 ].name

		const stateColor = config.states.filter( state => task.state === state.name )[0].hexColor

		const textID = chalk.hex( stateColor )( `${ task.id }.` )

		for( let i = 0; i < indentLevel; i++ )
			indent += '\t'

		const icon = isFinalState ? '✔' : ( isFirstState ? '☐' : '♦' )
		currentTask +=  chalk.hex( stateColor )( icon )

		currentTask += ' '
		currentTask += isFinalState ? chalk.strikethrough.grey( task.name ) : task.name
		toReturn.push( ' ' + textID + indent + currentTask )

		const parseDescriptionLines = () =>
		{
			if( !task.description )
				return []

			const LINE_BREAK = '\n'

			let toReturn : string[] = []

			const descExploded = task.description.split( LINE_BREAK )

			descExploded.forEach( line =>
			{
				line = isFinalState ? chalk.grey.strikethrough( line ) : chalk.dim( line )

				const text = ' ' + indent + '    ' + line

				toReturn.push( text )
			});

			return toReturn
		}
		toReturn = [ ...toReturn, ...parseDescriptionLines() ]

		if( !task.subtasks || task.subtasks.length === 0 )
			return toReturn
		else
		{
			task.subtasks.forEach( sub =>
			{
				const result = Task.stringify( sub, indentLevel + 1 )

				toReturn = [ ...toReturn, ...result ]
			});

			return toReturn
		}
	}

}
