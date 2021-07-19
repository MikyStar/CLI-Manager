import { Config } from './Config'

////////////////////////////////////////

export enum Action
{
	ADD_TASK = 'a',
	INIT = 'init',
	ADD_BOARD = 'b',
	CHECK = 'c',
	DELETE = 'd',
	EDIT = 'e',
	INCREMENT = 'i',
	MOVE = 'mv',
	RENAME = 'rn',
	EXTRACT = 'x'
}

export enum Flag
{
	FILE = '-f',
	DEPTH = '--depth',
	HIDE_DESCRIPTION = '--hide-description',
	HELP = '--help',
	STATE = '-s',
	DESCRIPTION = '-d',
	LINK = '-l',
	HIDE_TREE = '--hide-tree',
	HIDE_TIMESTAMP = '--hide-timestamp',
	HIDE_SUB_COUNTER = '--hide-sub-counter',
}

export interface RawArg
{
	value: string | number | number[],
	isAction ?: boolean,
	isTask ?: boolean,
	isBoard ?: boolean,
	isText ?: boolean,
	isFlag ?: boolean
}

////////////////////////////////////////

export namespace ArgParser
{
	export const rawParse = ( args : string[] ) : RawArg[] =>
	{
		let parsedArgs : RawArg[] = []

		for( let i = 0; i < args.length; i++ )
		{
			const theArg = args[ i ]

			const isBoard = theArg[0] === '@'
			const isTask = !isNaN( +theArg[0] )

			if( isBoard )
				parsedArgs.push( { value: theArg.slice(1), isBoard: true } )
			else if( Object.values( Action ).includes( theArg as Action ) )
				parsedArgs.push( { value: theArg, isAction: true } )
			else if( Object.values( Flag ).includes( theArg as Flag ) )
				parsedArgs.push({ value: theArg, isFlag: true })
			else if( isTask )
			{
				if( theArg.includes( ',' ) )
				{
					const tasksNb = theArg.split(',').map( task => Number.parseInt( task ) )

					parsedArgs.push( { value: tasksNb, isTask: true } )
				}
				else if( theArg.match( /^\d+$/ ) )
					parsedArgs.push( { value: Number.parseInt( theArg ), isTask: true } )
			}
			else
				parsedArgs.push( { value: theArg, isText: true } )
		}

		return parsedArgs
	}
}