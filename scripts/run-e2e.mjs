import net from 'node:net';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const target = 'http://localhost:3000';

/**
 * Runs an npm command with inherited output and propagates failure.
 * @param {string[]} args - npm arguments.
 * @param {NodeJS.ProcessEnv} env - Child environment.
 * @returns {Promise<void>} Resolves only on successful completion.
 */
function run(args, env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(npm, args, { cwd: root, stdio: 'inherit', env });
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`npm ${args.join(' ')} failed (${signal ?? code}).`));
    });
  });
}

/**
 * Verifies that a wildcard listener can acquire the test port.
 * Never kills or reuses an existing server.
 * @returns {Promise<void>} Resolves when port 3000 is available.
 */
function assertPortFree() {
  return new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once('error', (error) => {
      reject(
        new Error(
          error.code === 'EADDRINUSE'
            ? 'Port 3000 is already in use. Stop the running server before starting E2E tests.'
            : `Cannot check port 3000: ${error.message}`
        )
      );
    });
    probe.listen(3000, () => probe.close((error) => (error ? reject(error) : resolve())));
  });
}

/**
 * Builds and tests the production application, or runs the managed Cypress child.
 * @returns {Promise<void>} Completes when the selected suite finishes.
 */
async function main() {
  const [suite = 'all', ...extraArgs] = process.argv.slice(2);
  if (suite === '--cypress') {
    const args = JSON.parse(process.env.TMDB_E2E_ARGS ?? '[]');
    await run(['exec', '--', 'cypress', ...args], {
      ...process.env,
      CYPRESS_BASE_URL: target
    });
    return;
  }

  const specs = {
    all: null,
    security: 'cypress/e2e/security/**/*.cy.js',
    a11y: 'cypress/accessibility/**/*.cy.js',
    open: null
  };
  if (!Object.hasOwn(specs, suite)) throw new Error(`Unknown E2E suite: ${suite}`);

  await assertPortFree();
  await run(['run', 'build']);
  await assertPortFree();

  const args = [suite === 'open' ? 'open' : 'run', '--e2e', '--browser', 'chrome'];
  if (specs[suite]) args.push('--spec', specs[suite]);
  args.push(...extraArgs);

  await run(
    [
      'exec',
      '--',
      'start-server-and-test',
      'npm run start -- --port 3000',
      `${target}/en-US`,
      'node scripts/run-e2e.mjs --cypress'
    ],
    {
      ...process.env,
      NODE_ENV: 'production',
      PORT: '3000',
      CYPRESS_BASE_URL: target,
      TMDB_E2E_ARGS: JSON.stringify(args)
    }
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
