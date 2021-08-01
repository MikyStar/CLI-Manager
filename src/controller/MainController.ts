import { CliArgHandler, RawArg, Action, TaskFlags } from "../core/CliArgHandler";
import { Printer, PrinterConfig } from "../core/Printer";
import { Storage, DEFAULT_STORAGE_FILE_NAME, DEFAULT_STORAGE_DATAS } from "../core/Storage";
import { Config, DEFAULT_CONFIG_FILE_NAME, DEFAULT_CONFIG_DATAS } from "../core/Config";
import { System } from "../core/System";

import { FileNotFoundError } from '../errors/FileErrors'

////////////////////////////////////////

export interface ExitArgs
{
	code ?: number,
	bypassPrintAfter ?: boolean,
	dontPrintBoardButPrintAll ?: boolean
}

////////////////////////////////////////

export class MainController
{
	argHandler: CliArgHandler
	firstArg ?: RawArg
	isHelpNeeded: boolean

	printAfter: boolean
	printer: Printer

	configLocation : string
	config ?: Config
	storageLocation: string
	storage ?: Storage

	board: string
	taskFlags: TaskFlags

	////////////////////

	/**
	 * Handles init and expose context to Main flow
	 */
	constructor()
	{
		this.argHandler = new CliArgHandler()
		this.printer = new Printer()

		this.firstArg = this.argHandler.getFirstArg()
		this.isHelpNeeded = this.argHandler.isHelpNeeded


		this.configLocation = this.argHandler.configLocation || DEFAULT_CONFIG_FILE_NAME
		this.storageLocation = this.argHandler.storageLocation

		if( System.doesFileExists( this.configLocation ) )
		{
			this.config = new Config( this.configLocation )
			this.storageLocation =  this.storageLocation || this.config.defaultArgs.storageFile
		}

		if( !this.storageLocation )
			this.storageLocation = DEFAULT_STORAGE_FILE_NAME

		if( System.doesFileExists( this.storageLocation ) )
			this.storage = new Storage( this.storageLocation )

		const isInit = this.argHandler.isThereCLIArgs && ( this.firstArg.isAction ) && ( this.firstArg.value === Action.INIT )  
		if( isInit )
			this.handleInit()

		//////////

		if( !this.config )
			throw new FileNotFoundError( this.configLocation )
		if( !this.storage )
			throw new FileNotFoundError( this.storageLocation )

		const printConfig: PrinterConfig =
		{
			...this.argHandler.printerConfig,
			...this.config.defaultArgs
		}
		this.printer = new Printer( this.storage, this.config.states, printConfig )

		this.taskFlags = this.argHandler.taskFlags
		this.board = this.argHandler.board || this.config.defaultArgs.board
		this.printAfter = this.argHandler.shouldPrintAfter || this.config.defaultArgs.printAfter
	}

	////////////////////

	handleInit = () =>
	{
		if( !this.config )
		{
			System.writeJSONFile( this.configLocation, DEFAULT_CONFIG_DATAS )
			this.printer.add( `Config file '${ this.configLocation }' created` )
		}

		if( !this.storage )
		{
			System.writeJSONFile( this.storageLocation, DEFAULT_STORAGE_DATAS )
			this.printer.add( `Storage file '${ this.storageLocation }' created` )
		}

		this.exit()
	}

	printAll = () => Printer.printAll( this.printOptions )
	printTasks = ( tasksID: number | number[] ) => Printer.printTasks( tasksID, this.printOptions )
	printBoards = ( boardNames: string | string[] ) => Printer.printBoards( boardNames, this.printOptions )

	/**
	 * Handles feedback, print afer and stopping
	 */
	exit = ( args ?: ExitArgs ) =>
	{
		args = args || {}
		const { code, bypassPrintAfter, dontPrintBoardButPrintAll } = args

		if( this.printAfter && !bypassPrintAfter )
		{
			if( this.board && !dontPrintBoardButPrintAll )
				this.printBoards( this.board )
			else
				this.printAll()
		}

		if( this.userFeedback.length !== 0 )
			this.printFeedback()

		System.exit( code )
	}
}