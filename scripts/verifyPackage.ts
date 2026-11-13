import assert from 'node:assert/strict';
import { cpSync, globSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { join, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRunner, lintPackage, packPackage, withTemporaryDirectory } from '@protoapps/package-verifier';
import {
  forbiddenRuntimeDependencies,
  publicEntrypoints,
  publicIconExports,
  publicRuntimeExports,
  publicTypeExports,
} from './config';
import type { PackageLock, PackageManifest } from './types';

const root = realpathSync(fileURLToPath(new URL('../', import.meta.url)));
const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as PackageManifest;
const runner = createRunner({ cwd: root, output: 'inherit', timeout: 600_000 });

await withTemporaryDirectory(async (consumer) => {
  assert.ok(consumer !== root && !consumer.startsWith(`${root}${sep}`), 'The consumer must be outside the repository.');
  const { path: archive } = await packPackage({ cwd: root, destination: consumer, runner });
  await lintPackage(archive);

  cpSync(join(root, 'tests/fixtures/package-consumer'), consumer, { recursive: true });

  const fixtureManifest = {
    name: 'dr-front-package-consumer',
    private: true,
    type: 'module',
    scripts: {
      typecheck: 'vue-tsc --noEmit',
      runtime: 'node runtime.mjs',
      build: 'vite build',
      isolation: 'node isolation.mjs',
      browser: 'node browser.mjs',
    },
    dependencies: { [manifest.name]: pathToFileURL(archive).href, vue: manifest.devDependencies.vue },
    allowScripts: { 'core-js-pure': false },
  };

  writeFileSync(join(consumer, 'package.json'), `${JSON.stringify(fixtureManifest, null, 2)}\n`);

  writeFileSync(join(consumer, 'expected-exports.json'), JSON.stringify({
    root: publicRuntimeExports,
    types: publicTypeExports,
    icons: publicIconExports,
  }));

  runner.npm(['install', '--ignore-scripts', '--no-audit', '--no-fund'], { cwd: consumer });

  const installedPackage = realpathSync(join(consumer, 'node_modules', manifest.name));

  assert.ok(installedPackage.startsWith(`${consumer}${sep}`), 'Dr Front must be installed inside the independent consumer.');

  const installedManifest = JSON.parse(readFileSync(join(installedPackage, 'package.json'), 'utf8')) as PackageManifest;
  const runtimeDependencies = { ...installedManifest.dependencies, ...installedManifest.optionalDependencies };

  assert.equal(installedManifest.name, manifest.name);
  assert.equal(installedManifest.version, manifest.version);
  assert.deepEqual(installedManifest.exports, manifest.exports);
  assert.deepEqual(installedManifest.dependencies, manifest.dependencies);
  assert.deepEqual(Object.keys(installedManifest.exports).sort(), publicEntrypoints.toSorted());
  assert.ok(installedManifest.peerDependencies?.vue != null, 'Vue must remain a peer dependency.');
  assert.deepEqual(installedManifest.peerDependencies, manifest.peerDependencies);
  assert.ok(!('vue' in runtimeDependencies), 'Vue must remain host-owned.');

  for (const dependency of forbiddenRuntimeDependencies) {
    assert.ok(!(dependency in runtimeDependencies), `${dependency} must not be a runtime dependency.`);
  }

  assert.ok(
    Array.isArray(installedManifest.sideEffects) && installedManifest.sideEffects.includes('**/*.css'),
    'The CSS sideEffects policy must include **/*.css; additional patterns are allowed.',
  );

  const lock = JSON.parse(readFileSync(join(consumer, 'package-lock.json'), 'utf8')) as PackageLock;

  for (const dependency of [...Object.keys(manifest.devDependencies), 'cross-spawn', '@types/cross-spawn', 'publint']) {
    if (Object.hasOwn(installedManifest.peerDependencies ?? {}, dependency)) {
      continue;
    }

    assert.ok(!Object.keys(lock.packages).some((path) => path.endsWith(`node_modules/${dependency}`)),
      `Unexpected runtime dependency: ${dependency}`);
  }

  runner.npm(['ls', '--all'], { cwd: consumer });

  writeFileSync(join(consumer, 'package.json'), `${JSON.stringify({
    ...fixtureManifest,
    devDependencies: {
      typescript: manifest.devDependencies.typescript,
      'vue-tsc': manifest.devDependencies['vue-tsc'],
      vite: manifest.devDependencies.vite,
      '@vitejs/plugin-vue': manifest.devDependencies['@vitejs/plugin-vue'],
    },
  }, null, 2)}\n`);

  runner.npm(['install', '--ignore-scripts', '--no-audit', '--no-fund', '--include=dev'], { cwd: consumer });

  runner.npm(['run', 'typecheck'], { cwd: consumer });
  runner.npm(['run', 'runtime', '--', import.meta.resolve('temporal-polyfill')], { cwd: consumer });
  runner.npm(['run', 'build'], { cwd: consumer });
  runner.npm(['run', 'isolation'], { cwd: consumer });
  runner.npm(['run', 'browser', '--', import.meta.resolve('@playwright/test')], { cwd: consumer });

  const css = globSync('dist/**/*.css', { cwd: consumer }).map((file) => readFileSync(join(consumer, file), 'utf8')).join('\n');

  assert.match(css, /--dr-/);
  assert.match(css, /\.DrButton/);
  assert.match(css, /\.DrInputTime__periodButton/);
  process.stdout.write('Package verified successfully.\n');
}, { prefix: 'dr-front-consumer-' });
