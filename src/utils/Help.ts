import { bold, underline } from "chalk"

// @ts-ignore
import pkg from '../../package.json'

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
	deletingTask: ManPage

	creatingBoard: ManPage
	renameBoard: ManPage
	deleteBoard: ManPage
	cleanBoard: ManPage
	extractBoards: ManPage
}

////////////////////////////////////////

/**
 * Expose lines of decorated text as array for help flag
 */
class Help implements ManEntries
{
	private footer: string[]
	private globalArgs: string[]

	/////

	version: string[]

	/////

	init: ManPage
	viewing: ManPage

	creatingTask: ManPage
	editingTask: ManPage
	checkingTask: ManPage
	incrementingTask: ManPage
	movingTask: ManPage
	deletingTask: ManPage

	creatingBoard: ManPage
	renameBoard: ManPage
	deleteBoard: ManPage
	cleanBoard: ManPage
	extractBoards: ManPage

	////////////////////

	constructor()
	{
		this.footer =
		[
			'',
			'-----',
			`${ bold( pkg.name ) }: ${ pkg.description }`,
			`Version: ${ bold( pkg.version ) }`,
			`More informations at ${ bold( pkg.repository.url )}`
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
			footer: true
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
			footer: true
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
			footer: true
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
			footer: true
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
			footer: true
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
			footer: true
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
			footer: true
		}

		//////////

		this.creatingBoard =
		{
			title: 'Creating a boad',
			prototype: 'task b <board name> [-d <description>] [global args]',
			argDef:
			[
				'<board name> : Board name',
				'-d <description> : Board description',
			],
			globalArgs: true,
			footer: true
		}
	}

	////////////////////

	getMan = <K extends keyof ManEntries>( action: K ) => this.makeMan( this[ action ] )

	////////////////////

	fullMan = () =>
		[
			// TODO
		]

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

		if( manPage.footer )
			toReturn = [ ...toReturn, ...this.footer ]

		return toReturn
	}
}

////////////////////////////////////////

export default new Help()