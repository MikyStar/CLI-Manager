import { CliArgHandler, Action, isAction } from "../core/CliArgHandler";
import { Printer, PrinterConfig } from "../core/Printer";
import { Storage, DEFAULT_STORAGE_FILE_NAME, DEFAULT_STORAGE_DATAS } from "../core/Storage";
import { Config, DEFAULT_CONFIG_FILE_NAME, DEFAULT_CONFIG_DATAS } from "../core/Config";
import { System } from "../core/System";

import { FileNotFoundError } from '../errors/FileErrors'

////////////////////////////////////////

export class MainController
{
	argHandler: CliArgHandler

	printer: Printer

	configLocation : string
	config ?: Config
	storageLocation: string
	storage ?: Storage

	////////////////////

	/**
	 * Handles init and expose context to Main flow
	 */
	constructor()
	{
		this.argHandler = new CliArgHandler()
		const { flags, words } = this.argHandler
		const { files, printing } = flags
		const [ firstArg ] = words

		this.configLocation = files.configLocation || DEFAULT_CONFIG_FILE_NAME
		this.storageLocation = files.storageLocation

		if( System.doesFileExists( this.configLocation ) )
		{
			this.config = new Config( this.configLocation )
			this.storageLocation =  this.storageLocation || this.config.defaultArgs.storageFile
		}

		if( !this.storageLocation )
			this.storageLocation = DEFAULT_STORAGE_FILE_NAME

		if( System.doesFileExists( this.storageLocation ) )
			this.storage = new Storage( this.storageLocation )

		const isInit = ( words.length > 0 ) && isAction( firstArg ) && ( firstArg.value === Action.INIT )
		if( isInit )
			this.handleInit()

		//////////

		if( !this.config )
			throw new FileNotFoundError( this.configLocation )

		if( !this.storage )
			throw new FileNotFoundError( this.storageLocation )

		const printConfig: PrinterConfig =
		{
			...printing,
			...this.config.defaultArgs
		}
		this.printer = new Printer( this.storage, this.config.states, printConfig )
	}

	////////////////////

	handleInit = () =>
	{
		if( !this.config )
		{
			System.writeJSONFile( this.configLocation, DEFAULT_CONFIG_DATAS )
			this.printer.addFeedback( `Config file '${ this.configLocation }' created` )
		}

		if( !this.storage )
		{
			System.writeJSONFile( this.storageLocation, DEFAULT_STORAGE_DATAS )
			this.printer.addFeedback( `Storage file '${ this.storageLocation }' created` )
		}

		this.printer.printFeedback()
		System.exit()
	}
}