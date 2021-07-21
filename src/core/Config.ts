import { System } from './System'

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

export const DEFAULT_CONFIG_DATAS =
{
	"defaultArgs":
	{
		"printAfterEdition": true,
		"board": "backlog",
		"storageFile": "tasks.json"
	},
	"states": [
		{
			"name": "todo",
			"hexColor": "#ff8f00",
			"icon": "☐"
		},
		{
			"name": "wip",
			"hexColor": "#ab47bc",
			"icon": "✹"
		},
		{
			"name": "to test",
			"hexColor": "#2196f3",
			"icon": "♦"
		},
		{
			"name": "done",
			"hexColor": "#66bb6a",
			"icon": "✔"
		}
	]
}

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
		this.filePath = System.getAbsolutePath( relativePath )
		const configDatas = System.readJSONFile( this.filePath )

		this.defaultArgs = configDatas.defaultArgs
		this.states = configDatas.states
	}
}