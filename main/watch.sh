#!/bin/bash
# Auto-deploy on save — runs in Cursor terminal
# Requires: npm install -g chokidar-cli
# Run: bash watch.sh

echo "Watching for changes... (Ctrl+C to stop)"
npx chokidar-cli "index.html" -c "bash deploy.sh"
