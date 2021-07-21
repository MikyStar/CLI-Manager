import prompts from 'prompts'

import { Config } from './Config'
import { Storage } from './Storage'
import { ITask } from './Task'

////////////////////////////////////////

export namespace Prompt
{
	export const addTask = async ( storage: Storage, config: Config ) =>
	{
		const parseToChoice = ( str : string ) => { return { title: str, value: str } }

		let boardChoices = []
		storage.boards.forEach( board => boardChoices.push( parseToChoice( board.name ) ) )

		let stateChoices = []
		config.states.forEach( state => stateChoices.push( parseToChoice( state.name ) ) )

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

			storage.addTask(task, inputs.board )
		}
		catch( error )
		{
			console.warn('No task added')
		}
	}
}
