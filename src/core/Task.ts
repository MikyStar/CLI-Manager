import chalk from 'chalk'

import { IBoard } from './Board'
import { config } from './ConfigFile'
import { Printer } from './Printer'

////////////////////////////////////////

export interface ITask
{
	name : string,
	id: string // For subtasks : mainTask.subNumber
	subtasks : ITask[],
	dependencies : string[], // Tasks IDS
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

		const stateColor = config.states.filter( state => task.state === state.name )[0].hexColor

		for( let i = 0; i < indentLevel; i++ )
			indent += '  '

		currentTask +=  chalk.hex( stateColor )( isFinalState ? '☒' : '☐' )

		currentTask += ' '
		currentTask += isFinalState ? chalk.strikethrough.grey( task.name ) : task.name
		toReturn.push( ' ' + indent + currentTask )

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
