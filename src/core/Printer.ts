import chalk from "chalk"

import { ConfigState } from "./Config";
import { TaskList, GroupByType } from './TaskList';
import { Storage } from './Storage';

////////////////////////////////////////

export interface PrinterConfig
{
	shouldNotPrintAfter ?: boolean,
	hideDescription ?: boolean,
	hideTimestamp ?: boolean,
	hideSubCounter ?: boolean,
	hideTree ?: boolean,

	depth ?: number,
	groupBy ?: GroupByType | GroupByType []
}

export interface ViewParams
{
	view: ViewType,
	target ?: ViewTargetType
}

type ViewType = 'full' | 'specific'
type ViewTargetType = string | string[] | number | number[]

////////////////////////////////////////

/**
 * Handles stdout like a buffer with multiple lines, you append lines to it then print
 */
export class Printer
{
	private feedback: string[]
	private viewParams: ViewParams

	tasks: TaskList
	storagePath: string
	states: ConfigState[]
	config ?: PrinterConfig

	////////////////////

	constructor( storage ?: Storage, states ?: ConfigState[], config ?: PrinterConfig )
	{
		this.feedback = []

		this.tasks = storage.tasks
		this.storagePath = storage.relativePath
		this.config = config
		this.states = states
	}

	////////////////////

	setView = ( type: ViewType, target ?: ViewTargetType ) =>
	{
		this.viewParams = { view: type, target }

		return this
	}

	addFeedback = ( message: string | string[] ) =>
	{
		const lines = Array.isArray( message ) ? message : [ message ]
		this.feedback = [ ...this.feedback, ...lines ]

		return this
	}

	////////////////////

	private getSpecificView = ( taskID: number | number[] ) =>
	{
		let toReturn : string[] = []

		const theTasksID = Array.isArray( taskID ) ? taskID : [ taskID ]
		const list: TaskList = new TaskList()

		theTasksID.forEach( ( id, index ) =>
		{
			this.tasks.retrieveTask( id, ({ task }) =>
			{
				list.push( task )

				toReturn = [ ...toReturn, ...task.stringify( this.states, this.config ), '' ]

				if( index !== ( theTasksID.length - 1 ) )
					toReturn.push( this.separator('-'), '' )
				else
					toReturn.push( list.getStats( this.states ), '' )
			})
		});

		toReturn = [ ...toReturn, ...this.getFileStats() ]

		return toReturn
	}

	private getFullView = () =>
	{
		let toReturn : string[] = []

		this.tasks.forEach( ( task, index ) =>
		{
			toReturn = [ ...toReturn, ...task.stringify( this.states, this.config ), '' ]

			if( index !== ( this.tasks.length - 1 ) )
				toReturn.push( this.separator('-'), '' )
			else
				toReturn.push( this.tasks.getStats( this.states ), '' )
		});

		toReturn = [ ...toReturn, ...this.getFileStats() ]

		return toReturn
	}

	private getView = () =>
	{
		if( !this.viewParams )
			return []

		switch( this.viewParams.view )
		{
			case 'full':
				return this.getFullView()
			case 'specific':
				return this.getSpecificView( this.viewParams.target as number | number[] )
		}
	}

	/**
	 * Handle both view buffer and feedback buffer given arg should not print after
	 */
	print = () =>
	{
		let fullBuffer = []
		fullBuffer.push( this.charAccrossScreen( '-' ), '' )

		if( this.config.shouldNotPrintAfter )
		{
			if( this.feedback.length === 0 )
				return

			fullBuffer =
			[
				...fullBuffer,
				...this.feedback,
				this.charAccrossScreen( '-' )
			]
		}
		else
		{
			if( ( this.feedback.length === 0 ) && ( this.viewParams ) )
				return

			fullBuffer =
			[
				...fullBuffer,
				...this.getView(),
				this.charAccrossScreen( '-' ),
				'',
				...this.feedback
			]
		}

		printMessage( fullBuffer )
	}

	printView = () =>
	{
		const fullBuffer =
		[
			this.charAccrossScreen( '-' ),
			'',
			...this.getView(),
			'',
			this.charAccrossScreen( '-' ),
		]

		printMessage( fullBuffer )
	}

	printFeedback = () => printMessage( [ '', ...this.feedback ] )

	private getFileStats = () =>
	{
		const fileName = chalk.bold.underline( this.storagePath )
		const stats = this.tasks.getStats( this.states )

		return [ this.separator( '-' ) , '', ' ' + fileName, '', stats, '' ]
	}

	////////////////////

	private charAccrossScreen = ( char : string ) =>
	{
		let toReturn = ''

		for( let i = 0; i < ( process.stdout.columns - 2 ); i++ ) // -2 to do the margin of one space of begin and end
			toReturn += char

		return toReturn + ' '
	}

	private separator = ( char: string ) =>
	{
		let toReturn = ''

		for( let i = 0; i < ( process.stdout.columns / 10 ); i++ )
			toReturn += char

		return toReturn
	}

	private wrapText = ( text : string, indentLevel : number = 0, marginLeft : number = 0 ) =>
	{
		let toReturn : string[] = []

		let space = ''
		for( let i = 0; i < indentLevel; i++ )
			space += '    ' // A level = 4 spaces
		for( let i = 0; i < marginLeft; i++ )
			space += ' '

		const availableSpace = ( process.stdout.columns - 2 ) - space.length

		// TODO
	}
}

////////////////////////////////////////

export const printMessage = ( message : string | string[], chalkColor ?: string ) =>
{
	if( ( message === '' ) || ( message === [] ) )
		return

	const MARGIN = ' '
	message = Array.isArray( message ) ? message : [ message ]

	console.log('')
	message.forEach( line =>
	{
		let text = MARGIN + line
		text = chalkColor ? chalk[ chalkColor ]( text ) : text
		console.log( text )
	})
	console.log('')
}

export const printError = ( message: string | string[] ) => printMessage( message, 'red' )