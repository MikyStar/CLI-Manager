import chalk from "chalk"

import { ConfigState, DefaultArgs } from "./Config"

////////////////////////////////////////

export const TIMESTAMP_FORMAT = 'DD/MM/YYYY'

////////////////////////////////////////

export interface ITask
{
	name ?: string,
	description ?: string,
	id ?: number,
	subtasks ?: ITask[],
	dependencies ?: number[], // Tasks IDS
	timestamp ?: string
	state ?: string
	priority ?: number
}

export interface StringifyArgs extends DefaultArgs
{
	parentIndent ?: string,
	subTaskLevel ?: number,
	isLastChild ?: boolean,
	isSubTask ?: boolean,
	isLastParent ?: boolean,
}

////////////////////////////////////////

export class Task implements ITask
{
	name ?: string
	id ?: number
	description ?: string
	subtasks ?: Task[]
	dependencies ?: number[]
	timestamp ?: string
	state ?: string
	priority ?: number
	tags ?: string[]

	/////

	constructor( task: Partial<ITask> )
	{
		Object.assign( this, task )

		if( !task.dependencies )
			delete this.dependencies

		if( !task.subtasks )
			delete this.subtasks

		this.subtasks = ( task.subtasks && ( task.subtasks.length > 0 ) ) && task.subtasks.map( sub => new Task( sub ))
	}

	/////

	/**
	 * Transform the tree of tasks and subtasks to an array of tasks
	 */
	straightTask = () =>
	{
		let toReturn : Task[] = []

		if( !this.subtasks || this.subtasks.length === 0 )
		{
			toReturn.push( this )

			return toReturn
		}
		else
		{
			this.subtasks.forEach( sub =>
			{
				const result = sub.straightTask()

				toReturn = [ ...toReturn, ...result ]
			})

			const taskCopy = { ...this }
			delete taskCopy.subtasks
			toReturn.push( taskCopy )

			return toReturn
		}
	}

	/**
	 * TODO this is not stringify, this is printify
	 *
	 * TODO implement hide timestamp and sub counter
	 */
	stringify = ( availableStates : ConfigState[], options ?: StringifyArgs ) =>
	{
		const INDENT_MARKER = '    '
		const DEFAULT_SUBTASK_LEVEL = 1
		const INDENT_DESCRIPTION = '  '
		const MARGIN = '\t'
		const LINE_BREAK = '\n'
		const TREE_CHARS =
		{
			node: '├── ',
			lastNode: '└── ',
			branch: '│   '
		}
		const TREE_MARKER =
		{
			node: chalk.grey( TREE_CHARS.node ),
			lastNode: chalk.grey( TREE_CHARS.lastNode ),
			branch: chalk.grey( TREE_CHARS.branch ),
		}

		////////////////////

		const { parentIndent, subTaskLevel = DEFAULT_SUBTASK_LEVEL, isSubTask,
			isLastChild, hideDescription, depth, isLastParent, hideTimestamp, hideSubCounter, hideTree } = options

		let toReturn : string[] = []
		let indentation = parentIndent || ''

		////////////////////

		const isFinalState = this.state === availableStates[ availableStates.length - 1 ].name
		const taskState = availableStates.filter( state => this.state === state.name )[0]

		const coloredID = chalk.hex( taskState.hexColor )( `${ this.id }.` )

		if( isSubTask )
		{
			if( hideTree )
				indentation += INDENT_MARKER
			else
			{
				( function replaceParentNodeInBranch()
				{
					const lastIndex = indentation.lastIndexOf( TREE_MARKER.node )

					if( lastIndex >= 0 && lastIndex + TREE_MARKER.branch.length >= indentation.length )
						indentation = indentation.substring(0, lastIndex) + TREE_MARKER.branch
				})()

				if( isLastParent )
					indentation = indentation.split( TREE_CHARS.lastNode ).join( INDENT_MARKER );

				indentation += ( isLastChild ? TREE_MARKER.lastNode : TREE_MARKER.node )
			}
		}

		const coloredIcon = chalk.hex( taskState.hexColor )( taskState.icon )
		const coloredName = isFinalState ? chalk.strikethrough.grey( this.name ) : this.name

		const fullLine = `${ coloredID }${ MARGIN }${ indentation }${ coloredIcon } ${ coloredName }`
		toReturn.push( fullLine )

		////////////////////

		if( !hideDescription )
		{
			const parseDescriptionLines = () =>
			{
				if( !this.description )
					return []

				let toReturn : string[] = []

				const descExploded = this.description.split( LINE_BREAK )

				descExploded.forEach( line =>
				{
					line = isFinalState ? chalk.grey.strikethrough( line ) : chalk.dim( line )

					const separation = !hideTree ? TREE_MARKER.branch : INDENT_MARKER

					/**
					 * As the tree indentation for a subtask is a node but we want a simple
					 * branch for his description
					 */
					const handleChangeNodeIconToBranch = () =>
					{
						let toReturn = indentation

						if( !hideTree )
							toReturn = indentation.split( TREE_CHARS.node ).join( TREE_CHARS.branch );

						return toReturn
					}

					const text = `${ MARGIN }${ handleChangeNodeIconToBranch() }${ separation }${ INDENT_DESCRIPTION }${ line }`

					toReturn.push( text )
				});

				return toReturn
			}
			toReturn = [ ...toReturn, ...parseDescriptionLines() ]
		}

		////////////////////

		if( !this.subtasks || this.subtasks.length === 0 )
			return toReturn
		else
		{
			this.subtasks.forEach( ( sub, index ) =>
			{
				const shallNotPrint = ( depth !== undefined ) && ( subTaskLevel >= depth + 1 )
				if( !shallNotPrint )
				{
					const willBeLastChild = index === ( this.subtasks.length - 1 )
					const childOptions: StringifyArgs =
					{
						...options,
						subTaskLevel: subTaskLevel + 1,
						parentIndent: indentation,
						isLastChild: willBeLastChild,
						isSubTask: true,
						isLastParent: isLastChild
					}
					const result = sub.stringify( availableStates, childOptions )

					toReturn = [ ...toReturn, ...result ]
				}
			});

			return toReturn
		}
	}
}