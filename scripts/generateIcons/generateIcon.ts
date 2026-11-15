import { readFile } from 'node:fs/promises';
import { optimize } from 'svgo';
import { iconPresentationAttributes, unsupportedIconAttributes } from './config';

export async function generateIcon(source: string, componentName: string, sourcePath: string): Promise<string> {
  const { data } = optimize(source, {
    plugins: [{
      name: 'validate-builtin-icon',
      fn(root) {
        const svg = root.children[0];

        if (root.children.length !== 1 || svg?.type !== 'element' || svg.name !== 'svg') {
          throw new Error('Expected a single SVG root.');
        }

        const rawViewBox = svg.attributes.viewBox;

        if (!Object.hasOwn(svg.attributes, 'viewBox') || rawViewBox === undefined) {
          throw new Error('SVG must have a viewBox.');
        }

        const viewBox = rawViewBox.trim().split(/[\s,]+/).map(Number);

        const validCoordinates = viewBox.every((value, index) => Number.isFinite(value) && (index < 2 || value > 0));

        if (viewBox.length !== 4 || !validCoordinates) {
          throw new Error('SVG must have a valid viewBox with positive width and height.');
        }

        return {
          element: {
            enter(element, parent) {
              if (element !== svg && (element.name !== 'path' || parent !== svg)) {
                throw new Error(`Unsupported SVG element <${element.name}>: only root SVG and direct paths are supported.`);
              }

              for (const [name, value] of Object.entries(element.attributes)) {
                if (unsupportedIconAttributes.has(name) || /url\s*\(/i.test(value)) {
                  throw new Error(`Unsupported SVG ID/reference attribute: ${name}. Namespace isolation is not implemented.`);
                }

                const isGeometry = element === svg ? name === 'viewBox' || name === 'xmlns' : name === 'd';

                if (!isGeometry && !iconPresentationAttributes.has(name)) {
                  throw new Error(`Unsupported SVG attribute: ${name}.`);
                }
              }
            },
          },
          text: {
            enter() {
              throw new Error('SVG text is not supported in decorative built-in icons.');
            },
          },
        };
      },
    }],
  });

  const svg = /^<svg\b([^>]*?)(?:\/>|>([\s\S]*)<\/svg>)$/.exec(data);

  if (svg?.[1] === undefined) {
    throw new Error('Unexpected serialized SVG root.');
  }

  const attributes = svg[1].trim().replaceAll('" ', '"\n    ');

  const content = (svg.at(2) ?? '')
    .replaceAll(/<!--[\s\S]*?-->|<path\b([^>]*?)\/>/g, (markup: string, pathAttributes?: string) =>
      pathAttributes == null ? markup : `<path\n      ${pathAttributes.trim().replaceAll('" ', '"\n      ')}\n    />`,
    )
    .replaceAll('><', '>\n    <');

  const template = await readFile(new URL('./DrIcon.template.vue', import.meta.url), 'utf8');

  const replacements = {
    __DR_ICON_SOURCE_PATH__: sourcePath,
    DrIconTemplateName: componentName,
    'data-dr-icon-template-attributes=""': attributes,
    '<!-- __DR_ICON_CONTENT__ -->': content,
  };

  return template.replaceAll('\r\n', '\n').replaceAll(
    /__DR_ICON_SOURCE_PATH__|DrIconTemplateName|data-dr-icon-template-attributes=""|<!-- __DR_ICON_CONTENT__ -->/g,
    (marker) => replacements[marker as keyof typeof replacements],
  );
}
