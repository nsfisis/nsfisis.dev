#!/usr/bin/env bash

set -euo pipefail

for url in $(grep '^repo\.homepage=' repos.cgitrc | sed 's/^repo\.homepage=//'); do
    repo_name=$(basename "$url" .git)
    repo_path="repos/${repo_name}.git"

    if [[ -d "$repo_path" ]]; then
        echo "Skipping $repo_name"
    else
        echo "Cloning $repo_name from $url"
        git clone --mirror "$url" "$repo_path"
        sleep 5
    fi
done
