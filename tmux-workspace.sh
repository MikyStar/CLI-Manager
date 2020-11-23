#!/bin/sh

########################################
###############  Config  ###############
########################################

# Working directory, use $HOME for absolute path
path="."

# Format : session:window.pane

# Session
session="GTO-Back"

# Windows
main="$session:0"
git="$session:1"
front="$session:2"

# Panes
editor="$main.0"
term00="$main.1"
term01="$main.2"
term02="$main.3"

term10="$git.0"
term11="$git.1"

frontTerm="$front.0"

# Commands
edit="nvim"
comm00="npm start"
comm01="cd ../FRONT && npm start"
comm02="cd ../../AngleShootLive && ./dockerDeploy.sh"

comm10="gtree"
comm11="status"
comm12="git fetch --dry-run"

frontCommand="cd ../FRONT"

########################################
###############  Script  ###############
########################################

tmux has-session -t "$session" > /dev/null 2>&1

if [ ! $? != 0 ]; then # Already created
  tmux attach -t "$session" > /dev/null 2>&1
  exit 0
fi

###

cd "$path"

tmux new-session -d -s "$session"

###

tmux new-window -t $session -n "git"
tmux new-window -t $session -n "front"

tmux rename-window -t $main "main"

###

tmux split-window -t $main -v # YES, I know ... This is horrizontal
tmux split-window -t $main -h # YES, I know again ... This is vertical
tmux split-window -t $main -h # YES, I know again ... This is vertical

tmux split-window -t $git -h

###

tmux send-keys -t $editor $edit Enter

tmux send-keys -t $term00 "$comm00" C-L
tmux send-keys -t $term01 "$comm01" C-L
tmux send-keys -t $term02 "$comm02" C-L

tmux send-keys -t $term10 "$comm10" Enter
tmux send-keys -t $term11 "$comm11" Enter
tmux send-keys -t $term11 "$comm12" Enter

tmux send-keys -t $frontTerm "$frontCommand" Enter C-L

###

tmux select-window -t $main

tmux selectp -t 0

tmux resize-pane -D 15
tmux resize-pane -Z

###

tmux attach -t $session
