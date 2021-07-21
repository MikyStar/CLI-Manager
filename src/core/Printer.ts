import chalk from "chalk"

import { IBoard, Board } from "./Board";
import { Config, ConfigState } from "./Config";
import { ITask, Task, TIMESTAMP_FORMAT, StringifyArgs } from './Task';
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

	export const feedBack = ( message : string) =>
	{
		const text = ' ' + message

		console.log('')
		console.log( text )
		console.log('')
	}

	export const error = ( message: string ) =>
	{
		const text = ' ' + message

		console.log('')
		console.error( chalk.red( text ) )
		console.log('')
	}

	//////////

	export const printTasks = ( tasksID: number[], printArgs: PrintArgs ) =>
	{
		const { datas, states } = printArgs

		const tasks = []

		console.log( charAccrossScreen( '-' ), '\n' )

		tasksID.forEach( ( id, index ) =>
		{
			datas.retrieveNestedTask( id, task =>
			{
				tasks.push( task )

				Printer.printStringified( Task.stringify( task, states, printArgs ) )
				console.log('')

				if( index !== ( tasksID.length - 1 ) )
					console.log( Printer.separator('-'), '\n' )
				else
					console.log( Task.getStats( tasks, states, ), '\n' )
			})
		});
	}

	export const printBoards = ( boardNames: string[], printArgs: PrintArgs ) =>
	{
		const { datas, states } = printArgs

		console.log( charAccrossScreen( '-' ), '\n' )

		boardNames.forEach( ( name, index ) =>
		{
			const matchingBoard = datas.boards.find( board => board.name === name )

			if( !matchingBoard )
				console.error(`Can't find board ${ name }`)
			else
			{
				printStringified( Board.stringify( matchingBoard, states, printArgs ) )
				console.log('')

				if( index !== ( boardNames.length - 1 ) )
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
