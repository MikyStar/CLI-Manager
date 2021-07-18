import prompts from 'prompts'

import { DefaultStorage } from './Config'
import { ITask } from './Task'

////////////////////////////////////////

export namespace Prompt
{
	export const addTask = async () =>
	{
		const parseToChoice = ( str : string ) => { return { title: str, value: str } }

		let boardChoices = []
		DefaultStorage.boards.forEach( board => boardChoices.push( parseToChoice( board.name ) ) )

		let stateChoices = []
		DefaultStorage.states.forEach( state => stateChoices.push( parseToChoice( state.name ) ) )

		try
		{
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

			const task : ITask =
			{
				name: inputs.name,
				state: inputs.state,
				description: inputs.description
			}

			DefaultStorage.addTask(task, inputs.board )
		}
		catch( error )
		{
			console.warn('No task added')
		}
	}
}
