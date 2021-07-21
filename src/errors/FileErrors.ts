import { CatchableError } from './CatchableError';

////////////////////////////////////////

export class FileNotFoundError extends CatchableError
{
	constructor( fullPath: string )
	{
		super( `Can't find ${ fullPath } run 'tasks init'` )
	}
}

export class JSONParseError extends CatchableError
{
	constructor( fullPath: string )
	{
		super( `Problem parsing ${ fullPath } to JSON` )
	}
}