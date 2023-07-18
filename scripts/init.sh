#!/usr/bin/env bash

set -Eeuo pipefail

cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"

if [[ -e primereact-sass-theme ]]; then
	cd primereact-sass-theme
	git reset --hard
	git clean -ffdx
	git pull
else
	git clone https://github.com/primefaces/primereact-sass-theme.git
fi
