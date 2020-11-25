import { config } from './core/Config'
import { Printer } from './core/Printer'
import { Board } from './core/Board'
import { Prompt } from './core/Prompt'

////////////////////////////////////////

config.boards.forEach( board => Printer.printStringified( Board.stringify( board ) ) )
// Printer.printStringified( Board.stringify( config.boards[0] ) )

Prompt.addTask()

// console.log( config.boards[0].tasks[0] )
