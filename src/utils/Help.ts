import { bold, underline } from "chalk"

// @ts-ignore
import pkg from '../../package.json'
import { Action } from "../core/CliArgHandler"

import { DEFAULT_CONFIG_FILE_NAME } from '../core/Config'
import { DEFAULT_STORAGE_FILE_NAME } from '../core/Storage'

////////////////////////////////////////

interface ManPage
{
	title ?: string,
	prototype ?: string,
	argDef ?: string[],
	furtherDescription ?: string[],
	globalArgs ?: boolean,
	footer ?: boolean,
}

interface ManEntries
{
	init: ManPage
	viewing: ManPage

	creatingTask: ManPage
	editingTask: ManPage
	checkingTask: ManPage
	incrementingTask: ManPage
	movingTask: ManPage

	creatingBoard: ManPage
	renamingBoard: ManPage
	cleaningBoard: ManPage
	extractingBoards: ManPage

	deleting: ManPage

}

type Entries = keyof ManEntries

////////////////////////////////////////

/**
 * Expose lines of decorated text as array for help flag
 */
class Help implements ManEntries
{
	private footer: string[]
	private globalArgs: string[]

	version: string[]

	init: ManPage
	viewing: ManPage

	creatingTask: ManPage
	editingTask: ManPage
	checkingTask: ManPage
	incrementingTask: ManPage
	movingTask: ManPage

	creatingBoard: ManPage
	renamingBoard: ManPage
	cleaningBoard: ManPage
	extractingBoards: ManPage

	deleting: ManPage

	////////////////////

	constructor()
	{
		this.footer =
		[
			'',
			'-----',
			`${ bold( pkg.name ) }: ${ pkg.description }`,
			`Version: ${ bold( pkg.version ) }`,
			`More informations and examples at ${ bold( pkg.repository.url )}`
		]

		this.globalArgs =
		[
			'',
			underline( 'Global arguments:' ),
			'',
			'--print : Print your tasks or boards after having ran your command',
			'--storage <relative path> : The specific storage file to use',
			'--config <relative path> : The specific configuration file to use',
		]

		//////////

		this.version =
		[
			`${ pkg.version }`,
		]

		this.init =
		{
			title: 'Creating required files',
			prototype: 'task init [--config <relative path>] [--storage <relative path>]',
			argDef:
			[
				`--config : The configuration file, default ${ bold( DEFAULT_CONFIG_FILE_NAME ) }`,
				`--storage : The storage file, default ${ bold( DEFAULT_STORAGE_FILE_NAME ) }, `
					+ 'could be used to create a new storage file for an existing configuration',
			],
		}

		this.viewing =
		{
			title: 'Viewing',
			prototype: 'task [@<board name>] [<task(s)>] [printing args]',
			argDef:
			[
				"@<board name> : The board you want to display preceded by '@'",
				"<task(s)> : The id of the task you want to display, you can pass multiple by separating the ids by ',' without space",
				'',
				underline( 'Printing arguments:' ),
				'',
				'--depth n : Print every tasks and also n levels of subtasks',
				'--hide-description : Hide boards and tasks descriptions',
				'--hide-tree : Hide tree branches',
				'--hide-timestamp : No timestamp',
				'--hide-sub-counter : No subtask counter in parent task',
				'--print : Print your tasks or boards after having ran your command'
			],
		}

		this.creatingTask =
		{
			title: 'Creating a task',
			prototype: 'task a [@<board name>] [<task>] [<task name>] [-d <description>] [-s <state>] [-l <task(s)>] [global args]',
			argDef:
			[
				"@<board name> : The board you want to display preceded by '@'",
				'<task> : Task id uppon which you want to add a child subtask',
				'<name> : Task name',
				'-d <description> : Task description',
				'-s <state> : Task state defined by the config file',
				"-l <task(s)> : Task dependencies, you can pass multiple by separating the ids by ',' without space",
			],
			furtherDescription:
			[
				"If no args are provided after 'a' you will enter interactive mode to create your task"
			],
			globalArgs: true,
		}

		this.editingTask =
		{
			title: 'Editing task',
			prototype: 'task e <task(s)> [<new name>] [-d <description>] [-s <state>] [-l <task(s)>] [global args]',
			argDef:
			[
				"<task(s)> : The id of the task you want to edit, you can pass multiple by separating the ids by ',' without space",
				'<new name> : Edit task name',
				'-d <description> : Edit task description',
				'-s <state> : Edit task state defined by the config file',
				"-l <task(s)> : Edit task dependencies, you can pass multiple by separating the ids by ',' without space",
			],
			furtherDescription:
			[
				"If no args are provided after 'e' you will enter interactive mode to edit your task"
			],
			globalArgs: true,
		}

		this.checkingTask =
		{
			title: 'Checking task',
			prototype: 'task c <task(s)> [-r] [global args]',
			argDef:
			[
				"<task(s)> : The id of the task you want to change, you can pass multiple by separating the ids by ',' without space",
				"-r: Also update target task's subtasks, 'recursive'"
			],
			furtherDescription:
			[
				"Will put tasks to the final state (last index in config file)"
			],
			globalArgs: true,
		}

		this.incrementingTask =
		{
			title: 'Incrementing task',
			prototype: 'task i <task(s)> [-r] [global args]',
			argDef:
			[
				"<task(s)> : The id of the task you want to increment, you can pass multiple by separating the ids by ',' without space",
				"-r: Also update target task's subtasks, 'recursive'"
			],
			furtherDescription:
			[
				"Will put tasks to the next state (next index in config file)"
			],
			globalArgs: true,
		}

		this.movingTask =
		{
			title: 'Moving task',
			prototype: 'task mv <target task(s)> [@<existing board name dest>] [<task id dest>] [-d <new board description>] [global args]',
			argDef:
			[
				"<target task(s)> : The id of the task you want to move, you can pass multiple by separating the ids by ',' without space",
				"@<existing board name dest> : The target board preceded by '@'",
				"<task id dest> : The id of the target task",
				'-d <new board description> : The description of the new board made out from the target task',
			],
			furtherDescription:
			[
				"If no destination board or task provided, will create a new board out of the task"
					+ ", use task name as board name and subtasks as task",
				"Tree structure will be maintained"
			],
			globalArgs: true,
		}

		this.deleting =
		{
			title: 'Deleting',
			prototype: 'task d [@<board name>] [<task(s)>]',
			argDef:
			[
				"@<board name> : The target board preceded by '@'",
				"<task(s)> : The id of the task you want to remove, you can pass multiple by separating the ids by ',' without space",
			],
			globalArgs: true,
		}

		//////////

		this.creatingBoard =
		{
			title: 'Creating boad',
			prototype: 'task b <board name> [-d <description>] [global args]',
			argDef:
			[
				'<board name> : Board name',
				'-d <description> : Board description',
			],
			globalArgs: true,
		}

		this.renamingBoard =
		{
			title: 'Renaming board',
			prototype: 'task rn @<previous board name> <new board name>',
			argDef:
			[
				"@<previous board name> : The target board preceded by '@'",
				"<new board name> : The new board name",
			],
			globalArgs: true,
		}

		this.cleaningBoard =
		{
			title: 'Cleaning board',
			prototype: 'task clean @<board name>',
			argDef:
			[
				"@<board name> : The target board preceded by '@'",
			],
			globalArgs: true
		}

		this.extractingBoards =
		{
			title: 'Extracting board',
			prototype: 'task x @<board name 1>  @<board name x> <relative path>',
			argDef:
			[
				"@<board name 1...x> : Target board names preceded by '@'",
				"relative path : The path where you want to make a new storage file"
			],
			globalArgs: true
		}
	}

	////////////////////

	getMan = <K extends keyof ManEntries>( action: K ) => this.makeMan( { ...this[ action ], footer: true } )

	fullMan = () =>
	{
		let toReturn = []

		const entries = [ 'init', 'viewing', 'creatingTask', 'editingTask'
			, 'checkingTask', 'incrementingTask', 'movingTask', 'creatingBoard'
			, 'renamingBoard', 'cleaningBoard', 'extractingBoards', 'deleting' ]

		entries.forEach( entry =>
		{
			const man = this.makeMan({ ...this[ entry ], footer: false, globalArgs: false })
			toReturn = [ ...toReturn, ...man, , '', '-----' ]
		});

		return	[
					...toReturn,
					...this.globalArgs,
					...this.footer
				]
	}

	handleAction = ( action: Action ) =>
	{
		let toReturn: string[] = []

		switch( action )
		{
			case Action.INIT:
				toReturn = this.getMan( 'init' )
				break;
			case Action.ADD_BOARD:
				toReturn = this.getMan( 'creatingBoard' )
				break;
			case Action.ADD_TASK:
				toReturn = this.getMan( 'creatingTask' )
				break;
			case Action.DELETE:
				toReturn = this.getMan( 'deleting' )
				break;
			case Action.CHECK:
				toReturn = this.getMan( 'checkingTask' )
				break;
			case Action.INCREMENT:
				toReturn = this.getMan( 'incrementingTask' )
				break;
			case Action.EDIT:
				toReturn = this.getMan( 'editingTask' )
				break;
			case Action.EXTRACT:
				toReturn = this.getMan( 'extractingBoards' )
				break;
			case Action.MOVE:
				toReturn = this.getMan( 'movingTask' )
				break;
			case Action.RENAME:
				toReturn = this.getMan( 'renamingBoard' )
				break;
		}

		return toReturn
	}

	////////////////////

	private makeMan = ( manPage : ManPage ) =>
	{
		let toReturn : string[] = []

		if( manPage.title )
			toReturn = [ ...toReturn, underline( manPage.title ), '' ]

		if( manPage.prototype )
			toReturn = [ ...toReturn, bold( manPage.prototype ), '' ]

		if( manPage.argDef )
			toReturn = [ ...toReturn, ...manPage.argDef ]

		if( manPage.furtherDescription )
			toReturn = [ ...toReturn, '' , ...manPage.furtherDescription ]

		if( manPage.globalArgs )
			toReturn = [ ...toReturn, ...this.globalArgs ]

		return toReturn
	}
}

////////////////////////////////////////

export default new Help()