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

		const state = this.getLastFlagFollowingValue( Flag.STATE ) || config.states[ 0 ]
		const description = this.getLastFlagFollowingValue( Flag.DESCRIPTION )
		const linked = this.getLastFlagFollowingValue( Flag.LINK )
		const boards = this.getAllBoard()

		//////////

		const firstCommandArg = userArgs[ 0 ]

		if( firstCommandArg.isAction )
		{
			this.untreatedArgs.splice( 0, 1 ) // As untreatedArgs starts with userArgs

			switch( firstCommandArg.value )
			{

				case Action.ADD_TASK:
				{
					if( onlyOneInputArg )
						Prompt.addTask()

					console.log( 'hidedesc', hideDescription )
					console.log( 'depth', printDepth )
					console.log( 'state', state )
					console.log( 'desc', description )
					console.log( 'linked', linked )
					console.log( 'boards', boards )
					console.log( 'untreated', this.untreatedArgs )

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
	 * @returns true or undefined
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
			return undefined
		else
		{
			this.untreatedArgs.splice( lastFlagIndex, 1 )

			return true
		}
	}

	private getAllBoard = () =>
	{
		const toReturn = []

		this.untreatedArgs.forEach( ( arg, index ) =>
		{
			if( arg.isBoard )
			{
				toReturn.push( arg.value )
				this.untreatedArgs.splice( index, 1 )
			}
		})

		return toReturn
	}
}