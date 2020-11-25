export namespace Printer
{
	export const printStringified = ( array : string[] ) => array.forEach( str => console.log( str ) )

	export const charAccrossScreen = ( char : string ) =>
	{
		let toReturn = ' '

		for( let i = 0; i < ( process.stdout.columns - 2 ); i++ ) // -2 to do the margin of one space of begin and end
			toReturn += char

		return toReturn + ' '
	}
}
