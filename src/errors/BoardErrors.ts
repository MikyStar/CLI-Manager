import { CatchableError } from './CatchableError';

////////////////////////////////////////

export class BoardNotFoundError extends CatchableError
{
	constructor( boardName: string, error ?: any )
	{
		super( `Board '${ boardName }' not foud`, error )
	}
}

export class BoardAlreadyExistsError extends CatchableError
{
	constructor( boardName: string, error ?: any )
	{
		super( `A board named '${ boardName }' already exists`, error )
	}
}