#!/usr/bin/env bash

set -exo pipefail

UDID=$(system_profiler SPUSBDataType | sed -n -E -e '/(iPhone|iPad)/,/Serial/s/ *Serial Number: *(.+)/\1/p')
PORT=12345

RESOLUTION="512x683"

./build/ios_minicap \
    --udid $UDID \
    --port $PORT \
    --resolution $RESOLUTION
