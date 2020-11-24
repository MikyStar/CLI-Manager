# CLI Manager

## Installation

```sh
npm i && npm start
```

-----

## Use

### Init

```sh
# Init a Task Manager
task init											# Create the config file on working directory
```

### Board

```sh
# Creating a board 
task b @mBoard										# Create a board '@mBoard'

```

### Task

```sh
# Adding tasks
task a refactor logs								# Create 1 task 'refactor logs' to default board
task a @mBoard do something							# Create 1 task 'do something' on board @mBoard
task a @mBoard 'do something' 'do other thing'		# Create 2 tasks 'do something' and 'do other thing' on board @mBoard
task a @mBoard 'dependecy task' -d [11,13]			# Create a task that depends on tasks id n° 11 and 13
task a 'a statefull task' -s wip					# Create a task with the state 'wip'
```
