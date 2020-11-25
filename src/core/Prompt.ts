import prompts from 'prompts'

import { config } from './Config'

////////////////////////////////////////

export namespace Prompt
{
	export const addTask = async () =>
	{
		let boardChoices = []
		config.boards.forEach( board => boardChoices.push( { title: board.name, value: board.name } ) )

		const response = await prompts(
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
			}
		]);
 
	console.log(response);
	}
}
