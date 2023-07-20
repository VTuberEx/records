#!/usr/bin/env bash

set -Eeuo pipefail

cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"

git_download() {
	local NAME=$1 REPO=$2

	if [[ -e $NAME ]]; then
		pushd "$NAME" >/dev/null
		git reset --hard
		git clean -ffdx
		git pull
		popd >/dev/null
	else
		git clone --depth 20 --single-branch "$REPO"
	fi
}

git_download primereact-sass-theme https://github.com/primefaces/primereact-sass-theme.git
git_download prettier https://github.com/prettier/prettier.git
