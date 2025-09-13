import chalk from 'chalk';
import moment from 'moment';

import {
  NoFurtherStateError,
  TaskIdDuplicatedError,
  TaskNotFoundError,
  TaskStateUnknownError,
} from '../errors/TaskErrors';
import { Task, ITask, TIMESTAMP_FORMAT } from './Task';

import { Meta } from './Storage';

////////////////////////////////////////

export const handledGroupings = ['state', 'priority', 'id'] as const;
export type GroupByType = (typeof handledGroupings)[number];

export const handledOrder = ['asc', 'desc'] as const;
export type Order = (typeof handledOrder)[number];

////////////////////////////////////////

type RetrieveTaskCallback = {
  task: Task;
  taskIndex: number;
  parentTask: Task;
};

////////////////////////////////////////

export class TaskList extends Array<Task> {
  allIDs: number[];
  availableStatesNames: string[];

  //////////

  constructor(items?: ITask[], meta?: Meta) {
    super();

    this.allIDs = [];
    this.availableStatesNames = [];

    if (meta) {
      this.availableStatesNames = meta.states.map((state) => state.name);
    }

    if (items) {
      this.push(
        ...items.map((item) => {
          const task = new Task(item);

          if (meta) {
            const doesStateExists = this.availableStatesNames.includes(task.state);

            if (!doesStateExists) {
              throw new TaskStateUnknownError(task.id, task.state);
            }
          }

          return task;
        }),
      );
    }
  }

  //////////

  /** @see: https://stackoverflow.com/questions/49349195/using-splice-method-in-subclass-of-array-in-javascript -> Exact same problem */
  private remove = (task: Task) => {
    const idIndex = this.allIDs.findIndex((anId) => anId === task.id);
    this.allIDs.splice(idIndex, 1);

    let index = this.indexOf(task);

    if (index > -1) {
      const newLength = this.length - 1;
      while (index < newLength) {
        this[index] = this[index + 1];
        ++index;
      }
      this.length = newLength;

      return [task];
    }
    return [];
  };

  //////////

  /** @override */
  push = (...tasks: Task[]) => {
    tasks.forEach((task: Task) => {
      const containedIDS = task.straightTask().map((within) => within.id);

      containedIDS.forEach((id) => {
        if (this.allIDs.includes(id)) throw new TaskIdDuplicatedError(id);
        else this.allIDs.push(id);
      });

      super.push(task);
    });

    return this.length;
  };

  addTask = (task: Task, subTaskOf?: number) => {
    const createUniqueId = () => {
      const maxInArray = Math.max(...this.allIDs);

      if (maxInArray === this.allIDs.length - 1) return this.allIDs.length;
      else {
        let id = 0;

        while (this.allIDs.includes(id)) id++;

        return id;
      }
    };

    const taskID = task.id && !this.allIDs.includes(task.id) ? task.id : createUniqueId();

    task.id = taskID;
    task.timestamp = moment().format(TIMESTAMP_FORMAT);

    const doesStateExists = this.availableStatesNames.includes(task.state);

    if (!doesStateExists) {
      throw new TaskStateUnknownError(task.id, task.state);
    }

    if (subTaskOf !== undefined) {
      this.retrieveTask(subTaskOf, ({ task: parent }) => {
        if (parent.subtasks === undefined) parent.subtasks = [task];
        else parent.subtasks = [...parent.subtasks, task];

        this.allIDs.push(taskID);
      });
    } else this.push(task);

    return taskID;
  };

  editTask = (tasksID: number[], newAttributes: ITask, isRecurive?: boolean) => {
    tasksID.forEach((id) => {
      this.retrieveTask(id, ({ task }) => {
        const doesStateExists = this.availableStatesNames.includes(newAttributes.state || task.state);

        if (!doesStateExists) {
          throw new TaskStateUnknownError(task.id, newAttributes.state);
        }

        const impactedTasks = isRecurive ? task.straightTask() : [task];

        for (const [k, v] of Object.entries(newAttributes)) impactedTasks.forEach((aTask) => (aTask[k] = v));
      });
    });

    return tasksID;
  };

  incrementTask = (tasksID: number[], isRecurive?: boolean) => {
    const handleIncrement = (task: Task) => {
      const currentStateIndex = this.availableStatesNames.indexOf(task.state);

      if (currentStateIndex === -1) throw new TaskStateUnknownError(task.id, task.state);

      if (currentStateIndex !== this.availableStatesNames.length - 1)
        this.editTask([task.id], { state: this.availableStatesNames[currentStateIndex + 1] }, isRecurive);
      else throw new NoFurtherStateError(task.id);
    };

    tasksID.forEach((id) => {
      this.retrieveTask(id, ({ task }) => {
        handleIncrement(task);
      });
    });

    return tasksID;
  };

  deleteTask = (tasksID: number[]) => {
    tasksID.forEach((id) => {
      let wasTaskFound = false;

      // @see: https://stackoverflow.com/questions/43612046/how-to-update-value-of-nested-array-of-objects
      this.forEach((task) => {
        if (task.id === id) {
          wasTaskFound = true;

          this.remove(task);
        } else {
          if (Array.isArray(task.subtasks) && task.subtasks.length !== 0) {
            const iter = (sub: Task, subIndex: number) => {
              if (sub.id === id) {
                wasTaskFound = true;

                task.subtasks.splice(subIndex, 1);
              } else if (Array.isArray(sub.subtasks) && sub.subtasks.length !== 0) sub.subtasks.forEach(iter);
            };

            task.subtasks.forEach(iter);
          }
        }
      });

      if (!wasTaskFound) throw new TaskNotFoundError(id);
    });

    return tasksID;
  };

  moveTask = (tasksID: number[], subTaskOf: number) => {
    tasksID.forEach((id) =>
      this.retrieveTask(id, ({ task }) => {
        this.deleteTask([id]);

        this.addTask(task, subTaskOf);
      }),
    );

    return tasksID;
  };

  /**
   * Use recursion to return a single task given id within any boards and any subtask
   *
   * @throws {TaskNotFoundError}
   */
  retrieveTask = (taskID: number, callback: (cbParams: RetrieveTaskCallback) => void) => {
    let wasTaskFound = false;
    let parentTask = undefined;

    const iter = (task: Task, taskIndex: number) => {
      if (task.id === taskID) {
        wasTaskFound = true;

        return callback({ task, taskIndex, parentTask });
      } else {
        if (Array.isArray(task.subtasks)) {
          parentTask = task;
          task.subtasks.forEach(iter);
        } else parentTask = undefined;
      }
    };

    // @see: https://stackoverflow.com/questions/43612046/how-to-update-value-of-nested-array-of-objects
    this.forEach(iter);

    if (!wasTaskFound) throw new TaskNotFoundError(taskID);
  };

  /**
   * Use recursion to return all tasks matching value
   */
  search = <K extends keyof Task>(taskAttribute: K, value: any) => {
    const tasks: Task[] = [];

    this.forEach((task) => {
      const within = task.straightTask();

      within.forEach((withinTask) => {
        if (withinTask[taskAttribute] === value) tasks.push(withinTask);
      });
    });

    return tasks;
  };

  /**
   * Use recursion to return a count of every tasks and subtasks included in list
   */
  countTaskAndSub = () => {
    let count = 0;

    // @see: https://stackoverflow.com/questions/43612046/how-to-update-value-of-nested-array-of-objects
    this.forEach(function iter(task) {
      count++;

      Array.isArray(task.subtasks) && task.subtasks.forEach(iter);
    });

    return count;
  };

  getStats = (meta: Meta): string => {
    let toReturn = '';
    const totalCount = this.countTaskAndSub();

    const { states } = meta;

    states.forEach((state, index) => {
      const count = this.search('state', state.name).length;
      const _percent = (count / totalCount) * 100;
      const percent = isNaN(_percent) ? 0 : _percent;

      if (index !== 0 && index !== states.length) toReturn += ' ► ';

      const text = `${count} ${state.name} (${percent.toFixed(0)}%)`;

      toReturn += chalk.hex(state.hexColor)(text);
    });

    toReturn += ` ❯ ${totalCount}`;

    return toReturn;
  };

  group = (groupBy: GroupByType, meta: Meta) => {
    /**
     * a < b = -1 \
     * a > b = 1 \
     * a == b = 0
     * */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let sortFunction = (a: Task, b: Task) => 0;

    switch (groupBy) {
      case 'state': {
        const stateNames = meta.states.map((state) => state.name);

        sortFunction = (a: Task, b: Task) => {
          if (a.state === b.state) return 0;

          return stateNames.indexOf(a.state) < stateNames.indexOf(b.state) ? -1 : 1;
        };

        break;
      }

      //////////

      case 'priority': {
        sortFunction = (a: Task, b: Task) => {
          if (a.priority !== undefined && b.priority !== undefined) {
            if (a.priority === b.priority) return 0;

            return a.priority < b.priority ? -1 : 1;
          } else {
            if (a.priority === undefined && b.priority !== undefined) return -1;
            else if (a.priority !== undefined && b.priority === undefined) return 1;
            else return 0;
          }
        };

        break;
      }

      //////////

      case 'id': {
        sortFunction = (a: Task, b: Task) => {
          if (a.id === b.id) throw new Error('Impossible case : A task id should be unique');

          return a.id < b.id ? -1 : 1;
        };

        break;
      }
    }

    this.sort(sortFunction);
  };
}
