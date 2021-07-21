import { Action, CliArgHandler } from "./CliArgHandler";
import { Config } from "./Config";
import { Storage, DEFAULT_STORAGE_FILE_NAME } from "./Storage";
import { Prompt } from "./Prompt";
import { ITask } from "./Task";
import { PrintArgs, Printer } from "./Printer";

////////////////////////////////////////

export class CommandLauncher
{
	config: Config
	storage: Storage

	////////////////////

	constructor()
	{
		const argHandler = new CliArgHandler()

		const firstArg = argHandler.getFirstArg()
		const isHelpNeeded = argHandler.isHelpNeeded()

		//////////

		const isInit = argHandler.isThereOnlyOneCLIArgs() && ( firstArg.isAction ) && ( firstArg.value === Action.INIT )  
		if( isInit )
		{

		}

		//////////

		this.config = new Config()
		const specificFileLocation = argHandler.getStorageLocation() || this.config.defaultArgs.storageFile
		this.storage = new Storage( specificFileLocation || DEFAULT_STORAGE_FILE_NAME )


		const printOptions : PrintArgs =
		{
			datas: this.storage,
			states: this.config.states,
			...argHandler.getStringifyArgs(),
			...this.config.defaultArgs
		}

		if( !argHandler.isThereCLIArgs() )
		{
			Printer.printAll( printOptions )
			return
		}

		if( argHandler.isThereOnlyOneCLIArgs() && firstArg.isTask )
		{
			const tasksId = firstArg.value as number[]

			Printer.printTasks( tasksId, printOptions )
			return
		}

		//////////

		const { description, state, linked } = argHandler.getTaskFlags()
		const board = argHandler.getBoard() || this.config.defaultArgs.board

		if( firstArg.isAction )
		{
			switch( firstArg.value )
			{
				case Action.ADD_TASK:
				{
					if( argHandler.isThereOnlyOneCLIArgs() )
						Prompt.addTask( this.storage, this.config )

					const task : ITask =
					{
						name: argHandler.getFirstText(),
						state: state || this.config.states[ 0 ].name,
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

					this.storage.addTask( task, parentItem )

					break;
				}

				////////////////////

				case Action.ADD_BOARD:
				{
					this.storage.addBoard( argHandler.getFirstText(), description )
					break;
				}
			}
		}
	}
}