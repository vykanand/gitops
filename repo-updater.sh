#!/bin/bash

# Ensure the script is executable
if [ ! -x "$0" ]; then
  chmod +x "$0"
  echo "Permissions updated. Please re-run the script."
  exit 0
fi

# Function to set permissions on cloned directories
set_permissions() {
  for dir in "$@"; do
    if [ -d "$dir" ]; then
      echo "Setting permissions for $dir"
      chmod -R u+rwX,go+rwX "$dir"  # Recursive read/write/execute for user, read/write for group/others
    fi
  done
}

# Function to clone repos if they don't exist or fetch the latest code if they do
clone_or_update_repo() {
  local repo_url=$1
  local repo_name=$2

  if [ ! -d "$repo_name" ]; then
    echo "Cloning repository: $repo_name"
    git clone "$repo_url" || {
      echo "Failed to clone repository: $repo_name. Skipping..."
      return 1
    }
  else
    echo "Repository $repo_name already exists, fetching the latest code..."
    cd "$repo_name" || {
      echo "Failed to enter repository directory: $repo_name. Skipping..."
      return 1
    }
    
    # Fetch the default branch dynamically
    default_branch=$(git remote show origin | grep 'HEAD branch' | sed 's/.*: //')
    
    if [ -n "$default_branch" ]; then
      echo "Using default branch: $default_branch"
      git pull origin "$default_branch" || {
        echo "Failed to pull from repository: $repo_name. Skipping..."
        cd ..
        return 1
      }
    else
      echo "Error: Could not determine the default branch for $repo_name. Skipping update for this repository."
      cd ..
      return 1
    fi

    cd ..
  fi
}

# List of ELS related repositories
repo_urls=(
  "https://gitlab.niveussolutions.com/niveusprojects/darpan2.0/achievements-service"
  "https://gitlab.niveussolutions.com/niveusprojects/darpan2.0/darpan-bridge-service"
  "https://gitlab.niveussolutions.com/niveusprojects/darpan2.0/darpan-certifications-service"
  "https://gitlab.niveussolutions.com/niveusprojects/darpan2.0/darpan-common-service"
  "https://gitlab.niveussolutions.com/niveusprojects/darpan2.0/darpan-performance-service"
  "https://gitlab.niveussolutions.com/niveusprojects/darpan2.0/darpan-roles-service"
  "https://gitlab.niveussolutions.com/niveusprojects/darpan2.0/darpan-user-roles-service"
  "https://gitlab.niveussolutions.com/niveusprojects/darpan2.0/darpan_cron_services"
  "https://gitlab.niveussolutions.com/niveusprojects/darpan2.0/integration-service"
  "https://gitlab.niveussolutions.com/niveusprojects/darpan2.0/darpan-skills-service"
  "https://gitlab.niveussolutions.com/niveusprojects/darpan2.0/darpan-project-management-service"
)

# List of Sales to Delivery related repositories
repo_urls+=(
  "https://gitlab.niveussolutions.com/niveusprojects/darpan2.0/darpan-deal-transition-service/"
  "https://gitlab.niveussolutions.com/niveusprojects/darpan2.0/darpan-master-service/activity"
)

# Frontend Related Repository
repo_urls+=(
  "https://gitlab.niveussolutions.com/niveusprojects/darpan2.0/darpan-frontend-web/"
)

# Clone or update all repositories
success_count=0
failure_count=0

for repo_url in "${repo_urls[@]}"; do
  repo_name=$(basename "$repo_url" .git)
  clone_or_update_repo "$repo_url" "$repo_name"
  if [ $? -eq 0 ]; then
    success_count=$((success_count + 1))
  else
    failure_count=$((failure_count + 1))
  fi
done

# Set permissions for all the cloned repositories
set_permissions "${repo_urls[@]/%//}"

# Summary
echo ""
echo "Repo Update Completed!"
echo "======================"
echo "Repositories successfully updated or cloned: $success_count"
echo "Repositories with errors (not updated): $failure_count"

