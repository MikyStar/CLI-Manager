import fs from 'fs'
import path from 'path'

import { FileNotFoundError, JSONParseError } from '../errors/FileErrors';

////////////////////////////////////////

export const exit = ( code = 0 ) => process.exit( code )


export const readJsonFile = ( relativePath: string ) : any =>
{
	let file
	let datas = {}

	const fullPath = path.join( process.cwd(), relativePath )
	try
	{
		file = fs.readFileSync( fullPath, { encoding: 'utf8', flag: 'r' } )
	}
	catch( error )
	{
		throw new FileNotFoundError( fullPath )
	}

	try
	{
		datas = JSON.parse( file )
	}
	catch( error )
	{
		throw new JSONParseError( fullPath )
	}

	return datas
}