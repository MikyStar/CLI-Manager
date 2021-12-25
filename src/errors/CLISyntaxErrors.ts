import { CatchableError } from './CatchableError';

import { ManEntries } from '../core/Help';

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

export class AddingTaskSyntaxError extends CLISyntaxError
{
	constructor( message: string, details ?: any )
	{
		super( message, 'creatingTask', details )
	}
}

////////////////////////////////////////

export class CheckingTaskSyntaxError extends CLISyntaxError
{
	constructor( message: string, details ?: any )
	{
		super( message, 'checkingTask', details )
	}
}

////////////////////////////////////////

export class IncrementingTaskSyntaxError extends CLISyntaxError
{
	constructor( message: string, details ?: any )
	{
		super( message, 'incrementingTask', details )
	}
}

////////////////////////////////////////

export class EditingSyntaxError extends CLISyntaxError
{
	constructor( message: string, details ?: any )
	{
		super( message, 'editing', details )
	}
}

////////////////////////////////////////

export class DeletingTaskSyntaxError extends CLISyntaxError
{
	constructor( message: string, details ?: any )
	{
		super( message, 'deleting', details )
	}
}

////////////////////////////////////////

export class MovingTaskSyntaxError extends CLISyntaxError
{
	constructor( message: string, details ?: any )
	{
		super( message, 'movingTask', details )
	}
}

////////////////////////////////////////

export class GroupBySyntaxError extends CLISyntaxError
{
	constructor( message: string, details ?: any )
	{
		super( message, 'viewing', details )
	}
}

////////////////////////////////////////

export class ExtractSyntaxError extends CLISyntaxError
{
	constructor( message: string, details ?: any )
	{
		super( message, 'extracting', details )
	}
}