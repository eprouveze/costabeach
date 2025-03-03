#!/bin/bash
echo "Starting Next.js development server..."
NODE_OPTIONS="--max-old-space-size=4096" ./node_modules/.bin/next dev
