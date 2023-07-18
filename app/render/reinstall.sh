#!/usr/bin/env bash

set -Eeuo pipefail

cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"

rm -rf pnpm-lock.yaml node_modules
pnpm i
