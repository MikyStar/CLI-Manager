import { PrinterConfig } from './Printer'

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
	HELP = '--help',
	VERSION = '--version',
	STORAGE_FILE = '--storage',
	CONFIG_FILE = '--config',
	HIDE_DESCRIPTION = '--hide-description',
	HIDE_TREE = '--hide-tree',
	HIDE_TIMESTAMP = '--hide-timestamp',
	HIDE_SUB_COUNTER = '--hide-sub-counter',
	DEPTH = '--depth',
	PRINT_AFTER = '--print',
	STATE = '-s',
	DESCRIPTION = '-d',
	LINK = '-l',
	RECURSIVE = '-r'
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

export interface TaskFlags
{
	description ?: string
	state ?: string
	linked ?: number[]
}

////////////////////////////////////////

export class CliArgHandler
{
	cliArgs: RawArg[]
	untreatedArgs: RawArg[]

	isThereCLIArgs: boolean
	isThereOnlyOneCLIArgs: boolean
	isThereOnlyTwoCLIArgs: boolean
	isHelpNeeded: boolean
	isRecursive: boolean
	isVersion: boolean
	shouldPrintAfter: boolean
	configLocation: string
	storageLocation: string

	printerConfig ?: PrinterConfig
	taskFlags ?: TaskFlags
	board ?: string

	////////////////////

	constructor()
	{
		this.cliArgs = this.rawParse( process.argv.slice( 2 ) )
		this.untreatedArgs = [ ...this.cliArgs ]

		//////////

		this.isThereCLIArgs = this.cliArgs.length !== 0
		this.isThereOnlyOneCLIArgs = this.cliArgs.length === 1
		this.isThereOnlyTwoCLIArgs = this.cliArgs.length === 2

		this.isHelpNeeded = this.popLastFlag( Flag.HELP )
		this.isVersion = this.popLastFlag( Flag.VERSION )
		this.shouldPrintAfter = this.popLastFlag( Flag.PRINT_AFTER )

		this.storageLocation = this.popLastFlagAndValue( Flag.STORAGE_FILE ) as string
		this.configLocation = this.popLastFlagAndValue( Flag.CONFIG_FILE ) as string

		this.printerConfig = this.getPrinterConfig()
		this.taskFlags = this.getTaskFlags()
		this.board = this.getBoard()

		this.isRecursive = this.popLastFlag( Flag.RECURSIVE )
	}

	////////////////////

	getFirstArg = () =>
	{
		const firstArg = this.cliArgs[ 0 ]
		this.untreatedArgs.splice( 0, 1 )

		return firstArg
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

	private getPrinterConfig = () : PrinterConfig =>
	{
		const hideDescription = this.popLastFlag( Flag.HIDE_DESCRIPTION )
		const hideTimestamp = this.popLastFlag( Flag.HIDE_TIMESTAMP )
		const hideTree = this.popLastFlag( Flag.HIDE_TREE )
		const hideSubCounter = this.popLastFlag( Flag.HIDE_SUB_COUNTER )
		const depth = this.popLastFlagAndValue( Flag.DEPTH ) as number

		return	{
					hideDescription,
					hideTimestamp,
					hideSubCounter,
					hideTree,
					depth,
				}
	}

	private getTaskFlags = () : TaskFlags =>
	{
		const state = this.popLastFlagAndValue( Flag.STATE ) as string
		const description = this.popLastFlagAndValue( Flag.DESCRIPTION ) as string

		return	{
					state,
					description,
					linked: this.getLinks()
				}
	}

	private getLinks = () : number[] =>
	{
		const linked = this.popLastFlagAndValue( Flag.LINK )

		let toReturn = []

		if( Array.isArray( linked ))
			toReturn = [ ...linked ]
		else if( linked )
			toReturn = [ linked ]

		return toReturn
	}

	private getBoard = () =>
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