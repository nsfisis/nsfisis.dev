#!/usr/bin/env bash

set -euo pipefail

for repo_path in repos/*; do
    if [[ -d "$repo_path" ]]; then
        repo_name=$(basename "$repo_path" .git)
        echo "Fetching $repo_name"
        git -C "$repo_path" fetch --tags --prune origin

        # Update agefile.
        mkdir -p "$repo_path/info/web"
        git -C "$repo_path" for-each-ref \
            --sort=-committerdate \
            --format='%(committerdate:format:%Y-%m-%d %H:%M:%S %z)' \
            refs/ \
        | head -1 > "$repo_path/info/web/last-modified"
    fi
done
