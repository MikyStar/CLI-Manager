import { Action, CliArgHandler } from "./core/CliArgHandler";
import { Config } from "./core/Config";
import { Storage, DEFAULT_STORAGE_FILE_NAME } from "./core/Storage";
import { Prompt } from "./core/Prompt";
import { ITask } from "./core/Task";
import { PrintArgs, Printer } from "./core/Printer";

import { exit } from './utils'

////////////////////////////////////////

console.log('system args', process.argv )

const argHandler = new CliArgHandler()

const firstArg = argHandler.getFirstArg()
const isHelpNeeded = argHandler.isHelpNeeded()

//////////

const isInit = argHandler.isThereOnlyOneCLIArgs() && ( firstArg.isAction ) && ( firstArg.value === Action.INIT )  
if( isInit )
{

}

//////////

const config = new Config()
const specificFileLocation = argHandler.getStorageLocation() || config.defaultArgs.storageFile
const storage = new Storage( specificFileLocation || DEFAULT_STORAGE_FILE_NAME )


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
	exit()
}

if( argHandler.isThereOnlyOneCLIArgs() && firstArg.isTask )
{
	const tasksId = firstArg.value as number[]

	Printer.printTasks( tasksId, printOptions )
	exit()
}

//////////

const { description, state, linked } = argHandler.getTaskFlags()
const board = argHandler.getBoard() || config.defaultArgs.board

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