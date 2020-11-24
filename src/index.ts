import { config } from './core/ConfigFile'
import {Printer} from './core/Printer'

////////////////////////////////////////

console.log('conf', config)

Printer.printStringified( Printer.stringifyBoard( config.boards[0] ) )
