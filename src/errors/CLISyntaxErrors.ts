import { CatchableError } from './CatchableError';

import { ManEntries } from '../utils/Help';

////////////////////////////////////////

export class CLISyntaxError extends CatchableError
{
	manEntry: keyof ManEntries

	constructor( message: string, manEntry: keyof ManEntries, details ?: any )
	{
		super( message, details )
		this.manEntry = manEntry
	}
}

////////////////////////////////////////

export class DeletingTaskSytaxError extends CLISyntaxError
{
	constructor( message: string, details ?: any )
	{
		super( message, 'deleting', details )
	}
}