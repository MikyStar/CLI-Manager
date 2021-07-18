import { DefaultStorage } from './core/Config'
import { Printer } from './core/Printer'
import { Board } from './core/Board'
import { Prompt } from './core/Prompt'
import { ArgParser } from './core/ArgParser'
import { CommandLauncher } from './core/CommandLauncher'


////////////////////////////////////////

console.log('system args', process.argv )

// const allArgs = ArgParser.getAllArgs()
const userArgs = ArgParser.rawParse( process.argv.slice(2) )
const defaultArgs = ArgParser.rawParse( DefaultStorage.defaultArgs )
console.log( 'parsed default', defaultArgs)
console.log('parsed user', userArgs )

const launcher = new CommandLauncher( userArgs, defaultArgs )

DefaultStorage.print()

////////////////////////////////////////