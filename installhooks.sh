#!/bin/bash

# Determine the current directory where this script is located (where the script is being run)
SCRIPT_DIR="$(pwd)/gitscripts"  # This is where the Git hooks will be stored

# Ensure the script is executable
chmod +x "$0"  # Make the script itself executable

# Check if the directory exists, and if not, clone the hooks repo
if [ ! -d "$SCRIPT_DIR" ]; then
    echo "Git hooks directory not found, cloning repository..."
    git clone "https://github.com/vykanand/gitscripts-d2" "$SCRIPT_DIR"
else
    echo "Git hooks directory found, pulling the latest changes..."
    cd "$SCRIPT_DIR"
    git pull origin main  # Or the appropriate branch
fi

# Now, since hooks are in the parent directory, we need to reference the correct location
HOOKS_SUB_DIR="$(pwd)"  # The parent directory now contains the git hooks directly

# Verify the cloned repo structure
echo "Checking contents of $HOOKS_SUB_DIR"
ls -l "$HOOKS_SUB_DIR"  # To verify where the hook scripts are located

# Ensure that the hooks directory exists (parent directory now contains the hooks)
if [ ! -d "$HOOKS_SUB_DIR" ]; then
    echo "Error: Git hooks directory does not exist in $SCRIPT_DIR"
    echo "Git hooks setup failed."
    exit 1  # Exit since critical directory is missing
fi

# Ensure that all hook scripts are executable
chmod -R +x "$HOOKS_SUB_DIR"

# Set the global git hooks path to the correct location (now point to parent directory)
git config --global core.hooksPath "$HOOKS_SUB_DIR"

# Install or check cron job for automatic update of git hooks
CRON_JOB_NAME="git-hooks-update-d2"
CRON_SCHEDULE="30 13 * * *"  # Run every day at 1:30 PM
CRON_COMMENT="# git-hooks-update-d2"  # Unique comment to identify this cron job

# Check if the cron job with the unique comment exists in the current crontab
if crontab -l | grep -q "$CRON_COMMENT"; then
    echo "Updating existing cron job..."
    # Replace the existing cron job with the new one (preserving other cron jobs)
    crontab -l | grep -v "$CRON_COMMENT" | (cat; echo "$CRON_SCHEDULE $SCRIPT_DIR/cron-script.sh $CRON_COMMENT") | crontab -
    echo "Existing cron job updated."
else
    echo "No existing cron job found. Adding new cron job..."
    # Add the new cron job with the unique comment
    (crontab -l 2>/dev/null; echo "$CRON_SCHEDULE $SCRIPT_DIR/cron-script.sh $CRON_COMMENT") | crontab -
    echo "New cron job added."
fi

# Run the custom script located in the gitscripts folder
CUSTOM_SCRIPT="$SCRIPT_DIR/custom-script.sh"

# Check if custom-script.sh exists
if [ -f "$CUSTOM_SCRIPT" ]; then
    echo "Running custom script..."
    chmod +x "$CUSTOM_SCRIPT"  # Make sure it's executable
    "$CUSTOM_SCRIPT"  # Run the custom script
    echo "Custom custom script executed."
else
    echo "Custom custom script not found at $CUSTOM_SCRIPT. Skipping..."
fi

echo "Git hooks setup is complete and cron job has been updated!"

