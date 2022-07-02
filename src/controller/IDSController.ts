import { RawArg } from './CliArgHandler'
import { Storage } from '../core/Storage'
import { Task } from '../core/Task'

////////////////////////////////////////

interface IDControllerReturn
{
	textTask: TextTask
	textID: string
	ids: number[]
	tasks: Task[]
}

type TextTask = 'Task' | 'Tasks'

////////////////////////////////////////

// TODO change argIDVal to rawArg type and check if number or number[]
export const idsController = ( storage: Storage, argIDVal: number | number[] ): IDControllerReturn =>
{
	const ids: number [] = []
	let textID = ''
	let textTask: TextTask = 'Task'
	const tasks: Task[] = []

	if( Array.isArray( argIDVal ) )
	{
		textTask = 'Tasks'
		argIDVal.forEach( ( id, index ) => textID += `${ id }${ ( index !== ( argIDVal.length -1 ) ? ',' : '' ) }` )
		ids.push( ...argIDVal )
	}
	else
	{
		textTask = 'Task'
		textID = `${ argIDVal }`
		ids.push( argIDVal )
	}

	ids.map( id => tasks.push( storage.get( id ) ) )

	return 	{
				ids,
				tasks,
				textID,
				textTask
			}
}