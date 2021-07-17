# CLI Manager

## Installation

```sh
npm i && npm start
```

## Use

### Init

```sh
# Init a Task Manager
task init	# Create the config file on working directory

# Seeing tasks
task  # Print every tasks accross all local boards
task --depth 2  # Print every tasks and also 2 levels of subtasks
task --hide-desc  # Print every board but never task descriptions
task --file  # Use a specific file
```

### Board

```sh
# Creating a board 
task b mBoard	# Create a board '@mBoard'
task b mBoard otherBoard	# Create two boards

# Viewing a board
task @mBoard	# Print all tasks of a board

# Editing a board
task rn @previousName @newName
task d @mBoard	# Delete a board, will ask confirmation for all the tasks inside
```

### Task

```sh
# Adding tasks
task a	# Create a new task with interactive prompt
task a refactor logs	# Create 1 task 'refactor logs' to default board ( first one )
task a @mBoard do something		# Create 1 task 'do something' on board @mBoard
task a @mBoard 'do something' 'do other thing'	# Create 2 tasks 'do something' and 'do other thing' on board @mBoard
task a mBoard 'dependecy task' -l 11,13		# Create a task on default board that's Linked to tasks id n° 11 and 13
task a @mBoard 'long task' -d 'Some description'	# Create a task with a Description
task a 'a statefull task' -s 'to test'	# Create a task with the State 'to test'
task a 12 'first sub task' 'an other'	# Add sub-task to the task n° 12

# View specific
task 9	# Print only what's in task n°9
task 9,13	# Print details on what's in task n°9 and 13

# Editing tasks
task e 9	# Edit taks attributes with interactive prompt
task 9 renaming the task	# Rename task n°9
task 9,7,2 -s done  	# Change state to 'done'
task c 7	# Put task to final state, 'Check'
task i 11,14	# Pass tasks 11 and 14 to next state, "Increment"
task x 11	# Make a new board out of a task subtasks, "Extract"
task x 11 newBoard	# Make a new board out of a task subtasks and rename the parent task, "Extract"

# Moving tasks
task mv 9		# Change associated board with interactive prompt
task mv 9 @otherBoard	# Change associated board
task mv 9,7,11 @otherBoard		# Move multiple tasks to board
```
