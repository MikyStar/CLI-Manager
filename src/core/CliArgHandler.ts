import { PrinterConfig } from './Printer'
import { GroupByType, handledGroupings, Order } from './TaskList'

import { MultipleValuesMismatchError } from '../errors'
import { GroupBySyntaxError } from '../errors/CLISyntaxErrors'

////////////////////////////////////////

export enum Action
{
	ADD_TASK = 'a',
	INIT = 'init',
	CHECK = 'c',
	DELETE = 'd',
	EDIT = 'e',
	INCREMENT = 'i',
	MOVE = 'mv',
	EXTRACT = 'x',
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
	GROUPB_BY = '--group',
	SORT = '--sort',
	STATE = '-s',
	DESCRIPTION = '-d',
	LINK = '-l',
	TAG = '-t',
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
		const group = this.getValueFlag( ValueFlag.GROUPB_BY ) as GroupByType
		const sort = this.getValueFlag( ValueFlag.SORT ) as Order

		return	{
					hideDescription,
					hideTimestamp,
					hideSubCounter,
					hideTree,
					shouldNotPrintAfter,

					depth,
					group,
					sort
				}
	}

	private getDataAttributes = () : DataAttributes =>
	{
		const state = this.getValueFlag( ValueFlag.STATE ) as string
		const description = this.getValueFlag( ValueFlag.DESCRIPTION ) as string

		const unparsedLinked = this.getValueFlag( ValueFlag.LINK ) as number | number[]
		const linked = unparsedLinked ? ( Array.isArray( unparsedLinked ) ? unparsedLinked : [ unparsedLinked ] ) : undefined

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
				const { subParsed, argType } = this.handleMultipleValuesType( theArg )

				const values = subParsed.map( sub => sub.value ) as string[] | number[]
				parsedArgs.push({ value: values, type: argType })
			}
			else
			{
				const isTask = isNumber( theArg )
				const isAction = Object.values( Action ).includes( theArg as Action )
				const isBooleanFlag = Object.values( BooleanFlag ).includes( theArg as BooleanFlag )
				const isValueFlag = Object.values( ValueFlag ).includes( theArg as ValueFlag )
				const isGroupBy = ( theArg as ValueFlag ) === ValueFlag.GROUPB_BY

				if( isTask )
					parsedArgs.push( { value: Number.parseInt( theArg ), type: 'task' } )
				else if( isAction )
					parsedArgs.push( { value: theArg, type: 'action' } )
				else if( isBooleanFlag )
					parsedArgs.push( { value: true, type: 'flag', flagType: theArg as BooleanFlag } )
				else if( isValueFlag )
				{
					const followingValue : string | number = args[ i + 1 ] // TODO I might want the flag value to be an comma separated array

					let value : string | number
					if( isGroupBy && !handledGroupings.includes( followingValue as GroupByType ) )
						throw new GroupBySyntaxError( `'--group' following attribute should be from '${ handledGroupings.map( str => str ) }'` )
					else
						value = isNumber( followingValue ) ? Number.parseInt( followingValue ) : followingValue


					parsedArgs.push({ value, type: 'flag', flagType: theArg as ValueFlag })
					i++ // Because we used the next value
				}
				else
					parsedArgs.push( { value: theArg, type: 'text' } )
			}
		}

		return parsedArgs
	}

	/**
	 * @param multipleArg string containing a comma
	 *
	 * @throws {MultipleValuesMismatchError}
	 */
	private handleMultipleValuesType = ( multipleArg: string ) =>
	{
		const splitted = multipleArg.split( ',' )
		const subParsed = this.rawParse( splitted )

		let argType : ArgType | undefined = undefined

		subParsed.forEach( arg =>
		{
			if( argType === undefined )
				argType = arg.type
			else if( arg.type !== argType )
				throw new MultipleValuesMismatchError( argType, arg.type )
		});

		return { subParsed, argType }
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
export const isAction = ( arg: RawArg ) => arg.type === 'action'
export const isText = ( arg: RawArg ) => arg.type === 'text'