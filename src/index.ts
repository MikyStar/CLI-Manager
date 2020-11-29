import { config } from './core/Config'
import { Printer } from './core/Printer'
import { Board } from './core/Board'
import { Prompt } from './core/Prompt'
import { ArgParser } from './core/ArgParser'

////////////////////////////////////////

config.printBoard()

const finalArgs = ArgParser.getAllArgs()
console.log( 'args', finalArgs)
console.log('parsed', ArgParser.parse( finalArgs ) )

// Prompt.addTask()
