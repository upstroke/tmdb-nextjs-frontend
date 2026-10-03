#!/usr/bin/env bash
set -euo pipefail

BASE_BRANCH="${1:-main}"

git fetch --quiet origin "$BASE_BRANCH"
git diff --name-only "origin/$BASE_BRANCH"...HEAD
