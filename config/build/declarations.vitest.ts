import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { build } from 'vite';
import { expect, it } from 'vitest';
import viteConfig from '../../vite.config';

it('rewrites declaration module aliases without changing string literal types', async () => {
  const projectRoot = fileURLToPath(new URL('../../', import.meta.url));
  const dependenciesRoot = join(projectRoot, 'node_modules');
  const fixtureRoot = mkdtempSync(join(dependenciesRoot, '.dr-front-declarations-'));

  try {
    const sourceRoot = join(fixtureRoot, 'src');

    mkdirSync(sourceRoot);

    for (const config of ['tsconfig.json', 'tsconfig.build.json']) {
      copyFileSync(join(projectRoot, config), join(fixtureRoot, config));
    }

    writeFileSync(join(sourceRoot, 'foo.ts'), 'export interface Foo { value: string; }\n');

    writeFileSync(join(sourceRoot, 'index.ts'), [
      'import type { Foo } from \'@/foo\';',
      'export type ActualImport = Foo;',
      'export type Example = \'@/foo\';',
      'export type ImportLooking = "import(\'@/foo\')";',
    ].join('\n'));

    await build({
      ...viteConfig,
      configFile: false,
      root: fixtureRoot,
      logLevel: 'silent',
      resolve: { alias: { '@': sourceRoot } },
      build: {
        ...viteConfig.build,
        lib: { entry: join(sourceRoot, 'index.ts'), formats: ['es'] },
      },
    });

    const declaration = ts.createSourceFile(
      'index.d.ts',
      readFileSync(join(fixtureRoot, 'dist/types/index.d.ts'), 'utf8'),
      ts.ScriptTarget.Latest,
    );

    const moduleReference = declaration.statements.find(ts.isImportDeclaration)?.moduleSpecifier;

    const literals = Object.fromEntries(declaration.statements.flatMap((statement) =>
      ts.isTypeAliasDeclaration(statement)
      && ts.isLiteralTypeNode(statement.type)
      && ts.isStringLiteral(statement.type.literal)
        ? [[statement.name.text, statement.type.literal.text]]
        : [],
    ));

    expect(moduleReference != null && ts.isStringLiteral(moduleReference) && moduleReference.text).toBe('./foo');
    expect(literals.Example).toBe('@/foo');
    expect(literals.ImportLooking).toBe('import(\'@/foo\')');
  } finally {
    if (dirname(fixtureRoot) === dependenciesRoot) {
      rmSync(fixtureRoot, { recursive: true, force: true });
    }
  }
}, 30_000);
