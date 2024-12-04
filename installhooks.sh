#!/bin/bash

# Determine the current directory where this script is located
SCRIPT_DIR="$(dirname "$(realpath "$0")")"  # Get absolute path of the script's directory

# Append gitscripts-d2 to the current directory
GITSCRIPTS_DIR="$SCRIPT_DIR/gitscripts-d2"

# Ensure the script is executable
chmod +x "$0"  # Make the script itself executable

# Check if the directory exists, and if not, clone the hooks repo
if [ ! -d "$GITSCRIPTS_DIR" ]; then
    echo "Git hooks directory not found, cloning repository..."
    git clone "https://github.com/vykanand/gitscripts-d2" "$GITSCRIPTS_DIR"
else
    echo "Git hooks directory found, pulling the latest changes..."

    # Ensure we're inside a valid Git repository before trying to pull
    if [ -d "$GITSCRIPTS_DIR/.git" ]; then
        cd "$GITSCRIPTS_DIR"
        git pull origin main  # Or the appropriate branch
    else
        echo "Error: $GITSCRIPTS_DIR is not a Git repository."
        exit 1  # Exit since it's not a Git repo
    fi
fi

# Ensure that the hooks directory exists
HOOKS_SUB_DIR="$GITSCRIPTS_DIR"  # The gitscripts directory contains the git hooks directly

# Ensure that all hook scripts are executable
echo "Making all hook scripts executable..."
for hook in "$HOOKS_SUB_DIR"/*; do
    if [ -f "$hook" ]; then  # Check if it's a regular file
        chmod +x "$hook"
        echo "Made executable: $hook"
    fi
done

# Set the global git hooks path to the correct location (pointing to gitscripts directory)
git config --global core.hooksPath "$HOOKS_SUB_DIR"

# Install or check cron job for automatic update of git hooks
CRON_JOB_NAME="git-hooks-update-d2"
CRON_SCHEDULE="30 13 * * *"  # Run every day at 1:30 PM
CRON_COMMENT="# git-hooks-update-d2"  # Unique comment to identify this cron job

# Check if the cron job with the unique comment exists in the current crontab
if crontab -l | grep -q "$CRON_COMMENT"; then
    echo "Updating existing cron job..."
    # Replace the existing cron job with the new one (preserving other cron jobs)
    crontab -l | grep -v "$CRON_COMMENT" | (cat; echo "$CRON_SCHEDULE $SCRIPT_DIR/installhooks.sh $CRON_COMMENT") | crontab -
    echo "Existing cron job updated."
else
    echo "No existing cron job found. Adding new cron job..."
    # Add the new cron job with the unique comment
    (crontab -l 2>/dev/null; echo "$CRON_SCHEDULE $SCRIPT_DIR/installhooks.sh $CRON_COMMENT") | crontab -
    echo "New cron job added."
fi

# To run the custom script located in the gitscripts folder (if exists)
CUSTOM_SCRIPT="$GITSCRIPTS_DIR/custom-script.sh"

# Check if custom-script.sh exists
if [ -f "$CUSTOM_SCRIPT" ]; then
    echo "Running custom script..."
    chmod +x "$CUSTOM_SCRIPT"  # Make sure it's executable
    "$CUSTOM_SCRIPT"  # Run the custom script
    echo "Custom script executed."
else
    echo "Custom script not found at $CUSTOM_SCRIPT. Skipping..."
fi

echo "Git hooks setup is complete and cron job has been updated!"

