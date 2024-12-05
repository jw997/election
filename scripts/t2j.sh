#!/bin/bash
set -e

for filename in ./txt/*; do cmd="tr --delete '\n\f'"; $cmd  <${filename} >${filename//txt/json}; done


