import { Action } from "./core/CliArgHandler";
import { Prompt } from "./core/Prompt";
import { ITask } from "./core/Task";
import { Printer } from "./core/Printer";
import { System } from './core/System'

import Help from './utils/Help'

import { MainController } from "./controller/MainController";

////////////////////////////////////////

try
{
	const controller = new MainController()
	const { argHandler, firstArg, storage, config, taskFlags, board } = controller
	const { state, description, linked } = taskFlags

	//////////

	// ! REMOVE
	controller.addFeedback( Help.init() )
	controller.exit({bypassPrintAfter: true})
	// ! REMOVE

	if( !argHandler.isThereCLIArgs )
	{
		controller.printAll()
		controller.exit({ bypassPrintAfter: true })
	}

	if( argHandler.isThereOnlyOneCLIArgs )
	{
		if( firstArg.isTask )
		{
			const tasksId = firstArg.value as number[]

			controller.printTasks( tasksId )
		}
		else if( argHandler.isHelpNeeded )
			controller.addFeedback( Help.fullMan() )
		else if( argHandler.isVersion )
			controller.addFeedback( Help.version() )

		controller.exit({ bypassPrintAfter: true })
	}

	//////////

	if( firstArg.isAction )
	{
		switch( firstArg.value )
		{
			case Action.ADD_TASK:
			{
				let id

				if( argHandler.isThereOnlyOneCLIArgs )
					id = Prompt.addTask( storage, config )
				else
				{
					const task : ITask =
					{
						name: argHandler.getFirstText(),
						state: state || config.states[ 0 ].name,
						dependencies: linked,
						description,
					}

					let parentItem = {}
					const isRemainingOnlyATask = ( argHandler.untreatedArgs.length === 1 ) && ( argHandler.untreatedArgs[ 0 ].isTask ) 
					if( isRemainingOnlyATask )
					{
						parentItem = { subTaskOf: argHandler.untreatedArgs[ 0 ].value }
						argHandler.untreatedArgs.splice( 0, 1 )
					}
					else
						parentItem = { boardName: board }

					id = storage.addTask( task, parentItem )
				}

				controller.addFeedback( `Task n°${ id } added` )
				controller.exit()
				break;
			}

			////////////////////

			case Action.ADD_BOARD:
			{
				const boardName = storage.addBoard( argHandler.getFirstText(), description )

				controller.addFeedback( `Board '${ boardName }' added` )
				controller.exit()
				break;
			}
		}
	}
}
catch( error )
{
	Printer.error( error )
	System.exit( -1 )
}