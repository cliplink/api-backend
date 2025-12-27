#!/usr/bin/env bash
set -e

PACKAGE_JSON_PATH="$1"
TAG_PREFIX="$2"

current_version=$(node -p "require('$PACKAGE_JSON_PATH').version")
IFS='.' read -r major minor patch <<< "$current_version"

commit_msg=$(git log -1 --pretty=%B)

if echo "$commit_msg" | grep -qE 'from .*/feat/'; then
  minor=$((minor + 1))
  patch=0
elif echo "$commit_msg" | grep -qE 'from .*/fix/'; then
  patch=$((patch + 1))
else
  patch=$((patch + 1))
fi

new_version="$major.$minor.$patch"

echo "New version: $new_version"

node -e "
const fs = require('fs');
const pkg = require('$PACKAGE_JSON_PATH');
pkg.version = '$new_version';
fs.writeFileSync('$PACKAGE_JSON_PATH', JSON.stringify(pkg, null, 2));
"

git config user.name "github-actions"
git config user.email "github-actions@github.com"
git add "$PACKAGE_JSON_PATH"
git commit -m "chore: bump version to $new_version"

if [ -n "$TAG_PREFIX" ]; then
  git tag "${TAG_PREFIX}v$new_version"
  git push origin "${TAG_PREFIX}v$new_version"
fi

git push origin HEAD:main

echo "NEW_VERSION=$new_version" >> $GITHUB_ENV