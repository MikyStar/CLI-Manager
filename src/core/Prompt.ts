import prompts from 'prompts'

import { config } from './Config'
import { ITask } from './Task'

////////////////////////////////////////

export namespace Prompt
{
	export const addTask = async () =>
	{
		const parseToChoice = ( str : string ) => { return { title: str, value: str } }

		let boardChoices = []
		config.boards.forEach( board => boardChoices.push( parseToChoice( board.name ) ) )

		let stateChoices = []
		config.states.forEach( state => stateChoices.push( parseToChoice( state.name ) ) )

		const inputs = await prompts(
		[
			{
				type: 'text',
				name: 'name',
				message: 'Task name'
			},
			{
				type: 'select',
				name: 'board',
				message: 'Board',
				choices: boardChoices
			},
			{
				type: 'select',
				name: 'state',
				message: 'State',
				choices: stateChoices
			},
			{
				type: 'text',
				name: 'description',
				message: 'Description',
			}
		]);
 
		if( !inputs )
		{
			console.error('No task added')

			process.exit( -1 )
		}

		const task : ITask =
		{
			name: inputs.name,
			state: inputs.state,
			description: inputs.description
		}

		config.addTask(task, inputs.board )
	}
}
