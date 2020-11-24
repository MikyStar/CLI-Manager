import { config } from './core/ConfigFile'
import { Printer } from './core/Printer'
import { Task } from './core/Task'

////////////////////////////////////////

Printer.printStringified( Printer.stringifyBoard( config.boards[0] ) )
