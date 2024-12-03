#!/bin/bash

# Parent directory where multiple repos are located
PARENT_DIR=$(pwd)

# The commit-msg hook script content
COMMIT_MSG_SCRIPT="#! /bin/sh

# Get the previous commit message
previous_commit_message=\$(git log -1 --pretty=%B)

# Get the current commit message (passed as argument)
current_commit_message=\$(cat \"\$1\")

# Check if the current commit message matches the previous commit message
if [ \"\$previous_commit_message\" = \"\$current_commit_message\" ]; then
    echo \"Error: Duplicate commit message detected!\"
    echo \"Please write a unique commit message.\"
    exit 1  # This will prevent the commit
fi

exit 0  # Allow the commit to proceed
"

# Function to copy the hook script to a repository's .git/hooks/commit-msg
setup_commit_hook() {
    local repo_path="$1"
    local hook_path="$repo_path/.git/hooks/commit-msg"

    # Create the commit-msg hook script and write the content to it
    echo "$COMMIT_MSG_SCRIPT" > "$hook_path"

    # Make the commit-msg hook script executable
    chmod +x "$hook_path"

    echo "commit-msg hook has been set up in $repo_path"
}

# Loop through all directories in the parent directory
for repo in "$PARENT_DIR"/*; do
    if [ -d "$repo/.git" ]; then  # Check if it's a Git repository
        echo "Setting up commit-msg hook in $repo"
        setup_commit_hook "$repo"
    fi
done

echo "Finished setting up commit-msg hooks in all repositories."

