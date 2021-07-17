import { RawArg, Action, Flag } from "./ArgParser";
import { config } from "./Config";
import { Prompt } from "./Prompt";

////////////////////////////////////////

export class CommandLauncher
{
	userArgs: RawArg[]
	defaultArgs: RawArg[]
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

		//////////

		const noUserArg = userArgs.length === 0
		const onlyOneUserArg = userArgs.length === 1

		if( noUserArg )
			config.printBoard()

		const firstCommandArg = userArgs[ 0 ]

		if( firstCommandArg.isAction )
		{
			switch( firstCommandArg.value )
			{
				case Action.ADD_TASK:
				{
					if( onlyOneUserArg )
						Prompt.addTask()

					const userInputedState = this.getFlagFollowingValue( Flag.STATE, userArgs )
					const defaultState = this.getFlagFollowingValue( Flag.STATE, defaultArgs )

					if( !userInputedState && !defaultState )
						throw new Error( 'You need to add a state or add a default one in your file' )

					const state = userInputedState || defaultState
					
					const description = this.getFlagFollowingValue( Flag.DESCRIPTION, userArgs ) 
						|| this.getFlagFollowingValue( Flag.DESCRIPTION, userArgs )

					const linked = this.getFlagFollowingValue( Flag.LINK, userArgs ) 
						|| this.getFlagFollowingValue( Flag.LINK, userArgs )

					console.log( 'state', state )

					// config.addTask()

					break;
				}
			}
		}
	}

	////////////////////

	/**
	 * Return value for flag or undefined
	 */
	private getFlagFollowingValue = ( flag: Flag, args: RawArg[] ) =>
	{
		let lastFlagIndex = -1

		for( let i = 0; i < args.length; i++ )
		{
			const theArg = args[ i ]

			if( theArg.isFlag && ( theArg.value === flag ) )
				lastFlagIndex = i
		}

		if( lastFlagIndex === -1 )
			return undefined
		else
		{
			const followingArg = args[ lastFlagIndex + 1 ]

			if( followingArg.isText )
				return followingArg.value
			else
				throw new Error( 'The following arg is not text' )
		}
	}
}