#!/bin/bash

# Parent directory where multiple repos are located
PARENT_DIR=$(pwd)

# Path to the gitscripts folder (relative to the installer script)
GITSCRIPTS_DIR="$PARENT_DIR/gitscripts"

# Function to copy files from the gitscripts folder to a repository's .git/hooks
setup_git_hooks() {
    local repo_path="$1"
    local hook_dir="$repo_path/.git/hooks"

    # Check if the gitscripts directory exists
    if [ ! -d "$GITSCRIPTS_DIR" ]; then
        echo "Error: gitscripts directory not found in $PARENT_DIR"
        exit 1
    fi

    # Copy all files from gitscripts to the .git/hooks directory of the repo
    echo "Copying scripts from $GITSCRIPTS_DIR to $hook_dir"
    cp -r "$GITSCRIPTS_DIR"/* "$hook_dir"

    # Make all copied hook scripts executable
    chmod +x "$hook_dir"/*

    echo "Git hooks have been set up in $repo_path"
}

# Loop through all directories in the parent directory
for repo in "$PARENT_DIR"/*; do
    if [ -d "$repo/.git" ]; then  # Check if it's a Git repository
        echo "Setting up git hooks in $repo"
        setup_git_hooks "$repo"
    fi
done

echo "Finished installing/updating gitops scripts."

