import { config } from './core/Config'
import { Printer } from './core/Printer'
import { Board } from './core/Board'
import { Prompt } from './core/Prompt'
import { ArgParser } from './core/ArgParser'

////////////////////////////////////////

// config.printBoard()

console.log('process args', process.argv)

// const finalArgs = ArgParser.getAllArgs()
const finalArgs = [ ...config.defaultArgs, ...[ 'le', "inside some quotes", 'nom', 'de', 'ma', 'task', '-s', 'todo', 'a' ] ]
console.log( 'args', finalArgs)
console.log('parsed', ArgParser.parse( finalArgs ) )

// Prompt.addTask()
