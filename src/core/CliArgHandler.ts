import { PrinterConfig } from './Printer'
import { MultipleValuesMismatchError } from '../errors'

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

export enum BooleanFlag
{
	HELP = '--help',
	VERSION = '--version',

	HIDE_DESCRIPTION = '--hide-description',
	HIDE_TREE = '--hide-tree',
	HIDE_TIMESTAMP = '--hide-timestamp',
	HIDE_SUB_COUNTER = '--hide-sub-counter',
	DONT_PRINT_AFTER = '--no-print',

	RECURSIVE = '-r'
}

export enum ValueFlag
{
	STORAGE_FILE = '--storage',
	CONFIG_FILE = '--config',
	DEPTH = '--depth',
	STATE = '-s',
	DESCRIPTION = '-d',
	LINK = '-l',
}

export interface RawArg
{
	value: string | string[] | number | number[] | true
	type: ArgType
	flagType ?: ValueFlag | BooleanFlag
}

type ArgType = 'action' | 'task' | 'board' | 'text' | 'flag'

export interface DataAttributes
{
	description ?: string
	state ?: string
	linked ?: number[]
}

export interface HandledFlags
{
	printing ?: PrinterConfig
	dataAttributes ?: DataAttributes
	files ?:
	{
		configLocation: string
		storageLocation: string
	}
	isRecursive ?: boolean
	isHelpNeeded ?: boolean
	isVersion ?: boolean
}
////////////////////////////////////////

export class CliArgHandler
{
	private untreatedArgs: RawArg[]

	flags: HandledFlags
	words: RawArg[]

	////////////////////

	constructor()
	{
		this.untreatedArgs = this.rawParse( process.argv.slice( 2 ) )

		//////////

		this.flags =
		{
			printing: this.getPrinterConfig(),
			dataAttributes: this.getDataAttributes(),
			files:
			{
				configLocation: this.getValueFlag( ValueFlag.CONFIG_FILE ) as string,
				storageLocation: this.getValueFlag( ValueFlag.STORAGE_FILE ) as string,
			},
			isRecursive: this.getBoolFlag( BooleanFlag.RECURSIVE ),
			isHelpNeeded: this.getBoolFlag( BooleanFlag.HELP ),
			isVersion: this.getBoolFlag( BooleanFlag.VERSION )
		}

		this.words = [ ...this.untreatedArgs ]
	}

	////////////////////

	/**
	 * Uses untreatedArgs and remove them from list
	 * @returns first value of text
	 */
	getFirstText = () =>
	{
		let toReturn = undefined

		this.untreatedArgs.forEach( ( arg, index ) =>
		{
			if( ( arg.type === 'text' ) && ( toReturn === undefined ) )
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
		const hideDescription = this.getBoolFlag( BooleanFlag.HIDE_DESCRIPTION )
		const hideTimestamp = this.getBoolFlag( BooleanFlag.HIDE_TIMESTAMP )
		const hideTree = this.getBoolFlag( BooleanFlag.HIDE_TREE )
		const hideSubCounter = this.getBoolFlag( BooleanFlag.HIDE_SUB_COUNTER )
		const shouldNotPrintAfter = this.getBoolFlag( BooleanFlag.DONT_PRINT_AFTER )

		const depth = this.getValueFlag( ValueFlag.DEPTH ) as number

		return	{
					hideDescription,
					hideTimestamp,
					hideSubCounter,
					hideTree,
					shouldNotPrintAfter,

					depth,
				}
	}

	private getDataAttributes = () : DataAttributes =>
	{
		const state = this.getValueFlag( ValueFlag.STATE ) as string
		const description = this.getValueFlag( ValueFlag.DESCRIPTION ) as string

		const unparsedLinked = this.getValueFlag( ValueFlag.LINK ) as number | number[]
		const linked = Array.isArray( unparsedLinked ) ? unparsedLinked : [ unparsedLinked ]

		return	{
					state,
					description,
					linked
				}
	}

	private rawParse = ( args: string[] ) : RawArg[] =>
	{
		let parsedArgs : RawArg[] = []

		const isNumber = ( str: string ) => !isNaN( parseInt( str ) ) && !isNaN( parseFloat( str ) )

		for( let i = 0; i < args.length; i++ )
		{
			const theArg = args[ i ]

			const containsSpace = /\s/.test( theArg )
			if( theArg.includes( ',' ) && !containsSpace )
			{
				const splitted = theArg.split( ',' )
				const subParsed = this.rawParse( splitted )

				let argType : ArgType | undefined = undefined
				subParsed.forEach( arg =>
				{
					if( argType === undefined )
						argType = arg.type
					else if( arg.type !== argType )
						throw new MultipleValuesMismatchError( argType, arg.type )
				});

				const values = subParsed.map( sub => sub.value ) as string[] | number[]
				parsedArgs.push({ value: values, type: argType })
			}
			else
			{
				const isBoard = theArg[0] === '@'
				const isTask = isNumber( theArg )
				const isAction = Object.values( Action ).includes( theArg as Action )
				const isBooleanFlag = Object.values( BooleanFlag ).includes( theArg as BooleanFlag )
				const isValueVlag = Object.values( ValueFlag ).includes( theArg as ValueFlag )

				if( isBoard )
					parsedArgs.push( { value: theArg.slice( 1 ), type: 'board' } )
				else if( isTask )
					parsedArgs.push( { value: Number.parseInt( theArg ), type: 'task' } )
				else if( isAction )
					parsedArgs.push( { value: theArg, type: 'action' } )
				else if( isBooleanFlag )
					parsedArgs.push( { value: true, type: 'flag', flagType: theArg as BooleanFlag } )
				else if( isValueVlag )
				{
					let followingValue : string | number = args[ i + 1 ] // TODO I might want the flag value to be an comma separated array
					if( isNumber( followingValue ) )
						followingValue = Number.parseInt( followingValue )

					parsedArgs.push({ value: followingValue, type: 'flag', flagType: theArg as ValueFlag })

					i++ // Because we used the next value
				}
				else
					parsedArgs.push( { value: theArg, type: 'text' } )
			}
		}

		return parsedArgs
	}

	private getBoolFlag = ( flag: BooleanFlag ) =>
	{
		const index = this.untreatedArgs.findIndex( arg => ( arg.type === 'flag' ) && ( arg.flagType === flag ) && ( arg.value === true ) )

		if( index === -1 )
			return false
		else
		{
			this.untreatedArgs.splice( index, 1 )

			return true
		}
	}

	private getValueFlag = ( flag: ValueFlag ) =>
	{
		const index = this.untreatedArgs.findIndex( arg => ( arg.type === 'flag' ) && ( arg.flagType === flag ) && ( arg.value !== undefined ) )

		if( index === -1 )
			return undefined
		else
		{
			const value = this.untreatedArgs[ index ].value
			this.untreatedArgs.splice( index, 1 )

			return value
		}
	}
}

////////////////////

export const isTask = ( arg: RawArg ) => arg.type === 'task'
export const isBoard = ( arg: RawArg ) => arg.type === 'board'
export const isAction = ( arg: RawArg ) => arg.type === 'action'
export const isText = ( arg: RawArg ) => arg.type === 'text'