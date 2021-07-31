import { Action } from "./core/CliArgHandler";
import { Prompt } from "./core/Prompt";
import { ITask } from "./core/Task";
import { Printer } from "./core/Printer";
import { System } from './core/System'

import Help from './utils/Help'

import { MainController, ExitArgs } from "./controller/MainController";

import { CLISyntaxError, DeletingTaskSytaxError, EditingSytaxError, CheckingTaskSytaxError
	, IncrementingTaskSytaxError, MovingTaskSytaxError } from './errors/CLISyntaxErrors';
import { CatchableError } from "./errors/CatchableError";
import { IBoard } from "./core/Board";

////////////////////////////////////////

try
{
	const controller = new MainController()
	const { argHandler, firstArg, storage, config, taskFlags, board } = controller
	const { state, description, linked } = taskFlags

	//////////

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
			controller.addFeedback( Help.version )

		controller.exit({ bypassPrintAfter: true })
	}

	if( argHandler.isThereOnlyTwoCLIArgs && firstArg.isAction && argHandler.isHelpNeeded )
	{
		controller.addFeedback( Help.handleAction( firstArg.value as Action ) )
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

			////////////////////

			case Action.EDIT:
			{
				const secondArg = argHandler.cliArgs[ 1 ]
				if( !secondArg.isTask && !secondArg.isBoard )
					throw new EditingSytaxError( "Your second arguments should be one or more tasks id join by ',' or a board name" )

				const name = argHandler.getFirstText()

				if( secondArg.isTask )
				{
				const dependencies = linked

				const newAttributes: ITask =
				{
					name,
					dependencies,
					state,
					description,
				}

				if( !name )
					delete newAttributes.name
				if( !dependencies )
					delete newAttributes.dependencies
				if( !state )
					delete newAttributes.state
				if( !description )
					delete newAttributes.description

				const ids = secondArg.value as number | number[]
				const tasksID = storage.editTask( ids, newAttributes, argHandler.isRecursive )

				const taskPluralHandled = ( tasksID.length > 1 ) ? 'Tasks' : 'Task'
				const stringifyiedIDS = ( tasksID.length > 1 ) ? ( tasksID.join(',') ) : tasksID
				controller.addFeedback( `${ taskPluralHandled } '${ stringifyiedIDS }' edited` )
				}
				else if( secondArg.isBoard )
				{
					const newAttributes: IBoard =
					{
						name,
						description,
					}

					if( !name )
						delete newAttributes.name
					if( !description )
						delete newAttributes.description

					const boardName = secondArg.value as string
					storage.editBoard( boardName, newAttributes )

					controller.addFeedback( `Board '${ boardName }' edited` )
				}

				controller.exit()
				break;
			}

			////////////////////

			case Action.CHECK:
			{
				const secondArg = argHandler.cliArgs[ 1 ]
				if( !secondArg.isTask )
					throw new CheckingTaskSytaxError( "Your second arguments should be a number or numbers join by ','" )

				const ids = secondArg.value as number | number[]

				const lastState = config.states[ config.states.length - 1 ].name
				const tasksID = storage.editTask( ids, { state: lastState }, argHandler.isRecursive )

				const taskPluralHandled = ( tasksID.length > 1 ) ? 'Tasks' : 'Task'
				const stringifyiedIDS = ( tasksID.length > 1 ) ? ( tasksID.join(',') ) : tasksID
				controller.addFeedback( `${ taskPluralHandled } '${ stringifyiedIDS }' checked` )
				controller.exit()
				break;
			}

			////////////////////

			case Action.INCREMENT:
			{
				const secondArg = argHandler.cliArgs[ 1 ]
				if( !secondArg.isTask )
					throw new IncrementingTaskSytaxError( "Your second arguments should be a number or numbers join by ','" )

				const ids = secondArg.value as number | number[]

				const statesNames = config.states.map( state => state.name )

				const tasksID = storage.incrementTask( ids, statesNames, argHandler.isRecursive )

				const taskPluralHandled = ( tasksID.length > 1 ) ? 'Tasks' : 'Task'
				const stringifyiedIDS = ( tasksID.length > 1 ) ? ( tasksID.join(',') ) : tasksID
				controller.addFeedback( `${ taskPluralHandled } '${ stringifyiedIDS }' incremented` )
				controller.exit()
				break;
			}

			////////////////////

			case Action.DELETE:
			{
				let exitOptions: ExitArgs = {}

				const secondArg = argHandler.cliArgs[ 1 ]
				if( secondArg.isTask )
				{
					const ids = secondArg.value as number | number[]
					const tasksID = storage.deleteTask( ids )

					const taskPluralHandled = ( tasksID.length > 1 ) ? 'Tasks' : 'Task'
					const stringifyiedIDS = ( tasksID.length > 1 ) ? ( tasksID.join(',') ) : tasksID
					controller.addFeedback( `${ taskPluralHandled } '${ stringifyiedIDS }' deleted` )
				}
				else if( secondArg.isBoard )
				{
					const board = secondArg.value as string
					storage.deleteBoard( board )

					controller.addFeedback( `Board '${ board }' deleted` )
					exitOptions = { dontPrintBoardButPrintAll: true }
				}
				else
					throw new DeletingTaskSytaxError( `Second arg '${ secondArg.value }' should be a board or task(s)` )

				controller.exit( exitOptions )
				break;
			}
		}
	}
}
catch( error )
{
	if( !( error instanceof CatchableError ) )
		Printer.error( error )
	else
	{
		if( error instanceof CLISyntaxError )
		{
			Printer.error( error.message )
			Printer.feedBack( Help.getMan( error.manEntry ) )
		}
	}

	System.exit( -1 )
}