import { RawArg, Action, Flag, ArgParser } from "./ArgParser";
import { Config, DEFAULT_CONFIG_NAME } from "./Config";
import { Prompt } from "./Prompt";
import { ITask, StringifyArgs } from "./Task";

////////////////////////////////////////

export class CommandLauncher
{
	userArgs: RawArg[]
	configFile: Config
	defaultArgs: RawArg[]
	untreatedArgs: RawArg[]

	////////////////////

	constructor()
	{
		this.userArgs = ArgParser.rawParse( process.argv.slice(2) )
		this.untreatedArgs = [ ...this.userArgs ]

		const specificFileLocation = this.getLastFlagFollowingValue( Flag.FILE ) as string

		this.configFile = new Config( specificFileLocation || DEFAULT_CONFIG_NAME )
		this.defaultArgs = ArgParser.rawParse( this.configFile.defaultArgs )
		this.untreatedArgs = [ ...this.untreatedArgs, ...this.defaultArgs ]

		console.log( 'parsed default', this.defaultArgs)
		console.log('parsed user', this.userArgs )

		//////////

		const noInputArg = this.userArgs.length === 0
		const onlyOneInputArg = this.userArgs.length === 1

		const firstArg = this.userArgs[ 0 ]
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

		const state = this.getLastFlagFollowingValue( Flag.STATE ) as string
		const description = this.getLastFlagFollowingValue( Flag.DESCRIPTION ) as string
		const linked = this.getLastFlagFollowingValue( Flag.LINK ) as number[]
		const board = this.getBoard()

		//////////

		if( noInputArg )
		{
			this.configFile.print( printOptions )
			return
		}

		if( onlyOneInputArg && firstArg.isTask )
		{
			const tasksId = firstArg.value as number[]

			this.configFile.print({ tasksId: tasksId, ...printOptions })
			return
		}

		if( firstArg.isAction )
		{
			switch( firstArg.value )
			{
				case Action.ADD_TASK:
				{
					if( onlyOneInputArg )
						Prompt.addTask( this.configFile )

					const task : ITask =
					{
						name: this.getFirstText(),
						state: state || this.configFile.states[ 0 ].name,
						dependencies: this.parseDependencies( linked ),
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

					this.configFile.addTask( task, parentItem )

					break;
				}

				////////////////////

				case Action.ADD_BOARD:
				{
					this.configFile.addBoard( this.getFirstText(), description )
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

	private parseDependencies = ( tasksId : any ) =>
	{
		let dependencies = undefined

		if( Array.isArray( tasksId ))
			dependencies = [ ...tasksId ]
		else if( tasksId )
			dependencies = [ tasksId ]

		return dependencies
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