import { config } from './Config'

////////////////////////////////////////

export enum Action
{
	ADD_TASK = 'a',
	ADD_BOARD = 'b',
	CHECK = 'c',
	DELETE = 'd',
	EDIT = 'e',
	INCREMENT = 'i',
	MOVE = 'mv',
	RENAME = 'rn',
}

export enum Flag
{
	FILE = '--f',
	DEPTH = '--depth',
	HIDE_DESCRIPTION = '--hide-description',
	STATE = '-s',
	DESCRIPTION = '-d',
	LINK = '-l'
}

export interface Arg
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
	export const getAllArgs = () => [ ...config.defaultArgs, ...process.argv.slice(2) ]

	export const parse = ( args : string[] ) =>
	{
		// TODO folags should be set and accessible from config

		let parsedArgs : Arg[] = []

		let currentString = ``

		let isConcatString = false
		let stringDelimiter = ''

		for( let i = 0; i < args.length; i++ )
		{
			const theArg = args[ i ]

			if( isConcatString )
			{
				if( Object.values( Flag ).includes( theArg as Flag ) ) // That's a really dirty way to manage coming from concat string and finding a flag
				{
					parsedArgs.push({ value: currentString, isText: true })

					isConcatString = false
					currentString = ''
					stringDelimiter = ''

					parsedArgs.push( { value: theArg, isFlag: true } )
				}
				else if( theArg[ theArg.length - 1 ] === stringDelimiter )
				{
					currentString += ' ' + theArg.slice( 0, -1 )
					parsedArgs.push( { value: currentString, isText: true })

					currentString = ''
					stringDelimiter = ''
					isConcatString = false
				}
				else
					currentString += ' ' + theArg
			}
			else if( theArg.match( /^('|")/ ))
			{
				if( currentString !== '' )
					parsedArgs.push({ value: currentString, isText: true })

				stringDelimiter = theArg[0]

				currentString = theArg.slice( 1 )
				isConcatString = true
			}
			else
			{
				isConcatString = false

				if( theArg[0] === '@' )
				{
					parsedArgs.push( { value: theArg.slice(1), isBoard: true } )
				}
				else if( Object.values( Action ).includes( theArg as Action ) )
					parsedArgs.push( { value: theArg, isAction: true } )
				else if( Object.values( Flag ).includes( theArg as Flag ) )
					parsedArgs.push({ value: theArg, isFlag: true })
				else if( !isNaN( +theArg[0] ) )
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
				{
					isConcatString = true
					currentString += theArg
				}
			}
		}

		if( currentString !== '' )
			parsedArgs.push({ value: currentString, isText: true })

		return parsedArgs
	}

	export const launchAction = ( parsedArgs : Arg[] ) =>
	{
		
	}
}
