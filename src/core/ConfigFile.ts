export interface ConfigFile
{
	scripts : string[],
	datas : Board[],
	editor : string,
	states : string[], // todo, wip, done
	defaultBoard: string,
}

export interface Board
{
	name : string,
	tasks : Task[]
}

export interface Task
{
	name : string,
	id: string
	subtasks : Task[],
	dependencies : string[] // Tasks IDS
}

// TODO I got to work a lot with ids 
