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

		console.log( this.charAccrossScreen( '-' ), '\n' )

		theTasksID.forEach( ( id, index ) =>
		{
			this.storage.retrieveNestedTask( id, task =>
			{
				tasks.push( task )

				this.printStringified( Task.stringify( task, this.states, this.config ) )
				console.log('')

				if( index !== ( theTasksID.length - 1 ) )
					console.log( this.separator('-'), '\n' )
				else
					console.log( Task.getStats( tasks, this.states ), '\n' )
			})
		});

		console.log( this.charAccrossScreen( '-' ), '\n' )
	}

	boardView = ( boardName: string | string[] ) =>
	{
		let theBoards = []

		if( Array.isArray( boardName ) )
			theBoards = boardName
		else
			theBoards = [ boardName ]

		console.log( this.charAccrossScreen( '-' ), '\n' )

		theBoards.forEach( ( name, index ) =>
		{
			const matchingBoard = this.storage.boards.find( board => board.name === name )

			if( !matchingBoard )
				console.error(`Can't find board ${ name }`)
			else
			{
				this.printStringified( Board.stringify( matchingBoard, this.states, this.config ) )
				console.log('')

				if( index !== ( theBoards.length - 1 ) )
					console.log( this.separator('-'), '\n' )
			}
		});

		console.log( this.charAccrossScreen( '-' ) )

		return this // ! So i can chain a view creation with a print afterwards
	}

	fileView = () => this.boardView( this.storage.boards.map( board => board.name ) )

	print = () =>
	{
		this.lines.push( this.charAccrossScreen( '-' ), '\n' )

		this.lines.push( this.charAccrossScreen( '-' ) )
		this.printStringified( this.lines )
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