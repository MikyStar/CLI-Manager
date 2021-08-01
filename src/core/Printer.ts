import chalk from "chalk"

import { Board } from "./Board";
import { ConfigState } from "./Config";
import { Task, StringifyArgs } from './Task';
import { Storage } from './Storage';

////////////////////////////////////////

/**
 * Handles stdout like a buffer with multiple lines, you append lines to it then print
 */
class Printer
{
	lines: string[]
	storage: Storage
	states: ConfigState[]
	config ?: StringifyArgs

	////////////////////

	constructor( storage: Storage, states: ConfigState[], stringifyArgs ?: StringifyArgs, lines ?: string[] )
	{
		this.lines = lines || []
		this.storage = storage
		this.states = states
		this.config = stringifyArgs
	}

	////////////////////

	taskView = ( taskID: number | number[] ) =>
	{
		let theTasksID = []

		const tasks = []

		if( Array.isArray( taskID ) )
			theTasksID = taskID
		else
			theTasksID = [ taskID ]

		theTasksID.forEach( ( id, index ) =>
		{
			this.storage.retrieveNestedTask( id, task =>
			{
				tasks.push( task )

				this.add( [ ...Task.stringify( task, this.states, this.config ), '' ] )

				if( index !== ( theTasksID.length - 1 ) )
					this.add( [ this.separator('-'), '' ] )
				else
					this.add( [ ...Task.getStats( tasks, this.states ), '' ] )
			})
		});

		return this
	}

	boardView = ( boardName: string | string[] ) =>
	{
		let theBoards = []

		if( Array.isArray( boardName ) )
			theBoards = boardName
		else
			theBoards = [ boardName ]

		theBoards.forEach( ( name, index ) =>
		{
			this.storage.retrieveBoard( name, board =>
			{
				this.add( [ ...Board.stringify( board, this.states, this.config ), '' ] )

				if( index !== ( theBoards.length - 1 ) )
					this.add( [ this.separator( '-' ), '' ] )
			})
		});

		return this
	}

	fileView = () =>
	{
		this.boardView( this.storage.boards.map( board => board.name ) )

		return this
	}

	print = () =>
	{
		this.add( [ this.charAccrossScreen( '-' ), '' ] )

		this.add( this.charAccrossScreen( '-' ) )
		this.printStringified( this.lines )
	}

	add = ( line: string | string[] ) =>
	{
		if( Array.isArray( line ))
			this.lines = [ ...this.lines, ...line ]
		else
			this.lines.push( line )

		return this
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

export const feedBack = ( message : string | string[], chalkColor ?: string ) =>
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

export const error = ( message: string | string[] ) => feedBack( message, 'red' )