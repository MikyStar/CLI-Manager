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

////////////////////////////////////////

try
{
	const controller = new MainController()
	const { argHandler, storage, config, printer } = controller

	const { flags, words } = argHandler
	const [ firstArg, secondArg, thirdArg, ...restSentence ] = words
	const { dataAttributes, isHelpNeeded, isVersion, isRecursive, printing } = flags
	const { state, description, linked } = dataAttributes

	const isThereCLIArgs = words.length > 0
	const isThereOnlyOneCLIArgs = words.length === 1
	const isThereOnlyTwoCLIArgs = words.length === 2

	//////////

	if( !isThereCLIArgs )
	{
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
					const task : Task = new Task(
					{
						name: argHandler.getFirstText(),
						state: state || storage.meta.states[ 0 ].name,
						dependencies: linked,
						description,
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
					printer.addFeedback( `${ taskPluralHandled } '${ stringifyiedIDS }' edited` ).setView( 'specific', ids )
				}

				printer.print()
				break;
			}

			////////////////////

			case Action.CHECK:
			{
				if( !isTask( secondArg ) )
					throw new CheckingTaskSyntaxError( "Your second arguments should be a number or numbers join by ','" )

				const ids = secondArg.value as number | number[]

				const lastState = storage.meta.states[ storage.meta.states.length - 1 ].name
				const tasksID = storage.editTask( ids, { state: lastState }, isRecursive )

				const taskPluralHandled = ( tasksID.length > 1 ) ? 'Tasks' : 'Task'
				const stringifyiedIDS = ( tasksID.length > 1 ) ? ( tasksID.join(',') ) : tasksID
				printer.addFeedback( `${ taskPluralHandled } '${ stringifyiedIDS }' checked` ).setView( 'specific', ids ).print()
				break;
			}

			////////////////////

			case Action.INCREMENT:
			{
				if( !isTask( secondArg ) )
					throw new IncrementingTaskSyntaxError( "Your second arguments should be a number or numbers join by ','" )

				const ids = secondArg.value as number | number[]

				const tasksID = storage.incrementTask( ids, isRecursive )

				const taskPluralHandled = ( tasksID.length > 1 ) ? 'Tasks' : 'Task'
				const stringifyiedIDS = ( tasksID.length > 1 ) ? ( tasksID.join(',') ) : tasksID
				printer.addFeedback( `${ taskPluralHandled } '${ stringifyiedIDS }' incremented` ).setView( 'specific', ids ).print()
				break;
			}

			////////////////////

			case Action.DELETE:
			{
				if( isTask( secondArg ) )
				{
					const ids = secondArg.value as number | number[]

					let taskPluralHandled, stringifyiedIDS

					if( Array.isArray( ids ) && ids.length > 1 )
					{
						taskPluralHandled = 'Tasks'
						stringifyiedIDS = ids.join(',')

						printer.setView( 'full' )
					}
					else
					{
						taskPluralHandled = 'Task'
						stringifyiedIDS = ids

						let parent: Task = undefined
						storage.tasks.retrieveTask( ids as number, ({ parentTask }) => parent = parentTask )

						printer.setView( parent ? 'specific' : 'full', parent.id )
					}

					storage.deleteTask( ids )

					printer.addFeedback( `${ taskPluralHandled } '${ stringifyiedIDS }' deleted` )
				}
				else
					throw new DeletingTaskSyntaxError( `Second arg '${ secondArg.value }' should be one or more task` )

				printer.print()
				break;
			}

			////////////////////

			case Action.MOVE:
			{
				if( !isTask( secondArg ) )
					throw new MovingTaskSyntaxError( `Second arg '${ secondArg.value }' should be one or more task id` )

				if( !isTask( thirdArg ) )
					throw new MovingTaskSyntaxError( `Third arg '${ thirdArg.value }' should be one task id` )

				const targetIDs = secondArg.value as number | number[]

				let destFeedback = ''
				if( isTask( thirdArg ) )
				{
					if( Array.isArray( thirdArg.value ) )
						throw new MovingTaskSyntaxError( `Please provide only one destination task id` )

					const destTaskID = thirdArg.value as number
					destFeedback = `task n°${ destTaskID }`

					storage.moveTask( targetIDs, destTaskID )
					printer.setView( 'specific', destTaskID )
					printer.addFeedback( `Tasks '${ targetIDs }' moved to ${ destFeedback }` ).print()
				}
				else
					throw new MovingTaskSyntaxError( `Please provide a Task ID for destination as second arg istead of '${ thirdArg }'` )

				break;
			}

			case Action.EXTRACT:
			{
				if( !isTask( secondArg ) )
					throw new ExtractSyntaxError( `Second arg '${ secondArg.value }' should be one or more task id` )

				if( !isText( thirdArg ) )
					throw new ExtractSyntaxError( `Thrid arg '${ thirdArg.value }' should be text` )

				const involvedTasks: Task[] = []
				let textTask = '', textID = ''

				if( Array.isArray( secondArg.value ) )
				{
					const ids = secondArg.value as number[]
					ids.map( ( id, index ) =>
					{
						involvedTasks.push( storage.get( id ) )
						textID += `${ id }${ ( index !== ( ids.length -1 ) ? ',' : '' ) }`
					})

					textTask = 'Tasks'
				}
				else
				{
					const id = secondArg.value as number
					involvedTasks.push( storage.get( id ) )

					textID = `${ id }`
					textTask = 'Task'
				}

				const destination = thirdArg.value as string
				const newStorage = StorageFactory.extract( destination, storage, involvedTasks )
				const newPrinter = PrinterFactory.create( argHandler, config, newStorage )

				newPrinter.setView( 'full' )
				newPrinter.addFeedback( `${ textTask } '${ textID }' extracted to ${ destination }` ).print()

				break;
			}
		}

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

		printError( error.message )
	}

	System.exit( -1 )
}