import prompts from 'prompts';

import { Storage } from './Storage';
import { Task } from './Task';

////////////////////////////////////////

export namespace Prompt {
  export const addTask = async (storage: Storage) => {
    const parseToChoice = (str: string) => {
      return { title: str, value: str };
    };

    const stateChoices = [];
    storage.meta.states.forEach((state) => stateChoices.push(parseToChoice(state.name)));

    try {
      const inputs = await prompts([
        {
          type: 'text',
          name: 'name',
          message: 'Task name',
        },
        {
          type: 'select',
          name: 'state',
          message: 'State',
          choices: stateChoices,
        },
        {
          type: 'text',
          name: 'description',
          message: 'Description',
        },
      ]);

      const task: Task = new Task({
        name: inputs.name,
        state: inputs.state,
        description: inputs.description,
      });

      const id = storage.addTask(task);

      return id;
    } catch (error) {
      console.warn('No task added');
    }
  };
}
