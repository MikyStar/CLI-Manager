import { System } from './System'
import { PrinterConfig } from './Printer'

////////////////////////////////////////

export interface DefaultArgs extends PrinterConfig
{
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
	defaultArgs : DefaultArgs // TODO flatten

	////////////////////////////////////////

	constructor( relativePath : string )
	{
		this.relativePath = relativePath
		const configDatas = System.readJSONFile( this.relativePath )

		this.defaultArgs = configDatas.defaultArgs
	}
}