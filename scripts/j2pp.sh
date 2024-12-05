#!/bin/bash
set -e

for filename in ./json/*; do cmd="jq . ${filename}"; $cmd >${filename/json/pp}; done


