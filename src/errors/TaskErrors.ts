import { CatchableError } from './CatchableError';

////////////////////////////////////////

export class TaskNotFoundError extends CatchableError
{
	constructor( id: number, error ?: any )
	{
		super( `Task n°${ id } not found`, error )
	}
}

export class TaskStateUnknownError extends CatchableError
{
	constructor( taskID: number, state: string, error ?: any )
	{
		super( `Task's n°${ taskID } state '${ state }' is not defined in your configuration file`, error )
	}
}