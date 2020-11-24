import { Board } from './ConfigFile'

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
	export const straightTasks = ( board : Board ) =>
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
}
