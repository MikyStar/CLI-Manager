import { bold, underline, italic } from "chalk"

// @ts-ignore
import pkg from '../../package.json'
import { Action } from "./CliArgHandler"

import { DEFAULT_CONFIG_FILE_NAME } from './Config'
import { DEFAULT_STORAGE_FILE_NAME } from './Storage'
import { handledGroupings } from './TaskList'

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

export interface ManEntries
{
	init: ManPage

	viewing: ManPage
	editing: ManPage
	deleting: ManPage

	creatingTask: ManPage
	checkingTask: ManPage
	incrementingTask: ManPage
	movingTask: ManPage

	extracting: ManPage
}

type ManEntryKey = keyof ManEntries

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
	editing: ManPage
	checkingTask: ManPage
	incrementingTask: ManPage
	movingTask: ManPage
	extracting: ManPage
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
			italic( 'They can either be passed by CLI arguments, or set through the config file' ),
			'',
			'--storage <relative path> : The specific storage file to use',
			'--config <relative path> : The specific configuration file to use',
			'--depth n : Print every tasks and also n levels of subtasks',
			'--hide-description : Hide tasks descriptions',
			'--hide-tree : Hide tree branches',
			'--hide-timestamp : No timestamp',
			'--hide-sub-counter : No subtask counter in parent task',
			'--no-print : Prevent printing your tasks after having ran your command',
			`--group (${ handledGroupings.map( str => str ) }) : Group by attribute`
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
			prototype: 'task [<task(s)>] [global args]',
			argDef:
			[
				"<task(s)> : The id of the task you want to display, you can pass multiple by separating the ids by ',' without space",
			],
			globalArgs: true
		}

		this.creatingTask =
		{
			title: 'Creating a task',
			prototype: 'task a [<task>] [<task name>] [-d <description>] [-s <state>] [global args]',
			argDef:
			[
				'<task> : Task id uppon which you want to add a child subtask',
				'<name> : Task name',
				'-d <description> : Task description',
				'-s <state> : Task state defined by the config file',
			],
			furtherDescription:
			[
				"If no args are provided after 'a' you will enter interactive mode to create your task"
			],
			globalArgs: true,
		}

		this.editing =
		{
			title: 'Editing',
			prototype: 'task e <task(s)> [<new name>] [-d <description>] [-s <state>] [global args]',
			argDef:
			[
				"<task(s)> : The id of the task you want to edit, you can pass multiple by separating the ids by ',' without space",
				'<new name> : Edit task name',
				'-d <description> : Edit task description',
				'-s <state> : Edit task state defined by the config file',
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
			prototype: 'task mv <target task(s)> [<task id dest>] [global args]',
			argDef:
			[
				"<target task(s)> : The id of the task you want to move, you can pass multiple by separating the ids by ',' without space",
				"<task id dest> : The id of the target task",
			],
			globalArgs: true,
		}

		this.deleting =
		{
			title: 'Deleting',
			prototype: 'task d <task(s)>',
			argDef:
			[
				"<task(s)> : The id of the task you want to remove, you can pass multiple by separating the ids by ',' without space",
			],
			globalArgs: true,
		}

		this.extracting =
		{
			title: 'Extracting',
			prototype: 'task x <task(s)> <relative path>',
			argDef:
			[
				"<task(s)> : The id of the task you want to extract, you can pass multiple by separating the ids by ',' without space",
				"<relative path> : Path of the new storage file",
			],
			globalArgs: true,
		}
	}

	////////////////////

	getMan = ( action: ManEntryKey ) => this.makeMan( { ...this[ action ], footer: true } )

	fullMan = () =>
	{
		let toReturn = []

		const entries: ManEntryKey[] = [ 'init', 'viewing', 'creatingTask', 'editing',
			'checkingTask', 'incrementingTask', 'movingTask', 'deleting', 'extracting' ]

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
				toReturn = this.getMan( 'editing' )
				break;
			case Action.MOVE:
				toReturn = this.getMan( 'movingTask' )
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