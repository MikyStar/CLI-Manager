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

# Seeing tasks
task												# Print every tasks accross all local boards
task --depth 2										# Print every tasks and also 2 levels of subtasks
```

### Board

```sh
# Creating a board 
task b @mBoard										# Create a board '@mBoard'

# Viewing a board
task @mBoard										# Print all tasks of a board

# Renaming a board
task rn @previousName @newName

# Delete a board
task d @mBoard										# Delete a board, will ask confirmation for all the tasks inside
```

### Task

```sh
# Adding tasks
task a												# Opens a new task creation template through the terminal editor (VIM default)
task a refactor logs								# Create 1 task 'refactor logs' to default board ( first one )
task a @mBoard do something							# Create 1 task 'do something' on board @mBoard
task a @mBoard 'do something' 'do other thing'		# Create 2 tasks 'do something' and 'do other thing' on board @mBoard
task a @mBoard 'dependecy task' -d [11,13]			# Create a task that depends on tasks id n° 11 and 13
task a 'a statefull task' -s wip					# Create a task with the state 'wip'
task a 12 'first sub task' 'an other'				# Add sub-task to the task n° 12

# View specific
task 9												# Print only what's in task n°9

# Editing tasks
task e 9 renaming the task							# Rename task n°9
task e 9 -s done									# Change status to 'done'

# Moving tasks
task mv 9 @otherBoard								# Change associated board
task mv [9,7,11] @otherBoard						# Move multiple tasks to board
```
