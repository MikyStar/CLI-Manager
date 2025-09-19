import prompts from 'prompts';

import { Storage } from './Storage';
import { Task } from './Task';

////////////////////////////////////////

export class Prompt {
  static addTask = async (storage: Storage, subTaskOfId?: number): Promise<number> => {
    try {
      const { name, state, description } = await prompts([
        {
          type: 'text',
          name: 'name',
          message: 'Task name',
        },
        {
          type: 'select',
          name: 'state',
          message: 'State',
          choices: getStateChoices(storage),
        },
        {
          type: 'text',
          name: 'description',
          message: 'Description',
        },
      ]);

      const task: Task = new Task({
        name,
        state,
        description,
      });

      const id = storage.addTask(task, subTaskOfId);

      return id;
    } catch (err) {
      console.warn('No task added', err);
    }
  };

  static editTask = async (storage: Storage, taskId: number): Promise<void> => {
    try {
      let beforeTask: Task;
      storage.tasks.retrieveTask(taskId, async ({ task }) => {
        beforeTask = task;
      });

      const { name, state, description } = beforeTask;

      const availableStates = getStateChoices(storage);
      const indexOfChosenState = availableStates.findIndex(({ value }) => value === state);

      const inputs = await prompts([
        {
          type: 'text',
          name: 'name',
          message: 'Task name',
          initial: name,
        },
        {
          type: 'select',
          name: 'state',
          message: 'State',
          choices: availableStates,
          initial: indexOfChosenState,
        },
        {
          type: 'text',
          name: 'description',
          message: 'Description',
          initial: description,
        },
      ]);

      const afterTask: Task = new Task({
        name: inputs.name || name,
        state: inputs.state || state,
        description: inputs.description || description,
      });

      storage.editTask([taskId], afterTask);
    } catch (err) {
      console.warn('No task edited', err);
    }
  };
}

////////////////////////////////////////

const parseToChoice = (str: string) => {
  return { title: str, value: str };
};

const getStateChoices = (storage: Storage) => {
  return storage.meta.states.map((state) => parseToChoice(state.name));
};

// const doPrompt = async () => {
//   // TODO
// };
