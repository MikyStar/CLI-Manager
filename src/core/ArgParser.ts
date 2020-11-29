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
	HIDE_DESCRIPTION = '--hide-description'
}

export interface Arg
{
	value: string | number | number[] | { flag: string, value : any },
	isAction ?: boolean
	isTask ?: boolean,
	isBoard ?: boolean,
	isText ?: boolean,
	isFlag ?: boolean
}

////////////////////////////////////////

export namespace ArgParser
{
	export const getAllArgs = () => [ ...process.argv.slice(2), ...config.defaultArgs ]

	export const parse = ( args : string[] ) =>
	{
		// TODO folags should be set and accessible from config

		let parsedArgs : Arg[] = []

		for( let i = 0; i < args.length; i++ )
		{
			const theArg = args[ i ]

			if( theArg[0] === '@' )
			{
				parsedArgs.push( { value: theArg.slice(1), isBoard: true } )
			}
			else if( Object.values( Action ).includes( theArg as Action ) )
				parsedArgs.push( { value: theArg, isAction: true } )
			else if( theArg === Flag.HIDE_DESCRIPTION )
			{
				parsedArgs.push( { value: Flag.HIDE_DESCRIPTION, isFlag: true } )
			}
			else if( theArg === Flag.FILE )
			{
				parsedArgs.push( { value: { flag: Flag.FILE, value: args[ i + 1 ] }, isFlag: true } )
				i++
			}
			else if( theArg === Flag.DEPTH )
			{
				parsedArgs.push( { value: { flag: Flag.HIDE_DESCRIPTION, value: args[ i + 1 ] }, isFlag: true } )
				i++
			}
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

		}

		return parsedArgs
	}

	export const launchAction = ( parsedArgs : Arg[] ) =>
	{
		
	}
}
