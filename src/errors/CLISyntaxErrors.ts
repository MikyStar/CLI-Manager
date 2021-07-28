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

export class CheckingTaskSytaxError extends CLISyntaxError
{
	constructor( message: string, details ?: any )
	{
		super( message, 'checkingTask', details )
	}
}

////////////////////////////////////////

export class IncrementingTaskSytaxError extends CLISyntaxError
{
	constructor( message: string, details ?: any )
	{
		super( message, 'incrementingTask', details )
	}
}

////////////////////////////////////////

export class EditingTaskSytaxError extends CLISyntaxError
{
	constructor( message: string, details ?: any )
	{
		super( message, 'editingTask', details )
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