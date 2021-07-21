import fs from 'fs'
import path from 'path'

import { FileNotFoundError, JSONParseError, SaveFileError } from '../errors/FileErrors';

////////////////////////////////////////

export namespace System
{
	export const exit = ( code = 0 ) => process.exit( code )

	export const getAbsolutePath = ( relativePath: string ) => path.join( process.cwd(), relativePath )

	////////////////////

	export const readJSONFile = ( relativePath: string ) : any =>
	{
		let file
		let datas = {}
	
		try
		{
			file = fs.readFileSync( getAbsolutePath( relativePath ), { encoding: 'utf8', flag: 'r' } )
		}
		catch( error )
		{
			throw new FileNotFoundError( relativePath, error )
		}
	
		try
		{
			datas = JSON.parse( file )
		}
		catch( error )
		{
			throw new JSONParseError( relativePath, error )
		}
	
		return datas
	}

	export const doesFileExists = ( relativePath: string ) : boolean => fs.existsSync( getAbsolutePath( relativePath ) ) || false

	export const writeJSONFile = ( relativePath: string, datas: any ) : any =>
	{
		try
		{
			fs.writeFileSync( getAbsolutePath( relativePath ), JSON.stringify( datas, null, 4 ) )
		}
		catch( error )
		{
			throw new SaveFileError( relativePath, error )
		}
	}
}
