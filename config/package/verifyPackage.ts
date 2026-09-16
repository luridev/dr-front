import assert from 'node:assert/strict';
import { cpSync, globSync, mkdtempSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, join, relative, sep } from 'node:path';
import spawn from 'cross-spawn';
import {
  forbiddenRuntimeDependencies,
  publicEntrypoints,
  publicIconExports,
  publicLibExports,
  publicRuntimeExports,
  publicTypeExports,
  publishedFilePattern,
} from './config';
import type { NpmPackResult, NpmRunResult, PackageManifest, RunNpmOptions } from './types';

const root = process.cwd();
const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as PackageManifest;
const temporaryRoot = realpathSync(tmpdir());
const consumer = realpathSync(mkdtempSync(join(temporaryRoot, 'dr-front-consumer-')));
const relativeConsumer = relative(temporaryRoot, consumer);

assert.ok(!isAbsolute(relativeConsumer) && !relativeConsumer.startsWith(`..${sep}`));
assert.ok(relativeConsumer.startsWith('dr-front-consumer-') && !relativeConsumer.includes(sep));
process.stdout.write(`Temporary consumer: ${consumer}\n`);

function runNpm(args: Array<string>, options: RunNpmOptions): string {
  const command = `npm ${args.join(' ')}`;

  process.stdout.write(`[package] ${command}\n`);

  const result: NpmRunResult = spawn.sync('npm', args, {
    cwd: options.cwd,
    encoding: 'utf8',
    windowsHide: true,
    stdio: ['inherit', options.captureStdout === true ? 'pipe' : 'inherit', 'inherit'],
  });

  if (result.error != null || result.status !== 0 || result.signal != null) {
    if (result.stdout != null && result.stdout !== '') {
      process.stderr.write(result.stdout);
    }

    throw new Error(
      `${command} failed in ${options.cwd} (status: ${result.status}, signal: ${result.signal}): ${result.error?.message ?? ''}`,
    );
  }

  return result.stdout ?? '';
}

try {
  runNpm(['run', 'build'], { cwd: root });

  const packOutput = runNpm(['pack', '--json', '--pack-destination', consumer, '--ignore-scripts'], { cwd: root, captureStdout: true });
  let packResults: Array<NpmPackResult>;

  try {
    packResults = JSON.parse(packOutput) as Array<NpmPackResult>;
  } catch (error) {
    throw new Error(`npm pack returned invalid JSON:\n${packOutput}`, { cause: error });
  }

  assert.ok(Array.isArray(packResults) && packResults.length === 1, 'npm pack must return exactly one package artifact.');

  const { filename, files } = packResults[0];

  assert.equal(basename(filename), filename, 'npm pack filename must stay inside the temporary directory.');

  const archive = realpathSync(join(consumer, filename));

  assert.equal(dirname(archive), consumer, 'npm pack archive must stay inside the temporary directory.');
  assert.ok(statSync(archive).isFile(), 'npm pack archive must exist as a file.');

  runNpm(['exec', '--offline', '--no', '--', 'publint', archive, '--strict'], { cwd: root });

  for (const file of files) {
    assert.match(file.path, publishedFilePattern, `Unexpected published file: ${file.path}`);
  }

  cpSync(join(root, 'tests/fixtures/package-consumer'), consumer, { recursive: true });

  const fixtureManifest = {
    name: 'dr-front-package-consumer',
    private: true,
    type: 'module',
    scripts: {
      typecheck: 'vue-tsc --noEmit',
      runtime: 'node runtime.mjs',
      build: 'vite build',
    },
    dependencies: { [manifest.name]: `file:./${filename}`, vue: manifest.devDependencies.vue },
    devDependencies: {
      typescript: manifest.devDependencies.typescript,
      'vue-tsc': manifest.devDependencies['vue-tsc'],
      vite: manifest.devDependencies.vite,
      '@vitejs/plugin-vue': manifest.devDependencies['@vitejs/plugin-vue'],
    },
  };

  writeFileSync(join(consumer, 'package.json'), `${JSON.stringify(fixtureManifest, null, 2)}\n`);

  writeFileSync(join(consumer, 'expected-exports.json'), JSON.stringify({
    root: publicRuntimeExports,
    types: publicTypeExports,
    icons: publicIconExports,
    lib: publicLibExports,
  }));

  runNpm(['install', '--no-audit', '--no-fund', '--include=dev'], { cwd: consumer });

  const installedPackage = realpathSync(join(consumer, 'node_modules', manifest.name));

  assert.ok(installedPackage.startsWith(`${consumer}${sep}`), 'Dr Front must be installed inside the independent consumer.');

  const installedManifest = JSON.parse(readFileSync(join(installedPackage, 'package.json'), 'utf8')) as PackageManifest;
  const runtimeDependencies = { ...installedManifest.dependencies, ...installedManifest.optionalDependencies };

  assert.deepEqual(Object.keys(installedManifest.exports).sort(), publicEntrypoints.toSorted());
  assert.ok(installedManifest.peerDependencies?.vue != null, 'Vue must remain a peer dependency.');
  assert.ok(!('vue' in runtimeDependencies), 'Vue must remain host-owned.');

  for (const dependency of forbiddenRuntimeDependencies) {
    assert.ok(!(dependency in runtimeDependencies), `${dependency} must not be a runtime dependency.`);
  }

  assert.ok(
    Array.isArray(installedManifest.sideEffects) && installedManifest.sideEffects.includes('**/*.css'),
    'The CSS sideEffects policy must include **/*.css; additional patterns are allowed.',
  );

  runNpm(['run', 'typecheck'], { cwd: consumer });
  runNpm(['run', 'runtime'], { cwd: consumer });
  runNpm(['run', 'build'], { cwd: consumer });

  const css = globSync('dist/**/*.css', { cwd: consumer }).map((file) => readFileSync(join(consumer, file), 'utf8')).join('\n');

  assert.match(css, /--dr-/);
  assert.match(css, /\.DrButton/);
  process.stdout.write('Package verified successfully.\n');
} finally {
  rmSync(consumer, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
}
