export const stringify = ( board : IBoard, availableStates : ConfigState[], options ?: StringifyArgs ) : string[] =>
	{
		let toReturn : string[] = []

		const boardNameStyled = chalk.bold.underline( '@' + board.name )
		toReturn.push( boardNameStyled + '\n' )

		const descriptionStyled = chalk.dim( board.description )
		if( !options.hideDescription && board.description )
			toReturn.push( '    ' + descriptionStyled + '\n' )

		board.tasks?.forEach( task =>
		{
			const result = Task.stringify( task, availableStates, options )

			toReturn = [ ...toReturn, ...result ]
		})

		if( board.tasks && board.tasks.length !== 0 )
		{
			toReturn.push('')
			toReturn.push( Task.getStats( straightBoard( board ), availableStates ) )
		}
		else
			toReturn.push( chalk.dim( ' \t' + 'No tasks yet' ) )

		return toReturn
	}