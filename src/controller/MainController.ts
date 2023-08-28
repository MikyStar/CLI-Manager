import { Printer, PrinterFactory } from '../core/Printer';
import { Storage, DEFAULT_STORAGE_FILE_NAME, StorageFactory } from '../core/Storage';
import { Config, DEFAULT_CONFIG_FILE_NAME, DEFAULT_CONFIG_DATAS } from '../core/Config';
import { System } from '../core/System';
import Help from '../core/Help';

import { StorageError, ConfigError } from '../errors/CLISyntaxErrors';
import { CliArgHandler, Action, isAction } from './CliArgHandler';

////////////////////////////////////////

export class MainController {
  argHandler: CliArgHandler;

  printer: Printer;

  config?: Config;
  storage?: Storage;

  finalStorageLocation: string;

  ////////////////////

  /**
   * Handles init and expose context to Main flow
   */
  constructor() {
    this.argHandler = new CliArgHandler();

    //////////

    this.handleFlagCommandArgs();

    if (System.doesFileExists(DEFAULT_CONFIG_FILE_NAME)) this.config = new Config(DEFAULT_CONFIG_FILE_NAME);

    this.finalStorageLocation =
      this.argHandler.flags.storageLocation || this.config?.storageFile || DEFAULT_STORAGE_FILE_NAME;

    this.handleCreatingFiles();

    if (System.doesFileExists(this.finalStorageLocation)) this.storage = new Storage(this.finalStorageLocation);

    this.printer = PrinterFactory.create(this.argHandler, this.config, this.storage);
  }

  ////////////////////

  private handleFlagCommandArgs = () => {
    const printer = new Printer();

    const { flags, infos: argInfos, words } = this.argHandler;
    const [firstArg] = words;
    const { isHelpNeeded, isVersion } = flags;
    const { isThereCliFlagCommand, isThereOnlyOneCLIArgs } = argInfos;

    if (isThereCliFlagCommand) {
      if (isHelpNeeded) {
        if (isThereOnlyOneCLIArgs && isAction(firstArg)) {
          printer.addFeedback(Help.handleAction(firstArg.value as Action)).printFeedback();
        } else printer.addFeedback(Help.fullMan()).printFeedback();
      } else if (isVersion) printer.addFeedback(Help.version).printFeedback();

      System.exit();
    }
  };

  private handleCreatingFiles = () => {
    const { words } = this.argHandler;
    const [firstArg, secondArg] = words;

    const isStorageCreate = words.length > 0 && isAction(firstArg) && firstArg.value === Action.CREATE_STORAGE;
    const isConfigCreate = words.length > 0 && isAction(firstArg) && firstArg.value === Action.CREATE_CONFIG;

    if (isConfigCreate || isStorageCreate) {
      const printer = new Printer();

      if (isConfigCreate) {
        if (System.doesFileExists(DEFAULT_CONFIG_FILE_NAME))
          throw new ConfigError(`Config file '${DEFAULT_CONFIG_FILE_NAME}' already exists`);

        System.writeJSONFile(DEFAULT_CONFIG_FILE_NAME, DEFAULT_CONFIG_DATAS);
        printer.addFeedback(`Config file '${DEFAULT_CONFIG_FILE_NAME}' created`);
      } else if (isStorageCreate) {
        const storagePath = (secondArg?.value as string) || DEFAULT_STORAGE_FILE_NAME;

        if (System.doesFileExists(storagePath)) throw new StorageError(`Storage file '${storagePath}' already exists`);

        StorageFactory.init(storagePath);
        printer.addFeedback(`Storage file '${storagePath}' created`);
      }

      printer.printFeedback();
      System.exit();
    }

    if (this.argHandler.words.length === 0) {
      if (!System.doesFileExists(this.finalStorageLocation)) {
        new Printer()
          .addFeedback('Go ahead and create a storage file !\n')
          .addFeedback(Help.getMan('createStorage'))
          .printFeedback();

        System.exit();
      }
    }
  };
}
