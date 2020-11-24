import { config } from './core/ConfigFile'
import { Printer } from './core/Printer'

////////////////////////////////////////

Printer.printStringified( Printer.stringifyBoard( config.boards[0] ) )
