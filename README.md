# CLI Manager

Providing an easy and usefull Command Line Interface for managing tasks on the fly

Will store inside a local file your tasks in a simple format so you can track them using version control.

---

# Table of content

- [Installation](#installation)
- [Use](#use)
	- [Init](#init)
	- [Files](#files)
		- [The config file](#the-config-file)
		- [The storage file](#the-storage-file)
- [Commands](#commands)
	- [Printing arguments](#printing-arguments)
	- [Task](#task)
- [Intended workflow](#intended-workflow)

---

# Installation

Requires [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

```sh
npm i -g # TODO

task --version # Print installed version
task --help # Print the manuel
```

---

# Use

## Init

```sh
task init	# Will generate task.config.json and tasks.json under working directory
task init --storage <relative path> --config <relative path> # Will generate both file where you want
task init --storage <relative path> # Will just generate a new storage file
```

### Files

After an _init_, will be created two files:

- `task.config.json or the name you want`, the configuration file
- `tasks.json or the name you want`, the storage file

#### The config file

By default named `task.config.json` in your working directory, he defines your custom states and default argument to provide for the CLI.

> If your config file is different than the default `task.config.json` under your current working directory, you will have to pass the _config_ argument for every CLI commands

```sh
--config <relative path> # Use or create a specific config file
```

_defaultArgs_:

An object defining default behaviour, such as [printing options](#printing-arguments)

_Example:_
```json
{
	"hideDescription": true,
	"hideTimestamp": true,
	"hideSubCounter": true,
	"hideTree": true,
	"shouldNotPrintAfter": false,
	"hideCompleted": true,

	"depth" : 3,

	"storageFile": "./tasks/v0.1.0.json",
}
```

_states_:

An array of `ordered` objects that defined task state progression

_Example:_
```json
{
	"states": [
		{
			"name": "todo",
			"hexColor": "#ff8f00",
			"icon": "☐"
		},
		{
			"name": "wip",
			"hexColor": "#ab47bc",
			"icon": "✹"
		},
		{
			"name": "to test",
			"hexColor": "#2196f3",
			"icon": "♦"
		},
		{
			"name": "done",
			"hexColor": "#66bb6a",
			"icon": "✔"
		}
	],
}
```
#### The storage file

By default named `tasks.json` in your working directory, he stores your tasks

> If your storage file is different than the default `tasks.json`, you either have to pass the _storage_ argument for every CLI commands
> or use the _storageFile_ attribute in the _defaultArgs_ of the [config file](#the-config-file)

```sh
--storage <relative path> # Use or create a specific storage file
```

_Example:_
```json
[
	{
		"name": "Add more stuff",
		"description": "There's a lot of things to do",
		"state": "todo",
		"id": 0,
	}
]
```

> CLI commands are ment to use the config file to modify your tasks but you can manually edit them if you want !

## Commands

You can use the _help_ flag if you want a quick reminder of the CLI commands

_Example:_
```sh
task --help # Full manuel
task a --help # Print help for adding task
```

### Printing arguments

Can either be passed as CLI arguments or stored in the `defaultArgs` object in the config file

```sh
--depth n	# Every tasks and also n levels of subtasks
--hide-description		# No descriptions
--hide-tree		# No tree branches
--hide-timestamp	# No timestamp
--hide-sub-counter	# No subtask counter in parent task
--no-print	# Don't print tasks after an action
--group <state, priority, tag, deadline, load, linked> # Recursively group by attribute
```

### Task

```sh
# Adding tasks
task a	# Create a new task with interactive prompt
task a 'refactor logs'	# Create a task 'refactor logs'
task a 'better interface' '!!'	# Create 1 task 'better interface' with a priority of 2
task a 'long task' -d 'Some description'	# Create a task with a Description
task a 'a statefull task' -s 'to test'	# Create a task with the State 'to test'
task a 12 'first sub task'	# Add sub-task to the task n° 12

# View specific
task 9	# Print only what's in task n°9
task 9,13	# Print details on what's in task n°9 and 13

# Editing tasks
task e 9	# Edit taks attributes with interactive prompt
task e 9 'renaming the task' -s 'wip'	# Rename task n°9 and change its state
task e 9,7,2 -s 'to test'	# Change state to 'done'
task c 7	# Put task to final state, 'Check'
task i 11,14	# Pass tasks 11 and 14 to next state, "Increment"
task i 11,14 -r	# Pass tasks 11 and 14 and their subtasks to next state, "Increment"

# Moving tasks
task mv 9,7,11 3	# Move multiple tasks and subtasks to task as subtasks (maintining tree structure)

# Deleting tasks
task d 9,7,11	# Delting tasks 9, 7 and 11

# Extracting to new file
task x 9,7,11 newFile.json	# Move tasks 9, 7 and 11 to a new storage file ./newFile.json
```

# Intended Workflow

Start by a simple `task init` at the root of your project

Create and manage your tasks and subtasks with CLI or direct file edition

If you feel like you should break down your storage file as it become to crowded, cut out some of the tasks into a new storage file, and change the default storage path in your config file

Keep track of stuff you need to do using VCS

You may want to create a _tasks_ folder where you could add a new storage file for every release with `task init --storage ./tasks/v1.json`, with version control, it could act as a changelog for instance