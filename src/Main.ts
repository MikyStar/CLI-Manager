import { Action, isBoard, isTask, isAction } from "./core/CliArgHandler";
import { Prompt } from "./core/Prompt";
import { ITask } from "./core/Task";
import { printError, printMessage } from "./core/Printer";
import { System } from './core/System'

import Help from './utils/Help'

import { MainController } from "./controller/MainController";

import { CLISyntaxError, DeletingTaskSytaxError, EditingSytaxError, CheckingTaskSytaxError
	, IncrementingTaskSytaxError, MovingTaskSytaxError, AddingTaskSytaxError } from './errors/CLISyntaxErrors';
import { CatchableError } from "./errors/CatchableError";
import { IBoard } from "./core/Board";

////////////////////////////////////////

try
{
	const controller = new MainController()
	const { argHandler, storage, config, printer } = controller

	const { flags, words } = argHandler
	const [ firstArg, secondArg, thirdArg, ...restSentence ] = words
	const { dataAttributes, isHelpNeeded, isVersion, isRecursive } = flags
	const { state, description, linked } = dataAttributes

	const isThereCLIArgs = words.length > 0
	const isThereOnlyOneCLIArgs = words.length === 1
	const isThereOnlyTwoCLIArgs = words.length === 2

	//////////

	if( !isThereCLIArgs )
	{
		printer.loadFileView().printView()
		System.exit()
	}

	if( isThereOnlyOneCLIArgs )
	{
		if( isTask( firstArg ) )
		{
			const tasksId = firstArg.value as number[]

			printer.loadTaskView( tasksId ).printView()
		}
		else if( isBoard( firstArg ) )
		{
			const boardName = firstArg.value as string

			printer.loadBoardView( boardName ).printView()
		}
		else if( isHelpNeeded )
			printer.addFeedback( Help.fullMan() ).printFeedback()
		else if( isVersion )
			printer.addFeedback( Help.version ).printFeedback()

		System.exit()
	}

	if( isThereOnlyTwoCLIArgs && isAction( firstArg ) && isHelpNeeded )
	{
		printer.addFeedback( Help.handleAction( firstArg.value as Action ) ).printFeedback()
		System.exit()
	}

	//////////

	if( isAction( firstArg ) )
	{
		switch( firstArg.value )
		{
			case Action.ADD_TASK:
			{
				let id

				if( isThereOnlyOneCLIArgs )
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

					let parentItem
					if( isTask( secondArg ) )
						parentItem = { subTaskOf: secondArg.value as number }
					else if( isBoard( secondArg ) )
						parentItem = { boardName: secondArg.value as string }
					else
					{
						if( config.defaultArgs.board )
							parentItem = { boardName: config.defaultArgs.board }
						else
							throw new AddingTaskSytaxError( 'You must provide either a board (through cli or config file) or a task id' )
					}


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
				if( !isTask( secondArg ) && !isBoard( secondArg ) )
					throw new EditingSytaxError( "Your second arguments should be one or more tasks id join by ',' or a board name" )

				const name = argHandler.getFirstText()

				if( isTask( secondArg ) )
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
					const tasksID = storage.editTask( ids, newAttributes, isRecursive )

					const taskPluralHandled = ( tasksID.length > 1 ) ? 'Tasks' : 'Task'
					const stringifyiedIDS = ( tasksID.length > 1 ) ? ( tasksID.join(',') ) : tasksID
					printer.addFeedback( `${ taskPluralHandled } '${ stringifyiedIDS }' edited` ).loadTaskView( ids )
				}
				else if( isBoard( secondArg ) )
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

					printer.addFeedback( `Board '${ boardName }' edited` ).loadBoardView( secondArg.value as string )
				}

				printer.print()
				break;
			}

			////////////////////

			case Action.CHECK:
			{
				if( !isTask( secondArg ) )
					throw new CheckingTaskSytaxError( "Your second arguments should be a number or numbers join by ','" )

				const ids = secondArg.value as number | number[]

				const lastState = config.states[ config.states.length - 1 ].name
				const tasksID = storage.editTask( ids, { state: lastState }, isRecursive )

				const taskPluralHandled = ( tasksID.length > 1 ) ? 'Tasks' : 'Task'
				const stringifyiedIDS = ( tasksID.length > 1 ) ? ( tasksID.join(',') ) : tasksID
				printer.addFeedback( `${ taskPluralHandled } '${ stringifyiedIDS }' checked` ).loadTaskView( ids ).print()
				break;
			}

			////////////////////

			case Action.INCREMENT:
			{
				if( !isTask( secondArg ) )
					throw new IncrementingTaskSytaxError( "Your second arguments should be a number or numbers join by ','" )

				const ids = secondArg.value as number | number[]

				const statesNames = config.states.map( state => state.name )

				const tasksID = storage.incrementTask( ids, statesNames, isRecursive )

				const taskPluralHandled = ( tasksID.length > 1 ) ? 'Tasks' : 'Task'
				const stringifyiedIDS = ( tasksID.length > 1 ) ? ( tasksID.join(',') ) : tasksID
				printer.addFeedback( `${ taskPluralHandled } '${ stringifyiedIDS }' incremented` ).loadTaskView( ids ).print()
				break;
			}

			////////////////////

			case Action.DELETE:
			{
				if( isTask( secondArg ) )
				{
					const ids = secondArg.value as number | number[]

					const tasksID = storage.deleteTask( ids )

					const taskPluralHandled = ( tasksID.length > 1 ) ? 'Tasks' : 'Task'
					const stringifyiedIDS = ( tasksID.length > 1 ) ? ( tasksID.join(',') ) : tasksID
					printer.addFeedback( `${ taskPluralHandled } '${ stringifyiedIDS }' deleted` )
				}
				else if( isBoard( secondArg ) )
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
				if( !isTask( secondArg ) )
					throw new MovingTaskSytaxError( `Second arg '${ secondArg.value }' should be one or more task id` )

				if( !isTask( thirdArg ) && !isBoard( thirdArg ) )
					throw new MovingTaskSytaxError( `Third arg '${ thirdArg.value }' should be one task id or a board name` )

				const targetIDs = secondArg.value as number | number[]

				let destination = {}
				let destFeedback = ''
				if( isTask( thirdArg ) )
				{
					if( Array.isArray( thirdArg.value ) )
						throw new MovingTaskSytaxError( `Please provide only one destination task id` )

					const destTaskID = thirdArg.value as number
					destination = { subTask: destTaskID }
					destFeedback = `task n°${ destTaskID }`
					printer.loadTaskView( destTaskID )
				}
				else if( isBoard( thirdArg ) )
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