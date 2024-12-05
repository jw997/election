#!/bin/bash
set -e

for filename in ./pdf/*; do cmd="pdftotext  -layout -nopgbrk ${filename} ${filename//pdf/txt}"; $cmd; done


