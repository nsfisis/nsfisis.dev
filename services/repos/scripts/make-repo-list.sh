#!/usr/bin/env bash

set -euo pipefail

cat < /dev/null > repos.cgitrc
for repo in $(gh repo list --limit 999 --source --visibility public --json name --jq '.[].name' | sort -f); do
    cat >> repos.cgitrc <<EOS
repo.url=${repo}
repo.path=/src/${repo}.git
repo.name=${repo}
repo.desc=${repo}
repo.owner=nsfisis
repo.homepage=https://github.com/nsfisis/${repo}

EOS
done
