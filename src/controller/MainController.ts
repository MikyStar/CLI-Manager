import { CliArgHandler, RawArg, Action, TaskFlags } from "../core/CliArgHandler";
import { PrintArgs, Printer } from "../core/Printer";
import { Storage, DEFAULT_STORAGE_FILE_NAME, DEFAULT_STORAGE_DATAS } from "../core/Storage";
import { Config, DEFAULT_CONFIG_FILE_NAME, DEFAULT_CONFIG_DATAS } from "../core/Config";
import { System } from "../core/System";

import { FileNotFoundError } from '../errors/FileErrors'

////////////////////////////////////////

export class MainController
{
	argHandler: CliArgHandler
	userFeedback: string
	printOptions ?: PrintArgs
	firstArg ?: RawArg
	isHelpNeeded: boolean
	printAfter: boolean

	configLocation : string
	config ?: Config
	storageLocation: string
	storage ?: Storage

	board: string
	taskFlags: TaskFlags

	////////////////////

	/**
	 * Handles init and expose context to handle the Main flow
	 */
	constructor( cliArgHandler: CliArgHandler )
	{
		this.argHandler = cliArgHandler
		this.userFeedback = ''

		this.firstArg = this.argHandler.getFirstArg()
		this.isHelpNeeded = this.argHandler.isHelpNeeded()


		this.configLocation = this.argHandler.getConfigLocation() || DEFAULT_CONFIG_FILE_NAME
		this.storageLocation = this.argHandler.getStorageLocation()

		if( System.doesFileExists( this.configLocation ) )
		{
			this.config = new Config( this.configLocation )
			this.storageLocation =  this.storageLocation || this.config.defaultArgs.storageFile
		}

		if( !this.storageLocation )
			this.storageLocation = DEFAULT_STORAGE_FILE_NAME

		if( System.doesFileExists( this.storageLocation ) )
			this.storage = new Storage( this.storageLocation )

		const isInit = this.argHandler.isThereCLIArgs() && ( this.firstArg.isAction ) && ( this.firstArg.value === Action.INIT )  
		if( isInit )
			this.handleInit()

		//////////

		if( !this.config )
			throw new FileNotFoundError( this.configLocation )
		if( !this.storage )
			throw new FileNotFoundError( this.storageLocation )

		this.printOptions =
		{
			datas: this.storage,
			states: this.config.states,
			...this.argHandler.getStringifyArgs(),
			...this.config.defaultArgs
		}

		this.taskFlags = this.argHandler.getTaskFlags()
		this.board = this.argHandler.getBoard() || this.config.defaultArgs.board
		this.printAfter = this.argHandler.getPrintAfter() || this.config.defaultArgs.printAfter
	}

	////////////////////

	addFeedbackLine = ( message: string ) => this.userFeedback += message + '\n'
	printFeedback = () => Printer.feedBack( this.userFeedback )

	handleInit = () =>
	{
		if( !this.config )
		{
			System.writeJSONFile( this.configLocation, DEFAULT_CONFIG_DATAS )
			this.addFeedbackLine( `Config file '${ this.configLocation }' created` )
		}

		if( !this.storage )
		{
			System.writeJSONFile( this.storageLocation, DEFAULT_STORAGE_DATAS )
			this.addFeedbackLine( `Storage file '${ this.storageLocation }' created` )
		}

		this.stop()
	}

	printAll = () => Printer.printAll( this.printOptions )
	printTasks = ( tasksID: number[] ) => Printer.printTasks( tasksID, this.printOptions )
	printBoards = ( boardNames: string[] ) => Printer.printBoards( boardNames, this.printOptions )

	/**
	 * Prints feedback if needed and print all if user params print afer then stop
	 */
	stop = ( code ?: number ) =>
	{
		if( this.userFeedback !== '' )
			this.printFeedback()

		if( this.printAfter )
		{
			if( this.board )
				this.printBoards( [ this.board ] )
			else
				this.printAll()
		}

		System.exit( code )
	}
}