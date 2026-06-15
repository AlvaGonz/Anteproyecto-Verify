#!/bin/bash
node .agents/scripts/session-init.mjs
node .agents/scripts/registry.mjs
python .agents/scripts/post_task_loop.py --task "$1" --output "$2" --hook-mode "${3:-ci}"
