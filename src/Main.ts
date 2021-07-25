import { Action, CliArgHandler } from "./core/CliArgHandler";
import { Config, DEFAULT_CONFIG_FILE_NAME, DEFAULT_CONFIG_DATAS } from "./core/Config";
import { Storage, DEFAULT_STORAGE_FILE_NAME, DEFAULT_STORAGE_DATAS } from "./core/Storage";
import { Prompt } from "./core/Prompt";
import { ITask } from "./core/Task";
import { PrintArgs, Printer } from "./core/Printer";
import { System } from './core/System'

import { FileAlreadyExistsError } from './errors/FileErrors'

////////////////////////////////////////

try
{
	const argHandler = new CliArgHandler()
	
	const firstArg = argHandler.getFirstArg()
	const isHelpNeeded = argHandler.isHelpNeeded()
	
	//////////
	
	const isInit = argHandler.isThereCLIArgs() && ( firstArg.isAction ) && ( firstArg.value === Action.INIT )  
	if( isInit )
	{
		let feedBack = ''
		const configLocationFromCLI = argHandler.getConfigLocation()
		const storageLocation = argHandler.getStorageLocation() || DEFAULT_STORAGE_FILE_NAME

		if( configLocationFromCLI )
		{
			if( System.doesFileExists( configLocationFromCLI ) )
				throw new FileAlreadyExistsError( configLocationFromCLI )
			else
			{
				System.writeJSONFile( configLocationFromCLI, DEFAULT_CONFIG_DATAS )
				feedBack += `Config file '${ configLocationFromCLI }' created\n`
			}
		}
		else
		{
			if( !System.doesFileExists( DEFAULT_CONFIG_FILE_NAME ) )
			{
				System.writeJSONFile( DEFAULT_STORAGE_FILE_NAME, DEFAULT_CONFIG_DATAS )
				feedBack += `Config file '${ DEFAULT_STORAGE_FILE_NAME }' created\n`
			}
		}

		if( System.doesFileExists( storageLocation ) )
			throw new FileAlreadyExistsError( storageLocation )
		else
		{
			System.writeJSONFile( storageLocation, DEFAULT_STORAGE_DATAS )
			feedBack +=`Storage file '${ storageLocation }' created`
		}

		Printer.feedBack( feedBack )
	}
	
	//////////
	
	const configLocation = argHandler.getConfigLocation() || DEFAULT_CONFIG_FILE_NAME
	const config = new Config( configLocation )
	const storageLocation = argHandler.getStorageLocation() || config.defaultArgs.storageFile || DEFAULT_STORAGE_FILE_NAME
	const storage = new Storage( storageLocation )

	const printOptions : PrintArgs =
	{
		datas: storage,
		states: config.states,
		...argHandler.getStringifyArgs(),
		...config.defaultArgs
	}
	
	if( !argHandler.isThereCLIArgs() )
	{
		Printer.printAll( printOptions )
		System.exit()
	}
	
	if( argHandler.isThereOnlyOneCLIArgs() && firstArg.isTask )
	{
		const tasksId = firstArg.value as number[]
	
		Printer.printTasks( tasksId, printOptions )
		System.exit()
	}
	
	//////////
	
	const { description, state, linked } = argHandler.getTaskFlags()
	const board = argHandler.getBoard() || config.defaultArgs.board
	const printAfterEdit = argHandler.getPrintAfterEdit() || config.defaultArgs.printAfterEdition
	
	if( firstArg.isAction )
	{
		switch( firstArg.value )
		{
			case Action.ADD_TASK:
			{
				if( argHandler.isThereOnlyOneCLIArgs() )
					Prompt.addTask( storage, config )
	
				const task : ITask =
				{
					name: argHandler.getFirstText(),
					state: state || config.states[ 0 ].name,
					dependencies: linked,
					description,
				}
	
				let parentItem = {}
				if( ( argHandler.untreatedArgs.length === 1 ) && ( argHandler.untreatedArgs[ 0 ].isTask ) )
				{
					parentItem = { subTaskOf: argHandler.untreatedArgs[ 0 ].value }
					argHandler.untreatedArgs.splice( 0, 1 )
				}
				else
					parentItem = { boardName: board }
	
				storage.addTask( task, parentItem )
	
				break;
			}
	
			////////////////////
	
			case Action.ADD_BOARD:
			{
				storage.addBoard( argHandler.getFirstText(), description )
				break;
			}
		}
	}

	if( printAfterEdit )
	{
		// TODO -> got to first print the updated board or file then say task added, not the other way arround
	}
}
catch( error )
{
	Printer.error( 'in main catch' + error )

	System.exit( - 1 )
}