import { Action } from "./core/CliArgHandler";
import { Prompt } from "./core/Prompt";
import { ITask } from "./core/Task";
import { printError, printMessage } from "./core/Printer";
import { System } from './core/System'

import Help from './utils/Help'

import { MainController } from "./controller/MainController";

import { CLISyntaxError, DeletingTaskSytaxError, EditingSytaxError, CheckingTaskSytaxError
	, IncrementingTaskSytaxError, MovingTaskSytaxError } from './errors/CLISyntaxErrors';
import { CatchableError } from "./errors/CatchableError";
import { IBoard } from "./core/Board";

////////////////////////////////////////

try
{
	const controller = new MainController()
	const { argHandler, firstArg, storage, config, taskFlags, board, printer } = controller
	const { state, description, linked } = taskFlags

	//////////

	if( !argHandler.isThereCLIArgs )
	{
		printer.loadFileView().printView()
		System.exit()
	}

	if( argHandler.isThereOnlyOneCLIArgs )
	{
		if( firstArg.isTask )
		{
			const tasksId = firstArg.value as number[]

			printer.loadTaskView( tasksId ).printView()
		}
		else if( firstArg.isBoard )
		{
			const boardName = firstArg.value as string

			printer.loadBoardView( boardName ).printView()
		}
		else if( argHandler.isHelpNeeded )
			printer.addFeedback( Help.fullMan() ).printFeedback()
		else if( argHandler.isVersion )
			printer.addFeedback( Help.version ).printFeedback()

		System.exit()
	}

	if( argHandler.isThereOnlyTwoCLIArgs && firstArg.isAction && argHandler.isHelpNeeded )
	{
		printer.addFeedback( Help.handleAction( firstArg.value as Action ) ).printFeedback()
		System.exit()
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

				printer.addFeedback( `Task n°${ id } added` ).loadBoardView( board ).print()
				break;
			}

			////////////////////

			case Action.ADD_BOARD:
			{
				const boardName = storage.addBoard( argHandler.getFirstText(), description )

				printer.addFeedback( `Board '${ boardName }' added` ).loadBoardView( boardName ).print()
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
					printer.addFeedback( `${ taskPluralHandled } '${ stringifyiedIDS }' edited` ).loadTaskView( ids )
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

					printer.addFeedback( `Board '${ boardName }' edited` ).loadBoardView( board )
				}

				printer.print()
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
				printer.addFeedback( `${ taskPluralHandled } '${ stringifyiedIDS }' checked` ).loadTaskView( ids ).print()
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
				printer.addFeedback( `${ taskPluralHandled } '${ stringifyiedIDS }' incremented` ).loadTaskView( ids ).print()
				break;
			}

			////////////////////

			case Action.DELETE:
			{
				const secondArg = argHandler.cliArgs[ 1 ]
				if( secondArg.isTask )
				{
					const ids = secondArg.value as number | number[]

					const tasksID = storage.deleteTask( ids )

					const taskPluralHandled = ( tasksID.length > 1 ) ? 'Tasks' : 'Task'
					const stringifyiedIDS = ( tasksID.length > 1 ) ? ( tasksID.join(',') ) : tasksID
					printer.addFeedback( `${ taskPluralHandled } '${ stringifyiedIDS }' deleted` )
				}
				else if( secondArg.isBoard )
				{
					const board = secondArg.value as string
					storage.deleteBoard( board )

					printer.addFeedback( `Board '${ board }' deleted` )
				}
				else
					throw new DeletingTaskSytaxError( `Second arg '${ secondArg.value }' should be a board or task(s)` )

				printer.loadFileView().print()
				break;
			}

			////////////////////

			case Action.MOVE:
			{
				const secondArg = argHandler.cliArgs[ 1 ]
				const thirdArg = argHandler.cliArgs[ 2 ]

				if( !secondArg.isTask )
					throw new MovingTaskSytaxError( `Second arg '${ secondArg.value }' should be one or more task id` )

				if( !thirdArg.isTask && !thirdArg.isBoard )
					throw new MovingTaskSytaxError( `Third arg '${ thirdArg.value }' should be one task id or a board name` )

				const targetIDs = secondArg.value as number | number[]

				let destination = {}
				let destFeedback = ''
				if( thirdArg.isTask )
				{
					if( Array.isArray( thirdArg.value ) )
						throw new MovingTaskSytaxError( `Please provide only one destination task id` )

					const destTaskID = thirdArg.value as number
					destination = { subTask: destTaskID }
					destFeedback = `task n°${ destTaskID }`
					printer.loadTaskView( destTaskID )
				}
				else if( thirdArg.isBoard )
				{
					const destBoardName = thirdArg.value as string
					destination = { boardName: destBoardName }
					destFeedback = `board '${ destBoardName }'`
					printer.loadBoardView( destBoardName )
				}

				// TODO if no dest provided make new board with parent task name and check only one task to move

				storage.moveTask( targetIDs, destination )

				printer.addFeedback( `Tasks '${ targetIDs }' moved to ${ destFeedback }` ).print()
			}
		}

		System.exit()
	}
}
catch( error )
{
	if( !( error instanceof CatchableError ) )
		printError( error )
	else
	{
		if( error instanceof CLISyntaxError )
		{
			printError( error.message )
			printMessage( Help.getMan( error.manEntry ) )
		}
	}

	System.exit( -1 )
}