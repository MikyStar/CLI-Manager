import prompts from 'prompts';
import chalk from 'chalk';

import { Storage } from './Storage';
import { Task } from './Task';

////////////////////////////////////////

export class Prompt {
  static addTask = async (storage: Storage, subTaskOfId?: number): Promise<number> => {
    try {
      const { name, state, description } = await doPrompt(storage);

      const task: Task = new Task({
        name: name.trim(),
        state,
        description: description.trim(),
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

      console.log(
        chalk.italic('Press tab to edit previously set text, start typing for a new value or use space to remove it\n'),
      );

      const { name, state, description } = await doPrompt(storage, beforeTask);

      const afterTask: Task = new Task({
        name: name.trim(),
        state: state,
        description: description.trim(),
      });

      storage.editTask([taskId], afterTask);
    } catch (err) {
      console.warn('No task edited', err);
    }
  };
}

////////////////////////////////////////

const getStateChoices = (storage: Storage) => {
  return storage.meta.states.map(({ name }) => ({ title: name, value: name }));
};

const doPrompt = async (storage: Storage, task?: Task): Promise<prompts.Answers<Partial<keyof Task>>> => {
  const availableStates = getStateChoices(storage);

  ////////

  const textQuestion: prompts.PromptObject<keyof Task> = {
    type: 'text',
    name: 'name',
    message: 'Task name',
  };

  const stateQuestion: prompts.PromptObject<keyof Task> = {
    type: 'select',
    name: 'state',
    message: 'State',
    choices: availableStates,
  };

  const descriptionQuestion: prompts.PromptObject<keyof Task> = {
    type: 'text',
    name: 'description',
    message: 'Description',
  };

  ////////

  if (task) {
    textQuestion.initial = task.name;

    const indexOfChosenState = availableStates.findIndex(({ value }) => value === task.state);
    stateQuestion.initial = indexOfChosenState;

    descriptionQuestion.initial = task.description;
  }

  ////////

  return prompts([textQuestion, stateQuestion, descriptionQuestion]);
};
