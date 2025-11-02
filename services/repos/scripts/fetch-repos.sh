#!/usr/bin/env bash

set -euo pipefail

for repo_path in repos/*; do
    if [[ -d "$repo_path" ]]; then
        repo_name=$(basename "$repo_path" .git)
        echo "Fetching $repo_name"
        git -C "$repo_path" fetch --tags --prune origin
        sleep 5
    fi
done
