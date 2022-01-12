import chalk from "chalk"

import { TaskList, GroupByType, Order } from './TaskList';
import { Storage } from './Storage';
import { CliArgHandler } from "./CliArgHandler";
import { Config } from "./Config";

////////////////////////////////////////

export interface PrinterConfig
{
	shouldNotPrintAfter ?: boolean
	hideDescription ?: boolean
	hideTimestamp ?: boolean
	hideSubCounter ?: boolean
	hideTree ?: boolean
	hideCompleted ?: boolean

	depth ?: number
	group ?: GroupByType
	sort ?: Order
}

export interface ViewParams
{
	view: ViewType,
	target ?: ViewTargetType
}

type ViewType = 'full' | 'specific'
type ViewTargetType = string | string[] | number | number[]

////////////////////////////////////////

/**
 * Handles stdout like a buffer with multiple lines, you append lines to it then print
 */
export class Printer
{
	private feedback: string[]
	private viewParams: ViewParams

	private storage: Storage
	private config ?: PrinterConfig

	////////////////////

	constructor( storage ?: Storage, config ?: PrinterConfig )
	{
		this.feedback = []

		this.config = config
		this.storage = storage
	}

	////////////////////

	setView = ( type: ViewType, target ?: ViewTargetType ) =>
	{
		this.viewParams = { view: type, target }

		return this
	}

	addFeedback = ( message: string | string[] ) =>
	{
		const lines = Array.isArray( message ) ? message : [ message ]
		this.feedback = [ ...this.feedback, ...lines ]

		return this
	}

	////////////////////

	/**
	 * @description Need to use a brand new instance of Storage for grouping and sorting
	 * so the original file tasks' instances order stay preserved
	 */
	private cloneStorage = () =>
	{
		const { group, sort } = this.config

		// Didn't managed to make a proper deep nested cloning of the original this.storage instance without the new constructor
		const storageCopy = new Storage( this.storage.relativePath )

		if( group )
		{
			storageCopy.group( group )

			if( sort )
				storageCopy.order( sort )
		}

		return storageCopy
	}

	private getSpecificView = ( taskID: number | number[] ) =>
	{
		let toReturn : string[] = []

		const theTasksID = Array.isArray( taskID ) ? taskID : [ taskID ]
		const list: TaskList = new TaskList()

		theTasksID.forEach( ( id, index ) =>
		{
			this.cloneStorage().tasks.retrieveTask( id, ({ task }) =>
			{
				list.push( task )

				toReturn = [ ...toReturn, ...task.stringify( this.storage.meta.states, { ...this.config, hideCompleted: false } ), '' ]

				if( index !== ( theTasksID.length - 1 ) )
					toReturn.push( this.separator('-'), '' )
				else
					toReturn.push( list.getStats( this.storage.meta ), '' )
			})
		});

		toReturn = [ ...toReturn, ...this.getFileStats() ]

		return toReturn
	}

	private getFullView = () =>
	{
		let toReturn : string[] = []

		this.cloneStorage().tasks.forEach( task => toReturn.push( ...task.stringify( this.storage.meta.states, this.config ) ) );

		toReturn.push( '', ...this.getFileStats() )

		return toReturn
	}

	private getView = () =>
	{
		if( !this.viewParams )
			return []

		switch( this.viewParams.view )
		{
			case 'full':
				return this.getFullView()
			case 'specific':
				return this.getSpecificView( this.viewParams.target as number | number[] )
		}
	}

	/**
	 * Handle both view buffer and feedback buffer given arg should not print after
	 */
	print = () =>
	{
		let fullBuffer = []
		fullBuffer.push( this.charAccrossScreen( '-' ), '' )

		if( this.config.shouldNotPrintAfter )
		{
			if( this.feedback.length === 0 )
				return

			fullBuffer =
			[
				...fullBuffer,
				...this.feedback,
				this.charAccrossScreen( '-' )
			]
		}
		else
		{
			if( ( this.feedback.length === 0 ) && ( this.viewParams ) )
				return

			fullBuffer =
			[
				...fullBuffer,
				...this.getView(),
				this.charAccrossScreen( '-' ),
				'',
				...this.feedback
			]
		}

		printMessage( fullBuffer )
	}

	printView = () =>
	{
		const fullBuffer =
		[
			this.charAccrossScreen( '-' ),
			'',
			...this.getView(),
			'',
			this.charAccrossScreen( '-' ),
		]

		printMessage( fullBuffer )
	}

	printFeedback = () => printMessage( [ '', ...this.feedback ] )

	private getFileStats = () =>
	{
		const fileName = chalk.bold.underline( this.storage.relativePath )
		const stats = this.storage.tasks.getStats( this.storage.meta )

		return [ this.separator( '-' ) , '', ' ' + fileName, '', stats, '' ]
	}

	////////////////////

	private charAccrossScreen = ( char : string ) =>
	{
		let toReturn = ''

		for( let i = 0; i < ( process.stdout.columns - 2 ); i++ ) // -2 to do the margin of one space of begin and end
			toReturn += char

		return toReturn + ' '
	}

	private separator = ( char: string ) =>
	{
		let toReturn = ''

		for( let i = 0; i < ( process.stdout.columns / 10 ); i++ )
			toReturn += char

		return toReturn
	}

	private wrapText = ( text : string, indentLevel : number = 0, marginLeft : number = 0 ) =>
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
}

////////////////////////////////////////

export const PrinterFactory =
{
	create : ( argHander: CliArgHandler, config: Config, storage: Storage ) : Printer =>
	{
		const { flags } = argHander
		const { printing } = flags

		const finalConfig = { ...config }

		for( const [ key, value ] of Object.entries( printing ) )
			if( printing[ key ] !== undefined )
				finalConfig[ key ] = value

		return new Printer( storage, finalConfig )
	}
}

////////////////////////////////////////

export const printMessage = ( message : string | string[], chalkColor ?: string ) =>
{
	if( ( message === '' ) || ( message === [] ) )
		return

	const MARGIN = ' '
	message = Array.isArray( message ) ? message : [ message ]

	console.log('')
	message.forEach( line =>
	{
		let text = MARGIN + line
		text = chalkColor ? chalk[ chalkColor ]( text ) : text
		console.log( text )
	})
	console.log('')
}

export const printError = ( message: string | string[] ) => printMessage( message, 'red' )