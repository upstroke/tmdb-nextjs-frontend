#!/usr/bin/env bash
set -euo pipefail

npm run lint
npm run test:unit
npm run test:component
npm run test:integration
npm run build
