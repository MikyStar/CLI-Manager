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

export class TaskIdDuplicatedError extends CatchableError
{
	constructor( taskID: number, error ?: any )
	{
		super( `Multiple task has the id '${ taskID }'`, error )
	}
}

export class NoFurtherStateError extends CatchableError
{
	constructor( taskID: number, error ?: any )
	{
		super( `Final state already reached for task '${ taskID }'`, error )
	}
}