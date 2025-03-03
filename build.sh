#!/bin/bash
echo "Building Next.js application..."
NODE_OPTIONS="--max-old-space-size=4096" ./node_modules/.bin/next build
