import { DefaultArgs } from './Config'
import { StringifyArgs } from './Task'

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
	FILE = '--file',
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

export class ArgHandler
{
	userArgs: RawArg[]
	defaultArgs ?: DefaultArgs

	untreatedArgs: RawArg[]

	////////////////////

	constructor( configDefaultArgs: DefaultArgs )
	{
		this.userArgs = this.rawParse( process.argv.slice( 2) )
		this.defaultArgs = configDefaultArgs

		this.untreatedArgs = [ ...this.userArgs ]
	}

	////////////////////

	isThereCLIArgs = () : boolean => this.userArgs.length !== 0
	isThereOnlyOneCLIArgs = () : boolean => this.userArgs.length === 1
	isHelpNeeded = () : boolean => this.popLastFlag( Flag.HELP )

	////////////////////

	getFirstArg = () =>
	{
		const firstArg = this.userArgs[ 0 ]
		this.untreatedArgs.splice( 0, 1 ) // As untreatedArgs starts with userArgs

		return firstArg
	}

	getStorageLocation = () : string => this.popLastFlagAndValue( Flag.FILE ) as string

	getStringifyArgs = () : StringifyArgs =>
	{
		const hideDescription = this.popLastFlag( Flag.HIDE_DESCRIPTION ) || this.defaultArgs.hideDescription || false
		const hideTimestamp = this.popLastFlag( Flag.HIDE_TIMESTAMP ) || this.defaultArgs.hideTimestamp || false
		const hideTree = this.popLastFlag( Flag.HIDE_TREE ) || this.defaultArgs.hideTree || false
		const hideSubCounter = this.popLastFlag( Flag.HIDE_SUB_COUNTER ) || this.defaultArgs.hideSubCounter || false
		const depth = this.popLastFlagAndValue( Flag.DEPTH ) as number || this.defaultArgs.depth || undefined

		return	{
					hideDescription,
					hideTimestamp,
					hideSubCounter,
					hideTree,
					depth,
				}
	}

	getTaskFlags = () =>
	{
		return	{
					description: this.getDescription(),
					state: this.getState(),
					linked: this.getLinks()
				}
	}

	getState = () : string => this.popLastFlagAndValue( Flag.STATE ) as string

	getDescription = () : string => this.popLastFlagAndValue( Flag.DESCRIPTION ) as string

	getLinks = () : number[] =>
	{
		const linked = this.popLastFlagAndValue( Flag.LINK )

		let toReturn = []

		if( Array.isArray( linked ))
			toReturn = [ ...linked ]
		else if( linked )
			toReturn = [ linked ]

		return toReturn
	}

	////////////////////

	getBoard = () =>
	{
		let toReturn = undefined

		this.untreatedArgs.forEach( ( arg, index ) =>
		{
			if( arg.isBoard )
			{
				toReturn = arg.value
				this.untreatedArgs.splice( index, 1 )
			}
		})

		return toReturn
	}

	/**
	 * Uses untreatedArgs and remove them from list
	 * @returns first value of text
	 */
	getFirstText = () =>
	{
		let toReturn = undefined

		this.untreatedArgs.forEach( ( arg, index ) =>
		{
			if( arg.isText && ( toReturn === undefined ) )
			{
				toReturn = arg.value
				this.untreatedArgs.splice( index, 1 )
			}
		})

		return toReturn
	}

	////////////////////

	private rawParse = ( args: string[] ) : RawArg[] =>
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

	/**
	 * Uses untreatedArgs and remove them from list
	 * @returns boolean
	 */
	private popLastFlag = ( flag: Flag ) =>
	{
		let lastFlagIndex = -1

		for( let i = 0; i < this.untreatedArgs.length; i++ )
		{
			const theArg = this.untreatedArgs[ i ]

			if( theArg.isFlag && ( theArg.value === flag ) )
				lastFlagIndex = i
		}

		if( lastFlagIndex === -1 )
			return false
		else
		{
			this.untreatedArgs.splice( lastFlagIndex, 1 )

			return true
		}
	}

	/**
	 * Uses untreatedArgs and remove both the flag and its following value from list
	 * @returns last value for flag or undefined
	 */
	private popLastFlagAndValue = ( flag: Flag ) =>
	{
		let lastFlagIndex = -1

		for( let i = 0; i < this.untreatedArgs.length; i++ )
		{
			const theArg = this.untreatedArgs[ i ]

			if( theArg.isFlag && ( theArg.value === flag ) )
				lastFlagIndex = i
		}

		if( lastFlagIndex === -1 )
			return undefined
		else
		{
			const value = this.untreatedArgs[ lastFlagIndex + 1 ].value
			this.untreatedArgs.splice( lastFlagIndex, 2 )

			return value
		}
	}
}