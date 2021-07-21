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
task init --file <location> # Will generate task.config.json under working directory and the storage file at the name and location you want
```

### Files

After an _init_, will be created two files:
	- `task.config.json`, the configuration file
	- `tasks.json or the name you want`, the storage file

#### The config file

Named `task.config.json` in your working directory, he defines your custom states and default argument to provide for the CLI

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

> If your storage file is different than the default `tasks.json`, you either have to pass the file argument for every CLI commands 
> or use the _storageFile_ attribute in the _defaultArgs_ of the [config file](#the-config-file)

```sh
--file <location> # Use or create a specific file
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
--hide-desc		# No descriptions
--hide-tree		# No tree branches
--hide-timestamp	# No timestamp
--hide-sub-counter	# No subtask counter in parent task
```

### Board

```sh
# Creating a board 
task b mBoard	# Create a board '@mBoard'
task b mBoard -d 'My board'	# Create with description 

# Viewing
task  # Print every tasks accross all local boards
task @mBoard	# Print all tasks of a board

# Editing a board
task @mBoard	# Print all tasks of a board
task @mBoard -d 'Our board'	# Change board description
task rn @previousName newName # Renaming
task d @mBoard	# Delete a board, will ask confirmation for all the tasks inside
task clean @mBoard	# Remove all task in board @mBoard which are at final state
```

### Task

```sh
# Adding tasks
task a	# Create a new task with interactive prompt
task a 'refactor logs'	# Create 1 task 'refactor logs' to default board ( first one )
task a @mBoard 'do something'		# Create 1 task 'do something' on board @mBoard
task a 'dependecy task' -l 11,13		# Create a task on board in the args of file that's Linked to tasks id n° 11 and 13
task a @mBoard 'long task' -d 'Some description'	# Create a task with a Description
task a 'a statefull task' -s 'to test'	# Create a task with the State 'to test'
task a 12 'first sub task'	# Add sub-task to the task n° 12

# View specific
task 9	# Print only what's in task n°9
task 9,13	# Print details on what's in task n°9 and 13

# Editing tasks
task e 9	# Edit taks attributes with interactive prompt
task e 9 'renaming the task' -s 'wip'	# Rename task n°9 and change its state
task 9,7,2 -s 'to test'  	# Change state to 'done'
task c 7	# Put task to final state, 'Check'
task i 11,14	# Pass tasks 11 and 14 to next state, "Increment"
task i 11,14 -r	# Pass tasks 11 and 14 and their subtasks to next state, "Increment"
task x 11	# Make a new board out of a task subtasks, "Extract"
task x 11 newBoard	# Make a new board out of a task subtasks and rename the parent task, "Extract"

# Moving tasks
task mv 9		# Change associated board with interactive prompt
task mv 9 @otherBoard	# Change associated board
task mv 9,7,11 @otherBoard		# Move multiple tasks to board
```