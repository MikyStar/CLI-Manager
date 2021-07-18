import chalk from 'chalk'

import { IBoard } from './Board'
import { DefaultStorage } from './Config'

////////////////////////////////////////

export const TIMESTAMP_FORMAT = 'DD/MM/YYYY'

////////////////////////////////////////

export interface ITask
{
	name : string,
	description ?: string,
	id ?: number,
	subtasks ?: ITask[],
	dependencies ?: number[], // Tasks IDS
	timestamp ?: string,
	state: string,
}

export interface StringifyArgs
{
	hideDescription ?: boolean,
	hideTimestamp ?: boolean,
	hideSubCounter ?: boolean,
	hideTree ?: boolean,

	depth ?: number,

	indentLevel ?: number,
	isLastChild ?: boolean,
	isFirstChild ?: boolean,
}

////////////////////////////////////////

export namespace Task
{
	/**
	 * Transform the tree of tasks and subtasks to an array of tasks
	 */ 
	export const straightTask = ( task: ITask ) =>
	{
		let toReturn : ITask[] = []

		if( !task.subtasks || task.subtasks.length === 0 )
		{
			toReturn.push( task )

			return toReturn
		}
		else
		{
			task.subtasks.forEach( sub =>
			{
				const result = straightTask( sub )

				toReturn = [ ...toReturn, ...result ]
			})

			const taskCopy = { ...task }
			delete taskCopy.subtasks
			toReturn.push( taskCopy )

			return toReturn
		}
	}

	/**
	 * TODO implement hide timestamp and sub counter
	 */
	export const stringify = ( task : ITask, options ?: StringifyArgs ) =>
	{
		const DEFAULT_INDENT_LEVEL = 1
		const INDENT_MARKER = '    '
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

		const { indentLevel = DEFAULT_INDENT_LEVEL, isFirstChild = true, isLastChild,
			hideDescription, depth, hideTimestamp, hideSubCounter, hideTree } = options

		let toReturn : string[] = []
		let indentation = ''

		////////////////////

		const isFinalState = task.state === DefaultStorage.states[ DefaultStorage.states.length - 1 ].name
		const isFirstState = task.state === DefaultStorage.states[ 0 ].name

		const stateColor = DefaultStorage.states.filter( state => task.state === state.name )[0].hexColor

		const coloredID = chalk.hex( stateColor )( `${ task.id }.` )

		if( hideTree || isFirstChild )
		{
			for( let i = 0; i < ( indentLevel - 1 ); i++ )
				indentation += INDENT_MARKER
		}
		else
		{
			for( let i = 0; i < ( indentLevel - 2 ); i++ )
				indentation += TREE_MARKER.branch

			indentation += ( isLastChild ? TREE_MARKER.lastNode : TREE_MARKER.node )
		}

		const iconText = isFinalState ? '✔' : ( isFirstState ? '☐' : '♦' )
		const coloredIcon = chalk.hex( stateColor )( iconText )
		const coloredName = isFinalState ? chalk.strikethrough.grey( task.name ) : task.name

		const fullLine = ` ${ coloredID }${ MARGIN }${ indentation }${ coloredIcon } ${ coloredName }`
		toReturn.push( fullLine )

		////////////////////

		if( !hideDescription )
		{
			const parseDescriptionLines = () =>
			{
				if( !task.description )
					return []

				let toReturn : string[] = []

				const descExploded = task.description.split( LINE_BREAK )

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

						if( !isFirstChild && !hideTree )
							toReturn = indentation.split( TREE_CHARS.node ).join( TREE_CHARS.branch );

						return toReturn
					}

					const text = ` ${ MARGIN }${ handleChangeNodeIconToBranch() }${ separation }${ INDENT_DESCRIPTION }${ line }`

					toReturn.push( text )
				});

				return toReturn
			}
			toReturn = [ ...toReturn, ...parseDescriptionLines() ]
		}

		////////////////////

		if( !task.subtasks || task.subtasks.length === 0 )
			return toReturn
		else
		{
			task.subtasks.forEach( ( sub, index ) =>
			{
				const shallNotPrint = ( depth !== undefined ) && ( indentLevel >= depth + 1 )
				if( !shallNotPrint )
				{
					const isLastChild = index === ( task.subtasks.length - 1 )
					const result = Task.stringify( sub, { ...options, indentLevel: indentLevel + 1, isLastChild, isFirstChild: false } )

					toReturn = [ ...toReturn, ...result ]
				}
			});

			return toReturn
		}
	}

	/**
	 * Use recursion to return all tasks matching value
	 */
	export const search = <K extends keyof ITask>( taskList: ITask[], taskAttribute: K, value: any ) =>
	{
		const tasks : ITask[] = []

		 // @see: https://stackoverflow.com/questions/43612046/how-to-update-value-of-nested-array-of-objects
		taskList.forEach( function iter( task )
		{
			if( task[ taskAttribute ] === value )
			{
				tasks.push( task )
			}

			Array.isArray( task.subtasks ) && task.subtasks.forEach( iter );
		})

		return tasks
	}

	/**
	 * Use recursion to return a count of every tasks and subtasks included in list
	 */
	export const countTaskAndSub = ( list: ITask[] ) =>
	{
		let count = 0

		// @see: https://stackoverflow.com/questions/43612046/how-to-update-value-of-nested-array-of-objects
		list.forEach( function iter( task )
		{
			count++

			Array.isArray( task.subtasks ) && task.subtasks.forEach( iter );
		})

		return count
	}

	export const getStats = ( tasks : ITask[] ) : string =>
	{
		let toReturn = ' '
		const totalCount = countTaskAndSub( tasks )
	
		DefaultStorage.states.forEach( ( state, index ) =>
		{
			const count = search( tasks, 'state', state.name ).length
			const percent = ( count / totalCount ) * 100

			if( ( index !== 0 ) && ( index !== DefaultStorage.states.length ) )
				toReturn += ' ► '

			const text = `${ count } ${ state.name } (${ percent.toFixed(0) }%)`

			toReturn += chalk.hex( state.hexColor )( text )
		});

		return toReturn
	}
}
