import { config } from './core/Config'
import { Printer } from './core/Printer'
import { Board } from './core/Board'

////////////////////////////////////////

Printer.printStringified( Board.stringify( config.boards[0] ) )
