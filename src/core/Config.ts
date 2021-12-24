import { System } from './System'
import { PrinterConfig } from './Printer'
import { GroupByType, Order } from './TaskList'

////////////////////////////////////////

export const DEFAULT_CONFIG_FILE_NAME = "task.config.json"

export const DEFAULT_CONFIG_DATAS: ConfigFile =
{
	shouldNotPrintAfter: false,
	storageFile: "tasks.json"
}

export interface ConfigFile extends PrinterConfig
{
	storageFile ?: string
	configFile ?: string

	shouldNotPrintAfter ?: boolean
	hideDescription ?: boolean
	hideTimestamp ?: boolean
	hideSubCounter ?: boolean
	hideTree ?: boolean

	depth ?: number
	groupBy ?: GroupByType
	sort ?: Order
}

////////////////////////////////////////

/**
 * Expose task.config.json is current working directory datas
 */
export class Config implements PrinterConfig
{
	relativePath : string
	storageFile ?: string
	configFile ?: string

	shouldNotPrintAfter ?: boolean
	hideDescription ?: boolean
	hideTimestamp ?: boolean
	hideSubCounter ?: boolean
	hideTree ?: boolean

	depth ?: number
	groupBy ?: GroupByType
	sort ?: Order

	////////////////////////////////////////

	constructor( relativePath : string )
	{
		this.relativePath = relativePath
		const configDatas = System.readJSONFile( this.relativePath )

		Object.assign( this, configDatas )
	}
}