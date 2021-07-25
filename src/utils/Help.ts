import { bold, italic } from "chalk"

// @ts-ignore
import pkg from '../../package.json'

////////////////////////////////////////

/**
 * Expose lines of decorated text as array for help flag
 */
class Help
{
	footer: string[]
	init: string[]
	version: string[]
	prinitingArgs: string[]
	addTask: string[]
	addBoard: string[]

	////////////////////

	constructor()
	{
		this.footer =
		[
			'',
			`${ italic( pkg.name ) }: ${ pkg.description }`,
			`Version: ${ bold( pkg.version ) }`,
			`More informations on ${ bold( pkg.repository.url )}`
		]

		this.version =
		[
			`${ pkg.version }`,
		]
	}

	////////////////////

	getFullMan = () =>
	{
		const toReturn : string[] = []

		return toReturn
	}
}

////////////////////////////////////////

export default new Help()