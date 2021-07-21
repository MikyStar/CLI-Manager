import fs from 'fs'
import path from 'path'

import { FileNotFoundError, JSONParseError, SaveFileError } from '../errors/FileErrors';

////////////////////////////////////////

export namespace System
{
	export const exit = ( code = 0 ) => process.exit( code )

	export const getAbsolutePath = ( relativePath: string ) => path.join( process.cwd(), relativePath )

	////////////////////

	export const readJSONFile = ( absolutePath: string ) : any =>
	{
		let file
		let datas = {}
	
		try
		{
			file = fs.readFileSync( absolutePath, { encoding: 'utf8', flag: 'r' } )
		}
		catch( error )
		{
			throw new FileNotFoundError( absolutePath, error )
		}
	
		try
		{
			datas = JSON.parse( file )
		}
		catch( error )
		{
			throw new JSONParseError( absolutePath, error )
		}
	
		return datas
	}
	
	export const writeJSONFile = ( absolutePath: string, datas: any ) : any =>
	{
		try
		{
			fs.writeFileSync( absolutePath, JSON.stringify( datas, null, 4 ) )
		}
		catch( error )
		{
			throw new SaveFileError( absolutePath, error )
		}
	}
}
