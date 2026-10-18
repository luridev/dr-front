import assert from 'node:assert/strict';
import { gzipSync } from 'node:zlib';
import { build } from 'vite';

const scenarios = {
  plain: ['DrInput'],
  number: ['DrInputNumber'],
  date: ['DrInputDate'],
  time: ['DrInputTime'],
  combined: ['DrInput', 'DrInputNumber', 'DrInputDate', 'DrInputTime'],
};

async function buildConsumer(entries) {
  const sources = new Map(Object.entries(entries).map(([name, components]) => [
    `\0dr-front-consumer-${name}`,
    `
      import { createApp, h, ref } from 'vue';
      import { ${components.join(', ')} } from '@protoapps/dr-front';
      createApp({ setup() {
        const values = [${components.map((component) => `ref(${component === 'DrInput' ? "'abc'" : component === 'DrInputNumber' ? '42' : 'null'})`).join(', ')}];
        return () => h('div', {}, [${components.map((component, index) => `h(${component}, {
          modelValue: values[${index}].value,
          'onUpdate:modelValue': value => values[${index}].value = value,
        })`).join(', ')}]);
      }}).mount('#app');
    `,
  ]));
  const result = await build({
    configFile: false,
    logLevel: 'error',
    plugins: [{
      name: 'consumer-entry',
      resolveId: (id) => sources.has(id) ? id : null,
      load: (id) => sources.get(id),
    }],
    build: { write: false, rolldownOptions: { input: [...sources.keys()] } },
  });

  return result.output.filter((output) => output.type === 'chunk');
}

function getMaskModules(chunks) {
  return new Set(chunks.flatMap((chunk) => Object.entries(chunk.modules)
    .filter(([id, module]) => /node_modules[/\\]imask[/\\]/.test(id) && module.renderedLength !== 0)
    .map(([id]) => id)));
}

for (const [scenario, components] of Object.entries(scenarios)) {
  const chunks = await buildConsumer({ [scenario]: components });
  const maskModules = getMaskModules(chunks);

  if (scenario === 'plain') {
    assert.equal(maskModules.size, 0, 'A consumer importing only DrInput must not bundle IMask.');
  } else {
    assert.ok(maskModules.size > 0, `${scenario} must retain the mask engine.`);
  }

  const minified = chunks.reduce((size, chunk) => size + Buffer.byteLength(chunk.code), 0);
  const gzip = chunks.reduce((size, chunk) => size + gzipSync(chunk.code, { level: 9 }).length, 0);

  process.stdout.write(`[isolation] ${scenario}: ${minified} bytes, gzip ${gzip} bytes, IMask modules ${maskModules.size}\n`);
}

const chunks = await buildConsumer({ plain: scenarios.plain, masked: ['DrInputNumber', 'DrInputDate', 'DrInputTime'] });
const plain = chunks.find((chunk) => chunk.facadeModuleId === '\0dr-front-consumer-plain');

assert.ok(plain, 'The plain-field entry must exist.');
assert.ok(getMaskModules(chunks).size > 0, 'The other entry must retain its masks.');

const byFile = new Map(chunks.map((chunk) => [chunk.fileName, chunk]));
const reachable = new Set();

function visit(chunk) {
  if (reachable.has(chunk)) return;
  reachable.add(chunk);
  for (const file of chunk.imports) {
    assert.ok(byFile.has(file), `Unexpected external consumer import: ${file}`);
    visit(byFile.get(file));
  }
}

visit(plain);
assert.equal(getMaskModules([...reachable]).size, 0, 'The plain page must not statically load IMask from shared chunks.');
process.stdout.write('[isolation] multi-page plain dependency graph: IMask modules 0\n');
