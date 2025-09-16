// @ts-ignore
import pkg from '../package.json';

import { isTask, isAction } from './controller/CliArgHandler';
import { printError, printMessage } from './core/Printer';
import { System } from './core/System';

import Help from './core/Help';

import { MainController } from './controller/MainController';

import { CLISyntaxError } from './errors/CLISyntaxErrors';
import { CatchableError } from './errors/CatchableError';
import { ActionHandler } from './controller/ActionHandler';

////////////////////////////////////////

const main = async () => {
  try {
    const controller = new MainController();
    const { argHandler, printer } = controller;

    const { words, infos: argInfos } = argHandler;
    const [firstArg] = words;
    const { isThereCLIArgs, isThereCliFlagCommand, isThereOnlyOneCLIArgs } = argInfos;

    //////////

    if (!isThereCLIArgs && !isThereCliFlagCommand) {
      printer.setView('full').printView();

      System.exit();
    }

    if (isThereOnlyOneCLIArgs && isTask(firstArg)) {
      const tasksId = firstArg.value as number[];

      printer.setView('specific', tasksId).printView();

      System.exit();
    }

    if (isAction(firstArg)) {
      const actionHandler = new ActionHandler(controller);
      await actionHandler.handleAction();

      System.exit();
    }
  } catch (error) {
    if (!(error instanceof CatchableError)) {
      const issuesUrl = `${pkg.repository.url}/issues`;

      console.error(error);
      printError(`This was not a properly handled error case, please submit an issue at ${issuesUrl}`);
    } else {
      if (error instanceof CLISyntaxError) {
        printError(error.message);
        printMessage(Help.getMan(error.manEntry));
      } else printError(error.message);
    }

    System.exit(-1);
  }
};

////////////////////

main();
