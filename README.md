# CLI Manager

Providing an easy and usefull Command Line Interface for managing tasks on the fly

Will store inside a local file both datas and configuration so you can track them using version control.

---
# Table of content

- [Installation](#installation)
- [Use](#use)
	- [Init](#init)
	- [The config file](#the-config-file)
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
task init	# Create the config file tasks.json on your current working directory
task init --file <location> # Create and name the conf file where you want
```

### The config file

After an _init_, will be created a file that will both store your datas and their configurations

If you're not providing a location through _--file \<location\>_ the config file will be created in your current working directory under the name `tasks.json`

> If your target file used to store is different than the default `tasks.json`, you need to pass the file argument for every CLI commands

```sh
--file <location> # Use a specific file
```

**Attributes**

In your config file, will be three main attributes

_defaultArgs_:

An array of strings that will be passed for every CLI command, _can be empty_

_Example:_
```json
{
	"defaultArgs": [ "--hide-desc", "-s", "wip" ]
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
			"hexColor": "#ff8f00"
		},
		{
			"name": "wip",
			"hexColor": "#ab47bc"
		},
		{
			"name": "to test",
			"hexColor": "#2196f3"
		},
		{
			"name": "done",
			"hexColor": "#66bb6a"
		}
	],
}

```
_boards_:

An array of object that stores your actual datas

_Example:_
```json
{
	"boards": [
		{
			"name": "backlog",
			"description": "Where everything belongs",
			"tasks": [
				{
					"name": "Add more stuff",
					"description": "There's a lot of things to do",
					"state": "todo",
					"id": 32,
				}
			]
		}
    ],
}
```

> CLI commands are ment to use both _defaultArgs_ and _states_ to modify the _boards_ attribute but you can manually edit it if you want !

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