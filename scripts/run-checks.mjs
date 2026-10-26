import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const vitestChecks = [
  { key: 'lint', label: 'Lint', args: ['run', 'lint'], retry: 'npm run lint' },
  {
    key: 'format',
    label: 'Format check',
    args: ['run', 'format:check'],
    retry: 'npm run format:check'
  },
  { key: 'unit', label: 'Unit tests', args: ['run', 'test:unit'], retry: 'npm run test:unit' },
  {
    key: 'component',
    label: 'Component tests',
    args: ['run', 'test:component'],
    retry: 'npm run test:component'
  },
  {
    key: 'integration',
    label: 'Integration tests',
    args: ['run', 'test:integration'],
    retry: 'npm run test:integration'
  },
  {
    key: 'coverage',
    label: 'Coverage',
    args: ['run', 'test:coverage'],
    retry: 'npm run test:coverage'
  }
];

const e2eChecks = [
  { key: 'e2e', label: 'E2E tests', args: ['run', 'test:e2e'], retry: 'npm run test:e2e' },
  {
    key: 'security',
    label: 'Security tests',
    args: ['run', 'test:e2e:security'],
    retry: 'npm run test:e2e:security'
  },
  {
    key: 'a11y',
    label: 'Accessibility tests',
    args: ['run', 'test:e2e:a11y'],
    retry: 'npm run test:e2e:a11y'
  },
  {
    key: 'audit',
    label: 'Dependency audit',
    args: ['audit', '--omit=dev', '--audit-level=high'],
    retry: 'npm audit --omit=dev --audit-level=high'
  }
];

/**
 * Parses the runner mode and optional focused-check selector.
 * @returns {{all: boolean, selector: string | undefined}} Parsed runner options.
 */
function parseArguments() {
  const args = process.argv.slice(2);
  const all = args.includes('--all');
  const selector = args.find((argument) => argument !== '--all');

  if (args.filter((argument) => argument !== '--all').length > 1) {
    throw new Error('Only one focused check can be selected.');
  }

  return { all, selector };
}

/**
 * Runs an npm command with inherited output and propagates failure.
 * @param {string[]} args - npm command arguments.
 * @returns {Promise<void>} Resolves only when the command succeeds.
 */
function runNpm(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(npm, args, {
      cwd: root,
      stdio: 'inherit'
    });

    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`npm ${args.join(' ')} failed (${signal ?? code}).`));
    });
  });
}

/**
 * Formats a duration in a compact human-readable form.
 * @param {number} milliseconds - Elapsed duration.
 * @returns {string} Formatted duration.
 */
function formatDuration(milliseconds) {
  const seconds = milliseconds / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = (seconds % 60).toFixed(1);
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Runs the selected checks sequentially and prints a friendly summary.
 * @returns {Promise<void>} Completes when every selected check has run.
 */
async function main() {
  const { all, selector } = parseArguments();
  const availableChecks = all ? e2eChecks : vitestChecks;
  const selectedChecks = selector
    ? availableChecks.filter((check) => check.key === selector)
    : availableChecks;

  if (selectedChecks.length === 0) {
    const keys = availableChecks.map((check) => check.key).join(', ');
    throw new Error(`Unknown check: ${selector}. Available checks: ${keys}.`);
  }

  const startedAt = Date.now();

  for (const check of selectedChecks) {
    const checkStartedAt = Date.now();
    process.stdout.write(`\n▶ ${check.label} … running\n`);

    try {
      await runNpm(check.args);
      const duration = formatDuration(Date.now() - checkStartedAt);
      process.stdout.write(`✔ ${check.label} passed in ${duration}\n`);
    } catch (error) {
      const duration = formatDuration(Date.now() - checkStartedAt);
      process.stderr.write(`\n✖ ${check.label} failed after ${duration}\n`);
      process.stderr.write(`  Review or retry: ${check.retry}\n`);
      throw error;
    }
  }

  const duration = formatDuration(Date.now() - startedAt);
  process.stdout.write(`\n${'─'.repeat(44)}\n`);
  process.stdout.write(`🎉 All checks passed in ${duration}\n`);
  process.stdout.write(`${'─'.repeat(44)}\n`);
}

main().catch((error) => {
  process.stderr.write(`\n${error.message}\n`);
  process.exitCode = 1;
});
