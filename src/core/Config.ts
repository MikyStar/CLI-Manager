import { System } from './System'
import { PrinterConfig } from './Printer'

////////////////////////////////////////

export interface ConfigState
{
	name: string,
	hexColor: string,
	icon: string
}

export interface DefaultArgs extends PrinterConfig
{
	board ?: string,

	storageFile ?: string,
	configFile ?: string,
}

////////////////////////////////////////

export const DEFAULT_CONFIG_FILE_NAME = "task.config.json"

export const DEFAULT_CONFIG_DATAS =
{
	"defaultArgs":
	{
		"shouldNotPrintAfter": false,
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
	relativePath : string
	defaultArgs : DefaultArgs
	states : ConfigState[]

	////////////////////////////////////////

	constructor( relativePath : string )
	{
		this.relativePath = relativePath
		const configDatas = System.readJSONFile( this.relativePath )

		this.defaultArgs = configDatas.defaultArgs
		this.states = configDatas.states
	}
}