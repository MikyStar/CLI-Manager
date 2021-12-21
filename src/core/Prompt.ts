import prompts from 'prompts'

import { Config } from './Config'
import { Storage } from './Storage'
import { ITask, Task } from './Task'

////////////////////////////////////////

export namespace Prompt
{
	export const addTask = async ( storage: Storage, config: Config ) =>
	{
		const parseToChoice = ( str : string ) => { return { title: str, value: str } }

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

			const task : Task = new Task(
			{
				name: inputs.name,
				state: inputs.state,
				description: inputs.description
			});

			const id = storage.addTask( task )

			return id
		}
		catch( error )
		{
			console.warn('No task added')
		}
	}
}
