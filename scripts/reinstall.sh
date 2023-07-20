#!/usr/bin/env bash

set -Eeuo pipefail

cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
cd ..

rm -rf pnpm-lock.yaml node_modules app/*/{node_modules,pnpm-lock.yaml,lib,temp}

if [[ $* == *" -u"* ]]; then
	pnpm -r i
else
	pnpm -r up
fi
