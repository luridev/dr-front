import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { projectRootURL, icons, iconsOutputPath, iconsSourcePath } from './config';
import { generateIcon } from './generateIcon';

const check = process.argv.includes('--check');

for (const name of icons) {
  const componentName = `Dr${name.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join('')}Icon`;
  const sourcePath = `${iconsSourcePath}/${name}.svg`;
  const outputURL = new URL(`${iconsOutputPath}/${componentName}/${componentName}.generated.vue`, projectRootURL);
  const source = await readFile(new URL(sourcePath, projectRootURL), 'utf8');
  const component = await generateIcon(source, componentName, sourcePath);

  if (check) {
    if (await readFile(outputURL, 'utf8') !== component) {
      throw new Error(`${componentName}.generated.vue is stale. Run generate:icons.`);
    }
  } else {
    await mkdir(new URL('.', outputURL), { recursive: true });
    await writeFile(outputURL, component);
  }
}
