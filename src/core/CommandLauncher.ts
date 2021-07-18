import { RawArg, Action, Flag } from "./ArgParser";
import { config } from "./Config";
import { Prompt } from "./Prompt";
import { ITask, StringifyArgs } from "./Task";

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

		const firstArg = userArgs[ 0 ]
		this.untreatedArgs.splice( 0, 1 ) // As untreatedArgs starts with userArgs

		//////////

		const hideDescription = this.getLastFlag( Flag.HIDE_DESCRIPTION )
		const hideTimestamp = this.getLastFlag( Flag.HIDE_TIMESTAMP )
		const hideTree = this.getLastFlag( Flag.HIDE_TREE )
		const hideSubCounter = this.getLastFlag( Flag.HIDE_SUB_COUNTER )
		const printDepth = this.getLastFlagFollowingValue( Flag.DEPTH ) as number

		const helpNeeded = this.getLastFlag( Flag.HELP )

		const printOptions : StringifyArgs =
		{
			depth: printDepth,
			hideDescription,
			hideTimestamp,
			hideSubCounter,
			hideTree
		}

		console.log('print options', printOptions )

		const state = this.getLastFlagFollowingValue( Flag.STATE ) as string
		const description = this.getLastFlagFollowingValue( Flag.DESCRIPTION ) as string
		const linked = this.getLastFlagFollowingValue( Flag.LINK ) as number[]
		const board = this.getBoard()

		//////////

		if( noInputArg )
		{
			config.print( printOptions )
			return
		}

		if( onlyOneInputArg && firstArg.isTask )
		{
			const tasksId = firstArg.value as number[]

			config.print({ tasksId: tasksId, ...printOptions })
		}

		if( firstArg.isAction )
		{
			switch( firstArg.value )
			{
				case Action.ADD_TASK:
				{
					if( onlyOneInputArg )
						Prompt.addTask()

					const task : ITask =
					{
						name: this.getFirstText(),
						state: state || config.states[ 0 ].name,
						dependencies: [ ...linked ],
						description,
					}

					let parentItem = {}
					if( ( this.untreatedArgs.length === 1 ) && ( this.untreatedArgs[ 0 ].isTask ) )
					{
						parentItem = { subTaskOf: this.untreatedArgs[ 0 ].value }
						this.untreatedArgs.splice( 0, 1 )
					}
					else
						parentItem = { boardName: board }

					config.addTask( task, parentItem )

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

	/**
	 * Uses untreatedArgs and remove them from list
	 * @returns first value of text
	 */
	private getFirstText = () =>
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
}