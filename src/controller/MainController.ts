import { CliArgHandler, Action, isAction } from "../core/CliArgHandler";
import { Printer, PrinterFactory } from "../core/Printer";
import { Storage, DEFAULT_STORAGE_FILE_NAME, StorageFactory } from "../core/Storage";
import { Config, DEFAULT_CONFIG_FILE_NAME, DEFAULT_CONFIG_DATAS } from "../core/Config";
import { System } from "../core/System";

import { FileAlreadyExistsError, FileNotFoundError } from '../errors/FileErrors'

////////////////////////////////////////

export class MainController
{
	argHandler: CliArgHandler

	printer: Printer

	config ?: Config
	storage ?: Storage

	////////////////////

	/**
	 * Handles init and expose context to Main flow
	 */
	constructor()
	{
		this.argHandler = new CliArgHandler()
		const { flags } = this.argHandler
		const { storageLocation } = flags

		//////////


		if( System.doesFileExists( DEFAULT_CONFIG_FILE_NAME ) )
			this.config = new Config( DEFAULT_CONFIG_FILE_NAME )

		this.handleCreatingFiles()

		const finalStorageLocation = storageLocation || this.config.storageFile || DEFAULT_STORAGE_FILE_NAME

		if( System.doesFileExists( finalStorageLocation ) )
			this.storage = new Storage( finalStorageLocation )
		else
			throw new FileNotFoundError( finalStorageLocation )


		this.printer = PrinterFactory.create( this.argHandler, this.config, this.storage )
	}

	////////////////////

	private handleCreatingFiles = () =>
	{
		const { words } = this.argHandler
		const [ firstArg, secondArg ] = words

		const printer = new Printer()

		const isStorageCreate = ( words.length > 0 ) && isAction( firstArg ) && ( firstArg.value === Action.CREATE_STORAGE )
		const isConfigCreate = ( words.length > 0 ) && isAction( firstArg ) && ( firstArg.value === Action.CREATE_CONFIG )

		if( isConfigCreate || isStorageCreate )
		{
			if( isConfigCreate )
			{
				if( System.doesFileExists( DEFAULT_CONFIG_FILE_NAME ) )
					throw new FileAlreadyExistsError( DEFAULT_CONFIG_FILE_NAME )

				System.writeJSONFile( DEFAULT_CONFIG_FILE_NAME, DEFAULT_CONFIG_DATAS )
				printer.addFeedback( `Config file '${ DEFAULT_CONFIG_FILE_NAME }' created` )
			}
			else if( isStorageCreate )
			{
				const storagePath = ( secondArg.value as string ) || DEFAULT_STORAGE_FILE_NAME

				if( System.doesFileExists( storagePath ) )
					throw new FileAlreadyExistsError( storagePath )

				StorageFactory.init( storagePath )
				printer.addFeedback( `Storage file '${ storagePath }' created` )
			}

			printer.printFeedback()
			System.exit()
		}
	}
}