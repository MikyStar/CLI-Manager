# CLI Manager

Providing an easy and usefull Command Line Interface for managing tasks on the fly

Will store inside a local file your tasks and boards in a simple format so you can track them using version control.

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
	- [Board](#board)
	- [Task](#task)
- [Intended workflow](#intended-workflow)

---

# Installation

Requires [NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

```sh
npm i -g # TODO
```

---

# Use

## Init

```sh
task init	# Will generate task.config.json and tasks.json under working directory
task init --storage <relative path> --config <relative path> # Will generate both file where you want
task init --storage <relative path> # Will generate a new storage file
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

An object defining default behaviour, such as [printing options](#printing-arguments) or default board to use

_Example:_
```json
{
	"defaultArgs": {
		"hideDescription": true,
		"hideTimestamp": true,
		"hideSubCounter": true,
		"hideTree": true,
		"printAfter": true,

		"depth" : 3,

		"storageFile": "./tasks/v0.1.0.json",
		"board": "backlog"
	}
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

By default named `tasks.json` in your working directory, he stores your tasks and boards

> If your storage file is different than the default `tasks.json`, you either have to pass the _storage_ argument for every CLI commands 
> or use the _storageFile_ attribute in the _defaultArgs_ of the [config file](#the-config-file)

```sh
--storage <relative path> # Use or create a specific storage file
```

_Example:_
```json
[
		{
			"name": "backlog",
			"description": "Where everything belongs",
			"tasks": [
				{
					"name": "Add more stuff",
					"description": "There's a lot of things to do",
					"state": "todo",
					"id": 0,
				}
			]
		}
]
```

> CLI commands are ment to use the config file to modify your tasks and boards but you can manually edit them if you want !

## Commands

### Printing arguments

Can either be passed as CLI arguments or stored in the `defaultArgs` object in the config file

```sh
--depth n	# Every tasks and also n levels of subtasks
--hide-description		# No descriptions
--hide-tree		# No tree branches
--hide-timestamp	# No timestamp
--hide-sub-counter	# No subtask counter in parent task
--print	# Print tasks after edition
```

### Board

```sh
# Creating a board 
task b mBoard	# Create a board '@mBoard'
task b mBoard -d 'My board'	# Create with description 

# Viewing
task	# Print every tasks accross all local boards
task @mBoard	# Print all tasks of a board

# Editing a board
task @mBoard -d 'Our board'	# Change board description
task rn @previousName newName	# Renaming
task d @mBoard	# Delete a board, will ask confirmation for all the tasks inside
task clean @mBoard	# Remove all task in board @mBoard which are at final state

# Extracting
task x @board1 @board2 relative path	# Create a new storage file from one or multiple boards, "Extract"
```

### Task

```sh
# Adding tasks
task a	# Create a new task with interactive prompt
task a 'refactor logs'	# Create 1 task 'refactor logs' to default board ( first one )
task a @mBoard 'do something'	# Create 1 task 'do something' on board @mBoard
task a 'dependecy task' -l 11,13	# Create a task on board in the args of file that's Linked to tasks id n° 11 and 13
task a @mBoard 'long task' -d 'Some description'	# Create a task with a Description
task a 'a statefull task' -s 'to test'	# Create a task with the State 'to test'
task a 12 'first sub task'	# Add sub-task to the task n° 12

# View specific
task 9	# Print only what's in task n°9
task 9,13	# Print details on what's in task n°9 and 13

# Editing tasks
task e 9	# Edit taks attributes with interactive prompt
task e 9 'renaming the task' -s 'wip'	# Rename task n°9 and change its state
task 9,7,2 -s 'to test'	# Change state to 'done'
task c 7	# Put task to final state, 'Check'
task i 11,14	# Pass tasks 11 and 14 to next state, "Increment"
task i 11,14 -r	# Pass tasks 11 and 14 and their subtasks to next state, "Increment"

# Moving tasks
task mv 9 -d 'A brand new board'	# Make a new board out of a task subtasks and give a description
task mv 9 @otherBoard	# Move task and subtasks to board
task mv 9,7,11 @otherBoard	# Move multiple tasks and subtasks to board
task mv 9,7,11 3	# Move multiple tasks and subtasks to task as subtasks (maintining tree structure)
```

# Intended Workflow

Start by a simple `task init` at the root of your project

Create and manage your boards, tasks and subtasks with CLI or direct file edition

If you feel like you should break down your storage file as it become to crowded, extract some of its boards into a new storage file, and change the default storage path in your config file

Keep track of stuff you need to do using VCS

You may want to create a _tasks_ folder where you could add a new storage file for every release, with version control, it could act as a changelog for instance