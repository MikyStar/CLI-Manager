import chalk from "chalk"

import { Board } from "./Board";
import { ConfigState } from "./Config";
import { Task, StringifyArgs } from './Task';
import { Storage } from './Storage';

////////////////////////////////////////

export interface PrintArgs extends StringifyArgs
{
	datas: Storage,
	states: ConfigState[]
}

////////////////////////////////////////

export namespace Printer
{
	export const printStringified = ( array : string[] ) => array.forEach( str => console.log( str ) )

	export const charAccrossScreen = ( char : string ) =>
	{
		let toReturn = ' '

		for( let i = 0; i < ( process.stdout.columns - 2 ); i++ ) // -2 to do the margin of one space of begin and end
			toReturn += char

		return toReturn + ' '
	}

	export const separator = ( char: string ) =>
	{
		let toReturn = ' '

		for( let i = 0; i < ( process.stdout.columns / 10 ); i++ )
			toReturn += char

		return toReturn
	}

	export const wrapText = ( text : string, indentLevel : number = 0, marginLeft : number = 0 ) =>
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
			text = chalkColor ? chalk[ chalkColor ]( test ) : text
			console.log( text )
		})
		console.log('')
	}

	export const error = ( message: string | string[] ) => feedBack( message, 'red' )

	//////////

	export const printTasks = ( tasksID: number | number[], printArgs: PrintArgs ) =>
	{
		let theTasksID = []
		const { datas, states } = printArgs

		const tasks = []

		if( Array.isArray( tasksID) )
			theTasksID = tasksID
		else
			theTasksID = [ tasksID ]

		console.log( charAccrossScreen( '-' ), '\n' )

		theTasksID.forEach( ( id, index ) =>
		{
			datas.retrieveNestedTask( id, task =>
			{
				tasks.push( task )

				Printer.printStringified( Task.stringify( task, states, printArgs ) )
				console.log('')

				if( index !== ( theTasksID.length - 1 ) )
					console.log( Printer.separator('-'), '\n' )
				else
					console.log( Task.getStats( tasks, states, ), '\n' )
			})
		});

		console.log( charAccrossScreen( '-' ), '\n' )
	}

	export const printBoards = ( boardNames: string | string[], printArgs: PrintArgs ) =>
	{
		let theBoards = []
		const { datas, states } = printArgs

		if( Array.isArray( boardNames) )
			theBoards = boardNames
		else
			theBoards = [ boardNames ]

		console.log( charAccrossScreen( '-' ), '\n' )

		theBoards.forEach( ( name, index ) =>
		{
			const matchingBoard = datas.boards.find( board => board.name === name )

			if( !matchingBoard )
				console.error(`Can't find board ${ name }`)
			else
			{
				printStringified( Board.stringify( matchingBoard, states, printArgs ) )
				console.log('')

				if( index !== ( theBoards.length - 1 ) )
					console.log( separator('-'), '\n' )
			}
		});

		console.log( charAccrossScreen( '-' ) )
	}

	export const printAll = ( printArgs : PrintArgs ) =>
	{
		const { datas } = printArgs

		printBoards( datas.boards.map( board => board.name ), printArgs )
	}
}