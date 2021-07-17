import { RawArg, Action, Flag } from "./ArgParser";
import { config } from "./Config";
import { Prompt } from "./Prompt";

////////////////////////////////////////

export class CommandLauncher
{
	userArgs: RawArg[]
	defaultArgs: RawArg[]
	untreatedArgs: RawArg[]
	printDepth: number
	hideDescription: boolean
	state: string
	board: string
	action: string

	////////////////////

	constructor( userArgs: RawArg[], defaultArgs: RawArg[] )
	{
		this.userArgs = userArgs
		this.defaultArgs = defaultArgs
		this.untreatedArgs = [ ...userArgs, ...defaultArgs ]

		//////////

		const noInputArg = userArgs.length === 0
		const onlyOneInputArg = userArgs.length === 1

		if( noInputArg )
			config.printBoard()

		//////////

		const hideDescription = this.getLastFlag( Flag.HIDE_DESCRIPTION )
		const printDepth = this.getLastFlagFollowingValue( Flag.DEPTH )
		const helpNeeded = this.getLastFlag( Flag.HELP )

		const state = this.getLastFlagFollowingValue( Flag.STATE ) || config.states[ 0 ]
		const description = this.getLastFlagFollowingValue( Flag.DESCRIPTION )
		const linked = this.getLastFlagFollowingValue( Flag.LINK )
		const board = this.getBoard()

		console.log( 'hidedesc', hideDescription )
		console.log( 'help', helpNeeded )
		console.log( 'depth', printDepth )
		console.log( 'state', state )
		console.log( 'desc', description )
		console.log( 'linked', linked )
		console.log( 'board', board )
		console.log( 'untreated', this.untreatedArgs )

		//////////

		const firstArg = userArgs[ 0 ]

		if( firstArg.isAction )
		{
			this.untreatedArgs.splice( 0, 1 ) // As untreatedArgs starts with userArgs

			switch( firstArg.value )
			{

				case Action.ADD_TASK:
				{
					if( onlyOneInputArg )
						Prompt.addTask()


					// config.addTask()

					break;
				}
			}
		}
	}

	////////////////////

	/**
	 * Uses untreatedArgs and remove them from list
	 * @returns last value for flag or undefined
	 */
	private getLastFlagFollowingValue = ( flag: Flag ) =>
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

	/**
	 * Uses untreatedArgs and remove them from list
	 * @returns boolean
	 */
	private getLastFlag = ( flag: Flag ) =>
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
}