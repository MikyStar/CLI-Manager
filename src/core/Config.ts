import { readJsonFile } from '../utils'

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
	defaultArgs : DefaultArgs
	states : ConfigState[]

	////////////////////////////////////////

	constructor()
	{
		const configDatas = readJsonFile( CONFIG_FILE_NAME )

		this.defaultArgs = configDatas.defaultArgs
		this.states = configDatas.states
	}
}