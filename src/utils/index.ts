import fs from 'fs'
import path from 'path'

import { FileNotFoundError, JSONParseError } from '../errors/FileErrors';

////////////////////////////////////////

export const exit = ( code = 0 ) => process.exit( code )

export const getAbsolutePath = ( relativePath: string ) => path.join( process.cwd(), relativePath )

export const readJsonFile = ( absolutePath: string ) : any =>
{
	let file
	let datas = {}

	try
	{
		file = fs.readFileSync( absolutePath, { encoding: 'utf8', flag: 'r' } )
	}
	catch( error )
	{
		throw new FileNotFoundError( absolutePath )
	}

	try
	{
		datas = JSON.parse( file )
	}
	catch( error )
	{
		throw new JSONParseError( absolutePath )
	}

	return datas
}