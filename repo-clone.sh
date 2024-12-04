#!/bin/bash

# run this script with source repo-clone.sh

# Check if the script is being sourced (not executed directly)
if [[ "${BASH_SOURCE[0]}" != "${0}" ]]; then
  # The script is sourced, do nothing
  echo "Script is sourced, continuing..."
else
  # The script is executed directly, check if it is executable
  if [ ! -x "$0" ]; then
    chmod +x "$0"
    echo "Permissions updated. Please re-run the script."
    return 0  # Don't exit, just return to avoid terminating the shell
  fi
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

# ELS Related Repositories
git clone https://gitlab.niveussolutions.com/niveusprojects/darpan2.0/achievements-service
git clone https://gitlab.niveussolutions.com/niveusprojects/darpan2.0/darpan-bridge-service
git clone https://gitlab.niveussolutions.com/niveusprojects/darpan2.0/darpan-certifications-service
git clone https://gitlab.niveussolutions.com/niveusprojects/darpan2.0/darpan-common-service
git clone https://gitlab.niveussolutions.com/niveusprojects/darpan2.0/darpan-performance-service
git clone https://gitlab.niveussolutions.com/niveusprojects/darpan2.0/darpan-roles-service
git clone https://gitlab.niveussolutions.com/niveusprojects/darpan2.0/darpan-user-roles-service
git clone https://gitlab.niveussolutions.com/niveusprojects/darpan2.0/darpan_cron_services
git clone https://gitlab.niveussolutions.com/niveusprojects/darpan2.0/integration-service
git clone https://gitlab.niveussolutions.com/niveusprojects/darpan2.0/darpan-skills-service
git clone https://gitlab.niveussolutions.com/niveusprojects/darpan2.0/darpan-project-management-service

# Sales to Delivery Related Repositories
git clone https://gitlab.niveussolutions.com/niveusprojects/darpan2.0/darpan-deal-transition-service/
git clone https://gitlab.niveussolutions.com/niveusprojects/darpan2.0/darpan-master-service/activity

# Frontend Related Repository
git clone https://gitlab.niveussolutions.com/niveusprojects/darpan2.0/darpan-frontend-web/

# Set permissions for all the cloned repositories
set_permissions achievements-service darpan-bridge-service darpan-certifications-service darpan-common-service darpan-performance-service darpan-roles-service darpan-user-roles-service darpan_cron_services integration-service darpan-skills-service darpan-project-management-service darpan-deal-transition-service darpan-master-service darpan-frontend-web

echo "All repositories have been cloned and permissions set successfully!"

