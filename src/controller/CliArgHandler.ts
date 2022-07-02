import { PrinterConfig } from '../core/Printer'
import { GroupByType, handledGroupings, Order } from '../core/TaskList'

import { MultipleValuesMismatchError } from '../errors'
import { GroupBySyntaxError } from '../errors/CLISyntaxErrors'

////////////////////////////////////////

export enum Action
{
	CREATE_STORAGE = 'storage',
	CREATE_CONFIG = 'config',
	ADD_TASK = 'a',
	CHECK = 'c',
	DELETE = 'd',
	EDIT = 'e',
	INCREMENT = 'i',
	MOVE = 'mv',
	EXTRACT = 'x',
}

export enum BooleanFlag // TODO refactor with array string type like group & sort and aggreagate between global args and commands
{
	HELP = '--help',
	VERSION = '--version',

	RECURSIVE = '-r',

	/////

	HIDE_TREE = '--hide-tree',
	HIDE_TIMESTAMP = '--hide-timestamp',
	HIDE_SUB_COUNTER = '--hide-sub-counter',
}

export enum OnOffFlag
{
	HIDE_DESCRIPTION = '--hide-description',
	SHOW_DESCRIPTION = '--show-description',

	DONT_PRINT_AFTER = '--no-print',
	DO_PRINT_AFTER = '--print',

	CLEAR_BEFORE = '--clear',
	DONT_CLEAR_BEFORE = '--no-clear',

	HIDE_COMPLETED = '--hide-completed',
	SHOW_COMPLETED = '--show-completed',
}

export enum ValueFlag // TODO same as above
{
	STORAGE_FILE = '--storage',
	DEPTH = '--depth',
	GROUP_BY = '--group',
	SORT = '--sort',
	STATE = '-s',
	DESCRIPTION = '-d',
	TAG = '-t',
}

type FlagType = ValueFlag | BooleanFlag | OnOffFlag

export interface RawArg
{
	value: string | string[] | number | number[] | true
	type: ArgType
	flagType ?: FlagType
}

type ArgType = 'action' | 'task' | 'text' | 'flag' | 'priority'

export interface DataAttributes
{
	description ?: string
	state ?: string,
	priority ?: number
}

export interface HandledFlags
{
	printing ?: PrinterConfig
	dataAttributes ?: DataAttributes
	storageLocation: string
	config ?: boolean
	isRecursive ?: boolean
	isHelpNeeded ?: boolean
	isVersion ?: boolean
}

interface ArgInfos
{
	/** If a user has inputed a terminal action flag command (ex: --help, --version ...) */
	isThereCliFlagCommand: boolean
	isThereCLIArgs: boolean
	isThereOnlyOneCLIArgs: boolean
}

interface ArgOccurance<T extends FlagType>
{
	flag: T
	index: number
}

////////////////////////////////////////

export class CliArgHandler
{
	private untreatedArgs: RawArg[]

	flags: HandledFlags
	words: RawArg[]
	infos: ArgInfos

	////////////////////

	constructor()
	{
		this.untreatedArgs = this.rawParse( process.argv.slice( 2 ) )

		//////////

		this.flags =
		{
			printing: this.getPrinterConfig(),
			dataAttributes: this.getDataAttributes(),
			storageLocation: this.getValueFlag( ValueFlag.STORAGE_FILE ) as string,
			isRecursive: this.getBoolFlag( BooleanFlag.RECURSIVE ),
			isHelpNeeded: this.getBoolFlag( BooleanFlag.HELP ),
			isVersion: this.getBoolFlag( BooleanFlag.VERSION )
		}

		this.words = [ ...this.untreatedArgs ]

		const { isHelpNeeded, isVersion } = this.flags

		this.infos =
		{
			isThereCliFlagCommand: isHelpNeeded || isVersion,
			isThereCLIArgs: this.words.length > 0,
			isThereOnlyOneCLIArgs: this.words.length === 1
		}
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
		const hideTimestamp = this.getBoolFlag( BooleanFlag.HIDE_TIMESTAMP )
		const hideTree = this.getBoolFlag( BooleanFlag.HIDE_TREE )
		const hideSubCounter = this.getBoolFlag( BooleanFlag.HIDE_SUB_COUNTER )

		const depth = this.getValueFlag( ValueFlag.DEPTH ) as number
		const group = this.getValueFlag( ValueFlag.GROUP_BY ) as GroupByType
		const sort = this.getValueFlag( ValueFlag.SORT ) as Order

		/////

		const hideDescription = this.handleOnOffFlags(OnOffFlag.HIDE_DESCRIPTION)
		const hideCompleted = this.handleOnOffFlags(OnOffFlag.HIDE_COMPLETED)
		const shouldNotPrintAfter = this.handleOnOffFlags(OnOffFlag.DONT_PRINT_AFTER)
		const clearBefore = this.handleOnOffFlags(OnOffFlag.CLEAR_BEFORE)

		return	{
					hideDescription,
					hideTimestamp,
					hideSubCounter,
					hideTree,
					hideCompleted,
					shouldNotPrintAfter,
					clearBefore,

					depth,
					group,
					sort
				}
	}

	private handleOnOffFlags = ( flag: OnOffFlag ) : boolean | undefined =>
	{
		const orderedMap: OnOffFlag[] = [
			OnOffFlag.HIDE_DESCRIPTION, OnOffFlag.SHOW_DESCRIPTION,
			OnOffFlag.HIDE_COMPLETED, OnOffFlag.SHOW_COMPLETED,
			OnOffFlag.DONT_PRINT_AFTER, OnOffFlag.DO_PRINT_AFTER,
			OnOffFlag.CLEAR_BEFORE, OnOffFlag.DONT_CLEAR_BEFORE
		]

		const actualFlagPos = orderedMap.findIndex(el => el === flag)
		const isAntiAfter = actualFlagPos % 2 === 0
		const antiPos = actualFlagPos + (isAntiAfter ? +1 : -1)
		const antiFlag: OnOffFlag = orderedMap[ antiPos ]

		const occurances = this.extractOccurances<OnOffFlag>((arg) =>
			arg.type === 'flag' && ( arg.flagType === flag || arg.flagType === antiFlag )
		)

		if( occurances === undefined )
			return undefined

		const lastFlag = occurances[ occurances.length - 1]

		return lastFlag.flag === flag
	}

	/**
	 * Find occurances in input order with their position that math the callback,
	 * returns them and delete them from the untreatedArgs array
	 */
	private extractOccurances = <T extends FlagType>(callback : (arg: RawArg, index ?: number) => boolean ): ArgOccurance<T>[] | undefined =>
	{
		const occurances: ArgOccurance<T>[] = []

		this.untreatedArgs.forEach((el, index) => {
			if(callback(el, index))
				occurances.push({ flag: el.flagType as T, index })
		})

		if( occurances.length === 0 )
			return undefined

		/** @see: https://www.codegrepper.com/code-examples/javascript/array+splice+in+for+loop+javascript */
		for (let i = occurances.length - 1; i >= 0; i--)
			this.untreatedArgs.splice(occurances[ i ].index, 1);

		return occurances
	}

	private getDataAttributes = () : DataAttributes =>
	{
		const state = this.getValueFlag( ValueFlag.STATE ) as string
		const description = this.getValueFlag( ValueFlag.DESCRIPTION ) as string
		const priority = this.getPriority()

		return	{
					state,
					description,
					priority
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
				const isOnOffFlag = Object.values( OnOffFlag ).includes( theArg as OnOffFlag )
				const isValueFlag = Object.values( ValueFlag ).includes( theArg as ValueFlag )
				const isGroupBy = ( theArg as ValueFlag ) === ValueFlag.GROUP_BY
				const isPriority = ( theArg.match( /^!+$/ )?.length === 1 ) || false

				if( isTask )
					parsedArgs.push( { value: Number.parseInt( theArg ), type: 'task' } )
				else if( isAction )
					parsedArgs.push( { value: theArg, type: 'action' } )
				else if( isBooleanFlag )
					parsedArgs.push( { value: true, type: 'flag', flagType: theArg as BooleanFlag } )
				else if( isOnOffFlag )
					parsedArgs.push( { value: true, type: 'flag', flagType: theArg as OnOffFlag } )
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
				else if( isPriority )
					parsedArgs.push( { value: theArg.length, type: 'priority' })
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

	private getBoolFlag = ( flag: BooleanFlag ) : boolean | undefined =>
	{
		const index = this.untreatedArgs.findIndex( arg => ( arg.type === 'flag' ) && ( arg.flagType === flag ) && ( arg.value === true ) )

		if( index === -1 )
			return undefined
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

	private getPriority = () : number =>
	{
		const index = this.untreatedArgs.findIndex( arg => ( arg.type === 'priority' ) && ( arg.value !== undefined ) )

		if( index === -1 )
			return undefined
		else
		{
			const value = this.untreatedArgs[ index ].value
			this.untreatedArgs.splice( index, 1 )

			return value as number
		}
	}
}

////////////////////

export const isTask = ( arg: RawArg ) => arg.type === 'task'
export const isAction = ( arg: RawArg ) => arg.type === 'action'
export const isText = ( arg: RawArg ) => arg.type === 'text'