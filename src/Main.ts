import { Action, isTask, isAction, isText } from "./core/CliArgHandler";
import { Prompt } from "./core/Prompt";
import { ITask, Task } from "./core/Task";
import { PrinterFactory, printError, printMessage } from "./core/Printer";
import { System } from './core/System'

import Help from './core/Help'

import { MainController } from "./controller/MainController";

import { CLISyntaxError, DeletingTaskSyntaxError, EditingSyntaxError, CheckingTaskSyntaxError
	, IncrementingTaskSyntaxError, MovingTaskSyntaxError, ExtractSyntaxError } from './errors/CLISyntaxErrors';
import { CatchableError } from "./errors/CatchableError";
import { StorageFactory } from "./core/Storage";
import { idsController } from "./controller/IDSController";

////////////////////////////////////////

try
{
	const controller = new MainController()
	const { argHandler, storage, config, printer } = controller

	const { flags, words } = argHandler
	const [ firstArg, secondArg, thirdArg, ...restSentence ] = words
	const { dataAttributes, isHelpNeeded, isVersion, isRecursive } = flags
	const { state, description, priority } = dataAttributes

	const isThereCliFlagCommand = isHelpNeeded || isVersion
	const isThereCLIArgs = words.length > 0
	const isThereOnlyOneCLIArgs = words.length === 1

	//////////

	if( !isThereCLIArgs )
	{
		if( isThereCliFlagCommand )
		{
			if( isHelpNeeded )
				printer.addFeedback( Help.fullMan() ).printFeedback()
			else if( isVersion )
				printer.addFeedback( Help.version ).printFeedback()
		}
		else
			printer.setView( 'full' ).printView()

		System.exit()
	}

	if( isThereOnlyOneCLIArgs )
	{
		if( isTask( firstArg ) )
		{
			const tasksId = firstArg.value as number[]

			printer.setView( 'specific', tasksId ).printView()
		}
		else if( isAction( firstArg ) && isHelpNeeded )
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
					const task : Task = new Task(
					{
						name: argHandler.getFirstText(),
						state: state || storage.meta.states[ 0 ].name,
						description,
						priority
					});

					let subTaskOf = undefined
					if( isTask( secondArg ) )
					{
						const id = secondArg.value as number
						subTaskOf = id
						printer.setView( 'specific', id )
					}
					else
						printer.setView( 'full' )

					id = storage.addTask( task, subTaskOf )
				}

				printer.addFeedback( `Task n°${ id } added` ).print()
				break;
			}

			////////////////////

			case Action.EDIT:
			{
				if( !isTask( secondArg ) )
					throw new EditingSyntaxError( "Your second arguments should be one or more tasks id join by ',' or a board name" )

				const name = argHandler.getFirstText()

				if( isTask( secondArg ) )
				{
					const newAttributes: ITask =
					{
						name,
						state,
						description,
						priority
					}

					if( !name )
						delete newAttributes.name
					if( !state )
						delete newAttributes.state
					if( !description )
						delete newAttributes.description
					if( !priority )
						delete newAttributes.priority

					const { ids, textID, textTask } = idsController( storage, secondArg.value as number | number[] )

					storage.editTask( ids, newAttributes, isRecursive )

					printer.addFeedback( `${ textTask } '${ textID }' edited` ).setView( 'specific', ids )
				}

				printer.print()
				break;
			}

			////////////////////

			case Action.CHECK:
			{
				if( !isTask( secondArg ) )
					throw new CheckingTaskSyntaxError( "Your second arguments should be a number or numbers join by ','" )

				const { ids, textID, textTask } = idsController( storage, secondArg.value as number | number[] )

				const lastState = storage.meta.states[ storage.meta.states.length - 1 ].name
				storage.editTask( ids, { state: lastState }, isRecursive )

				printer.addFeedback( `${ textTask } '${ textID }' checked` ).setView( 'specific', ids ).print()
				break;
			}

			////////////////////

			case Action.INCREMENT:
			{
				if( !isTask( secondArg ) )
					throw new IncrementingTaskSyntaxError( `Second arg '${ secondArg.value }' should be one or more task` )

				const { ids, textID, textTask } = idsController( storage, secondArg.value as number | number[] )

				storage.incrementTask( ids, isRecursive )

				printer.addFeedback( `${ textTask } '${ textID }' incremented` ).setView( 'specific', ids ).print()
				break;
			}

			////////////////////

			case Action.DELETE:
			{
				if( !isTask( secondArg ) )
					throw new DeletingTaskSyntaxError( `Second arg '${ secondArg.value }' should be one or more task` )

				const { ids, textID, textTask } = idsController( storage, secondArg.value as number | number[] )

				if( Array.isArray( ids ) && ids.length > 1 )
				{
					printer.setView( 'full' )
				}
				else
				{
					let parent: Task = undefined
					storage.tasks.retrieveTask( ids[ 0 ], ({ parentTask }) => parent = parentTask )

					printer.setView( parent ? 'specific' : 'full', parent ? parent.id : undefined )
				}

				storage.deleteTask( ids )

				printer.addFeedback( `${ textTask } '${ textID }' deleted` ).print()

				break;
			}

			////////////////////

			case Action.MOVE:
			{
				if( !isTask( secondArg ) )
					throw new MovingTaskSyntaxError( `Second arg '${ secondArg.value }' should be one or more task id` )

				if( !isTask( thirdArg ) )
					throw new MovingTaskSyntaxError( `Third arg '${ thirdArg.value }' should be one task id` )

				if( Array.isArray( thirdArg.value ) )
					throw new MovingTaskSyntaxError( `Please provide only one destination task id` )

				const { ids, textID, textTask } = idsController( storage, secondArg.value as number | number[] )

				const destTaskID = thirdArg.value as number

				storage.moveTask( ids, destTaskID )
				printer.setView( 'specific', destTaskID )
				printer.addFeedback( `${ textTask } '${ textID }' moved to task n°${ destTaskID }` ).print()

				break;
			}

			////////////////////

			case Action.EXTRACT:
			{
				if( !isTask( secondArg ) )
					throw new ExtractSyntaxError( `Second arg '${ secondArg.value }' should be one or more task id` )

				if( !isText( thirdArg ) )
					throw new ExtractSyntaxError( `Thrid arg '${ thirdArg.value }' should be text` )

				const { tasks, textID, textTask } = idsController( storage, secondArg.value as number | number[] )
				const destination = thirdArg.value as string

				const newStorage = StorageFactory.extract( destination, storage, tasks )
				const newPrinter = PrinterFactory.create( argHandler, config, newStorage )

				newPrinter.setView( 'full' )
				newPrinter.addFeedback( `${ textTask } '${ textID }' extracted to ${ destination }` ).print()

				break;
			}
		}

		////////////////////
		////////////////////

		System.exit()
	}
}
catch( error )
{
	if( !( error instanceof CatchableError ) )
		console.error( error )
	else
	{
		if( error instanceof CLISyntaxError )
		{
			printError( error.message )
			printMessage( Help.getMan( error.manEntry ) )
		}
		else
			printError( error.message )
	}

	System.exit( -1 )
}