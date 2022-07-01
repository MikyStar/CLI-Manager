import fs from 'fs'
import path from 'path'

import { FileNotFoundError, JSONParseError, SaveFileError } from '../errors/FileErrors';
import { StorageFile } from './Storage';
import { ConfigFile } from './Config';

////////////////////////////////////////

export namespace System
{
	export const exit = ( code = 0 ) => process.exit( code )

	/**
	 * Returns as is if it's already absolute, otherwise make it absolute
	 */
	export const getAbsolutePath = ( filePath: string ) =>
		path.isAbsolute(filePath)
		? filePath
		: path.join( process.cwd(), filePath )

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

	export const writeJSONFile = ( relativePath: string, datas: StorageFile | ConfigFile ) : any =>
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
