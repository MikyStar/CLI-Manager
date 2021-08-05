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

export class AddingTaskSytaxError extends CLISyntaxError
{
	constructor( message: string, details ?: any )
	{
		super( message, 'creatingTask', details )
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

export class EditingSytaxError extends CLISyntaxError
{
	constructor( message: string, details ?: any )
	{
		super( message, 'editing', details )
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

////////////////////////////////////////

export class MovingTaskSytaxError extends CLISyntaxError
{
	constructor( message: string, details ?: any )
	{
		super( message, 'movingTask', details )
	}
}

////////////////////////////////////////

export class ExtractingBoardSytaxError extends CLISyntaxError
{
	constructor( message: string, details ?: any )
	{
		super( message, 'extractingBoards', details )
	}
}