import chalk from "chalk"

// @ts-ignore
import pkg from '../../package.json'
import { Action } from "./CliArgHandler"
import { DEFAULT_CONFIG_FILE_NAME } from "./Config"
import { DEFAULT_STORAGE_FILE_NAME } from './Storage'
import { handledGroupings, handledOrder } from './TaskList'

////////////////////////////////////////

interface ManPage
{
	title ?: string
	prototype ?: string
	argDef ?: string[]
	furtherDescription ?: string[]
	globalArgs ?: boolean
	footer ?: boolean
	examples ?: string[]
}

export interface ManEntries
{
	createStorage: ManPage
	createConfig: ManPage

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

	createStorage: ManPage
	createConfig: ManPage

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
		const { bold, underline, italic } = chalk

		this.globalArgs =
		[
			'',
			underline( 'Global arguments:' ),
			'',
			italic( 'They can either be passed by CLI arguments, or set through the config file' ),
			'',
			`--storage <relative path> : The specific storage file to use if path different than default ${ bold( DEFAULT_STORAGE_FILE_NAME ) }`,
			'--depth <n> : Print every tasks and also n levels of subtasks',
			`--group <(${ handledGroupings.map( str => str ) })> : Group by attribute`,
			`--sort <(${ handledOrder.map( str => str ) })> : Sort order`,
			`--hide-description : Hide tasks descriptions ; ${ bold( "'hideDescription' in the config file" ) }`,
			`--show-description : Bypass the 'hideDescription' argument in config file`,
			`--hide-tree : Hide tree branches ; ${ bold( "'hideTree' in the config file" ) }`,
			`--hide-timestamp : No timestamp ; ${ bold( "'hideTimestamp' in the config file" ) }`,
			`--hide-completed : Don\'t display completed tasks ; ${ bold( "'hideCompleted' in the config file" ) }`,
			`--show-completed : Bypass the 'shouldNotPrintAfter' argument in config file`,
			'--hide-sub-counter : No subtask counter in parent task',
			`--no-print : Prevent printing your tasks after having ran your command ; ${ bold( "'shouldNotPrintAfter' in the config file" ) }`,
			`--print : Bypass the 'shouldNotPrintAfter' argument in config file`,
			`--clear : Clear the terminal before printing ; ${ bold( "'clearBefore' in the config file" ) }`,
			`--no-clear : Bypass the 'clearBefore' argument in the config file`,
		]

		this.footer =
		[
			'',
			'-----',
			`${ bold( pkg.name ) }: ${ pkg.description }`,
			`Version: ${ bold( pkg.version ) }`,
			`More informations and examples at ${ bold( pkg.repository.url )}`
		]

		//////////

		this.version = [ `${ pkg.version }` ]

		this.createStorage =
		{
			title: 'Creating storage file',
			prototype: 'task storage [<relative path>]',
			argDef:
			[
				`<relative path> : If you want to change the path, default ${ bold( DEFAULT_STORAGE_FILE_NAME ) }`,
			]
		}

		this.createConfig =
		{
			title: 'Creating the config file',
			prototype: 'task config',
			furtherDescription:
			[
				`It will create a ${ bold( DEFAULT_CONFIG_FILE_NAME ) }`,
				`You don't need to have a configuration file, it's used to pass default ${ bold( 'global arguments' ) } to the CLI, see section below.`,
			],
			globalArgs: true
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

		const entries: ManEntryKey[] = [ 'createStorage', 'createConfig', 'viewing', 'creatingTask', 'editing',
			'incrementingTask', 'checkingTask', 'movingTask', 'deleting', 'extracting' ]

		entries.forEach( entry =>
		{
			const man = this.makeMan({ ...this[ entry ], footer: false, globalArgs: false })
			toReturn = [ ...toReturn, ...man, '', '-----' ]
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
			case Action.CREATE_STORAGE:
				toReturn = this.getMan( 'createStorage' )
				break;
			case Action.CREATE_CONFIG:
				toReturn = this.getMan( 'createConfig' )
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
			case Action.EXTRACT:
				toReturn = this.getMan( 'extracting' )
				break;
		}

		return toReturn
	}

	////////////////////

	private makeMan = ( manPage : ManPage ) =>
	{
		const { bold, underline, italic } = chalk

		let toReturn : string[] = []

		if( manPage.title )
			toReturn = [ ...toReturn, underline( manPage.title ), '' ]

		if( manPage.prototype )
			toReturn = [ ...toReturn, bold( manPage.prototype ), '' ]

		if( manPage.argDef )
			toReturn = [ ...toReturn, ...manPage.argDef ]

		if( manPage.furtherDescription )
			toReturn = [ ...toReturn, '' , ...manPage.furtherDescription ]

		if( manPage.examples )
			toReturn = [ ...toReturn, '' , underline( 'Examples :' ), '', ...manPage.examples ]

		if( manPage.globalArgs )
			toReturn = [ ...toReturn, ...this.globalArgs ]

		return toReturn
	}
}

////////////////////////////////////////

export default new Help()