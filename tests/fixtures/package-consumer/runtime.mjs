import assert from 'node:assert/strict';
import { readFileSync, realpathSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';

Reflect.deleteProperty(globalThis, 'Temporal');
assert.equal('Temporal' in globalThis, false);

const packageName = '@protoapps/dr-front';

const root = await import(packageName);
const icons = await import(`${packageName}/icons`);
const lib = await import(`${packageName}/lib`);
const expected = JSON.parse(readFileSync(new URL('./expected-exports.json', import.meta.url), 'utf8'));

for (const [name, actual] of Object.entries({ root, icons, lib })) {
  assert.deepEqual(Object.keys(actual).sort(), expected[name].toSorted());
}

const html = await renderToString(createSSRApp(() => h(root.DrButton, null, () => 'Package button')));

assert.match(html, /<button/);
assert.equal('Temporal' in globalThis, false, 'Root import/render must not install a polyfill.');

const installedPackage = realpathSync(new URL(`./node_modules/${packageName}`, import.meta.url));
const entryFile = fileURLToPath(import.meta.resolve(packageName));
const privatePath = relative(installedPackage, entryFile).replaceAll('\\', '/');

assert.ok(statSync(entryFile).isFile(), 'The private subpath probe must refer to an existing file.');
assert.throws(() => import.meta.resolve(`${packageName}/${privatePath}`), { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' });

const consumer = fileURLToPath(new URL('./', import.meta.url));
const config = ts.readConfigFile(join(consumer, 'tsconfig.json'), ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, consumer);
const program = ts.createProgram([join(consumer, 'contracts.ts')], parsed.options);
const checker = program.getTypeChecker();
const source = program.getSourceFile(join(consumer, 'contracts.ts'));

assert.ok(source, 'Consumer contracts source must exist.');

const rootImport = source.statements.find((node) => ts.isImportDeclaration(node) && node.moduleSpecifier.text === packageName);

assert.ok(
  rootImport != null && ts.isStringLiteral(rootImport.moduleSpecifier),
  'Consumer contracts must import the public package root.',
);

const rootModule = checker.getSymbolAtLocation(rootImport.moduleSpecifier);

assert.ok(rootModule, 'The installed public root must have a TypeScript module symbol.');

const expectedRootExports = [...new Set([...expected.root, ...expected.types])].sort();

assert.deepEqual(
  checker.getExportsOfModule(rootModule).map((symbol) => symbol.name).sort(),
  expectedRootExports,
);
