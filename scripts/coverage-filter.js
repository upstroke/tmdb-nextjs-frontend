#!/usr/bin/env node
/**
 * Coverage Filter Script
 * 
 * Filters the Vitest/Istanbul coverage report to include ONLY:
 * - lib/**/*.js, lib/**/*.jsx
 * - app/api/**/*.js, app/api/**/*.jsx
 * 
 * This removes all other files (components, pages, configs, etc.) from the coverage report.
 * 
 * Usage: npm run test:coverage && node scripts/coverage-filter.js
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const COVERAGE_DIR = resolve(process.cwd(), 'coverage');
const COVERAGE_FILE = resolve(COVERAGE_DIR, 'coverage-final.json');

// Allowed paths for coverage (Unit-Test-relevant files only)
const ALLOWED_PATTERNS = [
  /^lib\/.*\.jsx?$/,
  /^app\/api\/.*\.jsx?$/,
];

function isAllowed(filePath) {
  // Normalize path separators for cross-platform compatibility
  const normalizedPath = filePath.replace(/\\/g, '/');
  return ALLOWED_PATTERNS.some(pattern => pattern.test(normalizedPath));
}

function filterCoverage() {
  if (!existsSync(COVERAGE_FILE)) {
    console.error('❌ coverage-final.json not found. Run tests with --coverage first.');
    process.exit(1);
  }

  const coverageData = JSON.parse(readFileSync(COVERAGE_FILE, 'utf-8'));
  const originalCount = Object.keys(coverageData).length;

  // Filter to only allowed paths
  const filteredData = {};
  for (const [filePath, coverage] of Object.entries(coverageData)) {
    if (isAllowed(filePath)) {
      filteredData[filePath] = coverage;
    }
  }

  const filteredCount = Object.keys(filteredData).length;
  const removedCount = originalCount - filteredCount;

  // Write filtered coverage
  writeFileSync(COVERAGE_FILE, JSON.stringify(filteredData, null, 2));

  console.log(`✅ Coverage filtered:`);
  console.log(`   Original files: ${originalCount}`);
  console.log(`   Filtered files: ${filteredCount}`);
  console.log(`   Removed files: ${removedCount}`);
  console.log(`   Output: ${COVERAGE_FILE}`);
}

filterCoverage();
