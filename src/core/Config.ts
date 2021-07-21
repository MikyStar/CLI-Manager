import { readJsonFile, getAbsolutePath } from '../utils'

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
	printAfterEdition ?: boolean

	storageFile ?: string,
	configFile ?: string,
}

////////////////////////////////////////

export const DEFAULT_CONFIG_FILE_NAME = "task.config.json"

////////////////////////////////////////

/**
 * Expose task.config.json is current working directory datas
 */
export class Config
{
	filePath : string
	defaultArgs : DefaultArgs
	states : ConfigState[]

	////////////////////////////////////////

	constructor( relativePath : string )
	{
		this.filePath = getAbsolutePath( relativePath )
		const configDatas = readJsonFile( this.filePath )

		this.defaultArgs = configDatas.defaultArgs
		this.states = configDatas.states
	}
}