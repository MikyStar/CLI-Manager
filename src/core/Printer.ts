import chalk from "chalk"

import { Board } from "./Board";
import { ConfigState } from "./Config";
import { Task, StringifyArgs } from './Task';
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
}

////////////////////////////////////////

/**
 * Handles stdout like a buffer with multiple lines, you append lines to it then print
 *
 *
 */
export class Printer
{
	private feedback: string[]
	private view: string[]

	storage: Storage
	states: ConfigState[]
	config ?: PrinterConfig

	////////////////////

	constructor( storage ?: Storage, states ?: ConfigState[], config ?: PrinterConfig )
	{
		this.feedback = []
		this.view = []

		this.storage = storage
		this.states = states
		this.config = config
	}

	////////////////////

	loadTaskView = ( taskID: number | number[] ) =>
	{
		const theTasksID = Array.isArray( taskID ) ? taskID : [ taskID ]
		const tasks = []

		theTasksID.forEach( ( id, index ) =>
		{
			this.storage.retrieveNestedTask( id, task =>
			{
				tasks.push( task )

				this.addToView( [ ...Task.stringify( task, this.states, this.config ), '' ] )

				if( index !== ( theTasksID.length - 1 ) )
					this.addToView( [ this.separator('-'), '' ] )
				else
					this.addToView( [ Task.getStats( tasks, this.states ), '' ] )
			})
		});

		this.addToView( this.getFileStats() )

		return this
	}

	loadBoardView = ( boardName: string | string[] ) =>
	{
		const theBoards = Array.isArray( boardName ) ? boardName : [ boardName ]

		theBoards.forEach( ( name, index ) =>
		{
			this.storage.retrieveBoard( name, board =>
			{
				this.addToView( [ ...Board.stringify( board, this.states, this.config ), '' ] )

				if( index !== ( theBoards.length - 1 ) )
					this.addToView( [ this.separator( '-' ), '' ] )
			})
		});

		this.addToView( this.getFileStats() )

		return this
	}

	loadFileView = () =>
	{
		this.loadBoardView( this.storage.boards.map( board => board.name ) )

		return this
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
			if( ( this.feedback.length === 0 ) && ( this.view.length === 0 ) )
				return

			fullBuffer =
			[
				...fullBuffer,
				...this.view,
				this.charAccrossScreen( '-' ),
				'',
				...this.feedback
			]
		}

		this.printStringified( fullBuffer )
	}

	addFeedback = ( message: string | string[] ) =>
	{
		const lines = Array.isArray( message ) ? message : [ message ]
		this.feedback = [ ...this.feedback, ...lines ]

		return this
	}

	printView = () =>
	{
		const fullBuffer =
		[
			this.charAccrossScreen( '-' ),
			'',
			...this.view,
			'',
			this.charAccrossScreen( '-' ),
		]

		this.printStringified( fullBuffer )
	}

	printFeedback = () =>
	{
		const fullBuffer =
		[
			this.charAccrossScreen( '-' ),
			...this.feedback,
			this.charAccrossScreen( '-' ),
		]

		this.printStringified( fullBuffer )
	}

	private addToView = ( message: string | string[] ) =>
	{
		const lines = Array.isArray( message ) ? message : [ message ]
		this.view = [ ...this.view, ...lines ]

		return this
	}

	private getFileStats = () =>
	{
		let allTasks = []
		this.storage.boards.forEach( board => allTasks = [ ...allTasks, ...Board.straightBoard( board ) ] )

		const fileName = chalk.bold.underline( this.storage.relativePath )
		const stats = Task.getStats( allTasks, this.states )

		return [ this.separator( '-' ) , '', ' ' + fileName, '', stats, '' ]
	}

	////////////////////

	private printStringified = ( array : string[] ) => array.forEach( str => console.log( str ) )

	private charAccrossScreen = ( char : string ) =>
	{
		let toReturn = ' '

		for( let i = 0; i < ( process.stdout.columns - 2 ); i++ ) // -2 to do the margin of one space of begin and end
			toReturn += char

		return toReturn + ' '
	}

	private separator = ( char: string ) =>
	{
		let toReturn = ' '

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