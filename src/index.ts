import { config } from './core/Config'
import { Printer } from './core/Printer'
import { Board } from './core/Board'
import { Prompt } from './core/Prompt'

////////////////////////////////////////

Printer.printStringified( Board.stringify( config.boards[0] ) )

Prompt.addTask()
