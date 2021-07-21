import fs from 'fs';
import path from 'path';

////////////////////////////////////////

export interface ConfigState
{
	name: string,
	hexColor: string,
	icon: string
}

export interface DefaultArgs
{
	hideDescription ?: boolean,
	hideTimestamp ?: boolean,
	hideSubCounter ?: boolean,
	hideTree ?: boolean,

	depth ?: number,

	board ?: string,
	storageFile ?: string,
}

////////////////////////////////////////

export const CONFIG_FILE_NAME = "task.config.json"

////////////////////////////////////////

/**
 * Expose task.config.json is current working directory datas
 */
export class Config
{
	configPath : string

	defaultArgs : DefaultArgs
	states : ConfigState[]

	////////////////////////////////////////

	constructor()
	{
		try
		{
			this.configPath = path.join( process.cwd(), CONFIG_FILE_NAME )
			const configDatas = JSON.parse( fs.readFileSync( this.configPath, { encoding: 'utf8', flag: 'r' } ) )

			this.defaultArgs = configDatas.defaultArgs
			this.states = configDatas.states
		}
		catch( err )
		{
			console.error(err)
			console.error(`Can't find ${ CONFIG_FILE_NAME } in current working directory, run 'tasks init'`)

			process.exit(-1)
		}
	}
}