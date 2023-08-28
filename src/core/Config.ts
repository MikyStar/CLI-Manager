import { System } from './System';
import { PrinterConfig } from './Printer';
import { GroupByType, Order } from './TaskList';
import { DEFAULT_STORAGE_FILE_NAME } from './Storage';

////////////////////////////////////////

export const DEFAULT_CONFIG_FILE_NAME = 'task.config.json';

export const DEFAULT_CONFIG_DATAS: ConfigFile = {
  storageFile: DEFAULT_STORAGE_FILE_NAME,
  group: 'state',
  sort: 'desc',
  shouldNotPrintAfter: false,
  hideCompleted: false,
  hideDescription: false,
  hideTree: false,
  clearBefore: false,
};

export interface ConfigFile extends PrinterConfig {
  storageFile?: string;
  configFile?: string;

  /////

  shouldNotPrintAfter?: boolean;
  hideDescription?: boolean;
  hideTimestamp?: boolean;
  hideSubCounter?: boolean;
  hideTree?: boolean;
  hideCompleted?: boolean;
  clearBefore?: boolean;

  depth?: number;
  group?: GroupByType;
  sort?: Order;
}

////////////////////////////////////////

/**
 * Expose task.config.json is current working directory datas
 */
export class Config implements ConfigFile {
  relativePath: string;

  storageFile?: string;
  configFile?: string;

  /////

  shouldNotPrintAfter?: boolean;
  hideDescription?: boolean;
  hideTimestamp?: boolean;
  hideSubCounter?: boolean;
  hideTree?: boolean;
  hideCompleted?: boolean;
  clearBefore?: boolean;

  depth?: number;
  group?: GroupByType;
  sort?: Order;

  ////////////////////////////////////////

  constructor(relativePath: string) {
    this.relativePath = relativePath;
    const configDatas = System.readJSONFile(this.relativePath);

    Object.assign(this, configDatas);
  }
}
