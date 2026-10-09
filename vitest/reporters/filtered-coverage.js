/**
 * Custom Vitest coverage reporter that only shows files from lib/ and app/api/
 */

import { CoverageReporter } from 'vitest/reporters';

export class FilteredCoverageReporter extends CoverageReporter {
  async onFinished(rawCoverages) {
    if (!rawCoverages || rawCoverages.length === 0) {
      console.log('\nNo coverage data available\n');
      return;
    }

    // Filter to only lib/ and app/api/ files
    const filtered = rawCoverages.filter((file) => {
      const path = file.filepath.replace(/\\/g, '/');
      return path.includes('/lib/') || path.includes('/app/api/');
    });

    if (filtered.length === 0) {
      console.log('\nNo coverage data for lib/ or app/api/\n');
      return;
    }

    // Calculate totals
    let totalStatements = 0;
    let coveredStatements = 0;
    let totalBranches = 0;
    let coveredBranches = 0;
    let totalFunctions = 0;
    let coveredFunctions = 0;
    let totalLines = 0;
    let coveredLines = 0;

    const fileReports = filtered.map((file) => {
      const path = file.filepath.replace(/\\/g, '/').split('/').slice(-3).join('/');

      const statements = file.summary.statements;
      const branches = file.summary.branches;
      const functions = file.summary.functions;
      const lines = file.summary.lines;

      totalStatements += statements.total;
      coveredStatements += statements.covered;
      totalBranches += branches.total;
      coveredBranches += branches.covered;
      totalFunctions += functions.total;
      coveredFunctions += functions.covered;
      totalLines += lines.total;
      coveredLines += lines.covered;

      return {
        file: path,
        statements: statements.pct,
        branches: branches.pct,
        functions: functions.pct,
        lines: lines.pct
      };
    });

    // Print table header
    console.log('\n' + '='.repeat(80));
    console.log('Coverage Report (lib/ and app/api/ only)');
    console.log('='.repeat(80));
    console.log(
      'File'.padEnd(50),
      '% Statements'.padStart(12),
      '% Branch'.padStart(10),
      '% Funcs'.padStart(10),
      '% Lines'.padStart(10)
    );
    console.log('-'.repeat(80));

    // Print file rows
    fileReports.forEach((report) => {
      console.log(
        report.file.padEnd(50),
        report.statements.toString().padStart(12),
        report.branches.toString().padStart(10),
        report.functions.toString().padStart(10),
        report.lines.toString().padStart(10)
      );
    });

    // Print totals
    console.log('-'.repeat(80));
    const totalPct = (stmts) => ((stmts.covered / stmts.total) * 100).toFixed(2);
    console.log(
      'TOTAL'.padEnd(50),
      totalPct({ covered: coveredStatements, total: totalStatements }).padStart(12),
      totalPct({ covered: coveredBranches, total: totalBranches }).padStart(10),
      totalPct({ covered: coveredFunctions, total: totalFunctions }).padStart(10),
      totalPct({ covered: coveredLines, total: totalLines }).padStart(10)
    );
    console.log('='.repeat(80) + '\n');
  }
}
