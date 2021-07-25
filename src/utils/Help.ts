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
	printingArgs ?: boolean,
	footer ?: boolean,
}

////////////////////////////////////////

/**
 * Expose lines of decorated text as array for help flag
 */
class Help
{
	private footer: string[]
	private printingArgs: string[]

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

		this.printingArgs =
		[
			'',
			underline( 'Printing arguments:' ),
			'',
			'--depth n : Print every tasks and also n levels of subtasks',
			'--hide-description : Hide boards and tasks descriptions',
			'--hide-tree : Hide tree branches',
			'--hide-timestamp : No timestamp',
			'--hide-sub-counter : No subtask counter in parent task',
			'--print : Print your tasks or boards after having ran your command'
		]

		//////////

		
	}

	////////////////////

	version = () =>
	[
		`${ pkg.version }`,
	]

	init = () => this.makeMan(
	{
		title: 'Create required files',
		prototype: 'task init [--config <relative path>] [--storage <relative path>]',
		argDef:
		[
			`--config : The configuration file, default ${ bold( DEFAULT_CONFIG_FILE_NAME ) }`,
			`--storage : The storage file, default ${ bold( DEFAULT_STORAGE_FILE_NAME ) }, `
				+ 'could be used to create a new storage file for an existing configuration',
		],
		footer: true
	})

	viewing = () => this.makeMan(
	{
		title: 'View',
		prototype: 'task [@<board name>] [<task(s)>] [printing args]',
		argDef:
		[
			"@<board name> : The board you want to display preceded by '@'",
			"task(s) : The id of the task you want to display, you can pass multiple by separating the ids by ',' without space",
		],
		printingArgs: true,
		footer: true
	})

	createTask = () => this.makeMan(
	{
		title: 'Create a task',
		prototype: 'task a [@<board name>] [<task>] [<task name>] [-d <description>] [-s <state>] [-l <task(s)>]',
		argDef:
		[
			"@<board name> : The board you want to display preceded by '@'",
			'task : Task id uppon which you want to add a child subtask',
			'<name> : Task name',
			'-d <description> : Task description',
			'-s <state> : Task state defined by the config file',
			"-l <task(s)> : Task dependencies, you can pass multiple by separating the ids by ',' without space",
		],
		furtherDescription:
		[
			"If no args are provided after 'a' you will enter interactive mode to create your task"
		],
		footer: true
	})

	createBoard = () => this.makeMan(
	{
		title: 'Create a boad',
		prototype: 'task b <board name> [-d <description>]',
		argDef:
		[
			'<board name> : Board name',
			'-d <description> : Board description',
		],
		footer: true
	})

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

		if( manPage.printingArgs )
			toReturn = [ ...toReturn, ...this.printingArgs ]

		if( manPage.footer )
			toReturn = [ ...toReturn, ...this.footer ]

		return toReturn
	}
}

////////////////////////////////////////

export default new Help()