import { CatchableError } from './CatchableError';

////////////////////////////////////////

export class FileNotFoundError extends CatchableError
{
	constructor( fullPath: string, error ?: any )
	{
		super( `Can't find ${ fullPath } run 'tasks init'`, error )
	}
}

export class FileAlreadyExistsError extends CatchableError
{
	constructor( fullPath: string )
	{
		super( `File ${ fullPath } already exists` )
	}
}

export class JSONParseError extends CatchableError
{
	constructor( fullPath: string, error ?: any )
	{
		super( `Problem parsing ${ fullPath } to JSON`, error )
	}
}

export class SaveFileError extends CatchableError
{
	constructor( fullPath: string, error ?: any )
	{
		super( `Problem saving ${ fullPath } `, error )
	}
}