#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const COVERAGE_DIR = resolve(process.cwd(), 'coverage');
const COVERAGE_FILE = resolve(COVERAGE_DIR, 'coverage-final.json');

function isAllowed(filePath) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  // Exclude lib/stores/ entirely (React-based, tested indirectly)
  if (normalizedPath.startsWith('lib/stores/')) {
    return false;
  }
  
  // Include only lib/ (except stores/) and app/api/
  if (normalizedPath.startsWith('lib/') && normalizedPath.match(/\.jsx?$/)) {
    return true;
  }
  if (normalizedPath.startsWith('app/api/') && normalizedPath.match(/\.jsx?$/)) {
    return true;
  }
  
  return false;
}

function calculateMetrics(coverage) {
  let statements = 0;
  let coveredStatements = 0;
  let branches = 0;
  let coveredBranches = 0;
  let functions = 0;
  let coveredFunctions = 0;
  let lines = 0;
  let coveredLines = 0;
  
  for (const fileData of Object.values(coverage)) {
    if (fileData.s) {
      const fileStatements = Object.values(fileData.s);
      statements += fileStatements.length;
      coveredStatements += fileStatements.filter(s => s > 0).length;
    }
    if (fileData.b) {
      for (const branchData of Object.values(fileData.b)) {
        branches += branchData.length;
        coveredBranches += branchData.filter(b => b > 0).length;
      }
    }
    if (fileData.f) {
      const fileFunctions = Object.values(fileData.f);
      functions += fileFunctions.length;
      coveredFunctions += fileFunctions.filter(f => f > 0).length;
    }
    if (fileData.fnMap) {
      // Functions already counted via fileData.f
    }
  }
  
  // Calculate line coverage from statement coverage
  coveredLines = coveredStatements;
  lines = statements;
  
  return {
    statements: statements > 0 ? ((coveredStatements / statements) * 100).toFixed(2) : '0.00',
    branches: branches > 0 ? ((coveredBranches / branches) * 100).toFixed(2) : '0.00',
    functions: functions > 0 ? ((coveredFunctions / functions) * 100).toFixed(2) : '0.00',
    lines: lines > 0 ? ((coveredLines / lines) * 100).toFixed(2) : '0.00',
  };
}

function generateTextReport(coverage) {
  const files = Object.keys(coverage).sort();
  
  if (files.length === 0) {
    return 'No files to report.';
  }
  
  // Calculate per-file metrics
  const fileMetrics = [];
  let totalStatements = 0;
  let totalCoveredStatements = 0;
  let totalBranches = 0;
  let totalCoveredBranches = 0;
  let totalFunctions = 0;
  let totalCoveredFunctions = 0;
  let totalLines = 0;
  let totalCoveredLines = 0;
  
  for (const filePath of files) {
    const data = coverage[filePath];
    const metrics = calculateMetrics({ [filePath]: data });
    
    const statements = Object.values(data.s || {}).length;
    const branches = Object.values(data.b || {}).reduce((sum, arr) => sum + arr.length, 0);
    const functions = Object.values(data.f || {}).length;
    const lines = statements; // Simplified: lines = statements
    
    const coveredStatements = Object.values(data.s || {}).filter(s => s > 0).length;
    const coveredBranches = Object.values(data.b || {}).reduce((sum, arr) => sum + arr.filter(b => b > 0).length, 0);
    const coveredFunctions = Object.values(data.f || {}).filter(f => f > 0).length;
    const coveredLines = coveredStatements;
    
    totalStatements += statements;
    totalCoveredStatements += coveredStatements;
    totalBranches += branches;
    totalCoveredBranches += coveredBranches;
    totalFunctions += functions;
    totalCoveredFunctions += coveredFunctions;
    totalLines += lines;
    totalCoveredLines += coveredLines;
    
    fileMetrics.push({
      path: filePath,
      statements: statements > 0 ? ((coveredStatements / statements) * 100).toFixed(2) : '0.00',
      branches: branches > 0 ? ((coveredBranches / branches) * 100).toFixed(2) : '0.00',
      functions: functions > 0 ? ((coveredFunctions / functions) * 100).toFixed(2) : '0.00',
      lines: lines > 0 ? ((coveredLines / lines) * 100).toFixed(2) : '0.00',
    });
  }
  
  // Generate table
  const padding = 3;
  const maxPathLength = Math.max(...files.map(f => f.length), 'File'.length) + padding;
  
  let report = '';
  report += '-'.repeat(maxPathLength + 50) + '\n';
  report += 'File'.padEnd(maxPathLength) + ' | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s\n';
  report += '-'.repeat(maxPathLength + 50) + '\n';
  
  // Group by directory
  const grouped = {};
  for (const metric of fileMetrics) {
    const parts = metric.path.split('/');
    const dir = parts.slice(0, -1).join('/') || '.';
    if (!grouped[dir]) grouped[dir] = [];
    grouped[dir].push(metric);
  }
  
  const dirs = Object.keys(grouped).sort();
  
  for (const dir of dirs) {
    const dirMetrics = grouped[dir];
    const dirStatements = dirMetrics.reduce((sum, m) => sum + parseFloat(m.statements), 0);
    const dirBranches = dirMetrics.reduce((sum, m) => sum + parseFloat(m.branches), 0);
    const dirFunctions = dirMetrics.reduce((sum, m) => sum + parseFloat(m.functions), 0);
    const dirLines = dirMetrics.reduce((sum, m) => sum + parseFloat(m.lines), 0);
    const fileCount = dirMetrics.length;
    
    const dirAvgStatements = (dirStatements / fileCount).toFixed(2);
    const dirAvgBranches = (dirBranches / fileCount).toFixed(2);
    const dirAvgFunctions = (dirFunctions / fileCount).toFixed(2);
    const dirAvgLines = (dirLines / fileCount).toFixed(2);
    
    report += dir.padEnd(maxPathLength) + ` | ${dirAvgStatements.padStart(7)} | ${dirAvgBranches.padStart(8)} | ${dirAvgFunctions.padStart(7)} | ${dirAvgLines.padStart(7)} |\n`;
    
    for (const metric of dirMetrics.sort((a, b) => a.path.localeCompare(b.path))) {
      const fileName = metric.path.split('/').pop();
      const indent = '  ';
      report += indent + fileName.padEnd(maxPathLength - 2) + ` | ${metric.statements.padStart(7)} | ${metric.branches.padStart(8)} | ${metric.functions.padStart(7)} | ${metric.lines.padStart(7)} |\n`;
    }
  }
  
  report += '-'.repeat(maxPathLength + 50) + '\n';
  
  // Totals
  const totalMetrics = {
    statements: totalStatements > 0 ? ((totalCoveredStatements / totalStatements) * 100).toFixed(2) : '0.00',
    branches: totalBranches > 0 ? ((totalCoveredBranches / totalBranches) * 100).toFixed(2) : '0.00',
    functions: totalFunctions > 0 ? ((totalCoveredFunctions / totalFunctions) * 100).toFixed(2) : '0.00',
    lines: totalLines > 0 ? ((totalCoveredLines / totalLines) * 100).toFixed(2) : '0.00',
  };
  
  report += 'All files'.padEnd(maxPathLength) + ` | ${totalMetrics.statements.padStart(7)} | ${totalMetrics.branches.padStart(8)} | ${totalMetrics.functions.padStart(7)} | ${totalMetrics.lines.padStart(7)} |\n`;
  report += '-'.repeat(maxPathLength + 50) + '\n';
  
  return report;
}

function filterCoverage() {
  if (!existsSync(COVERAGE_FILE)) {
    console.error('Coverage-final.json not found. Run tests with --coverage first.');
    process.exit(1);
  }

  const coverageData = JSON.parse(readFileSync(COVERAGE_FILE, 'utf-8'));
  const originalCount = Object.keys(coverageData).length;

  const filteredData = {};
  for (const [filePath, coverage] of Object.entries(coverageData)) {
    if (isAllowed(filePath)) {
      filteredData[filePath] = coverage;
    }
  }

  const filteredCount = Object.keys(filteredData).length;
  const removedCount = originalCount - filteredCount;

  writeFileSync(COVERAGE_FILE, JSON.stringify(filteredData, null, 2));

  console.log('Coverage filtered:');
  console.log('  Original files: ' + originalCount);
  console.log('  Filtered files: ' + filteredCount);
  console.log('  Removed files: ' + removedCount);
  console.log('  Output: ' + COVERAGE_FILE);
  console.log('');
  console.log('Filtered Coverage Report:');
  console.log(generateTextReport(filteredData));
}

filterCoverage();
