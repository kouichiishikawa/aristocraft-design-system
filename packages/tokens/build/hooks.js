// Style Dictionary hooks shared by build/index.js.
// Custom transforms/formats are kept minimal: the DTCG source is the contract,
// these only bridge the gaps in Style Dictionary v5 (see docs/pf-09-pipeline.md).
import StyleDictionary from 'style-dictionary';
import { formats, transformTypes } from 'style-dictionary/enums';

export const HEADER = [
  'Generated from tokens/ by `npm run build` (build/index.js).',
  'Do not edit by hand. Edit the JSON under tokens/ and rebuild.',
];

/** DTCG 2025.10 `$root`: the group's own value. It never appears in public names. */
export const ROOT = '$root';
export const cleanPath = (path) => path.filter((p) => p !== ROOT);

/** `lineHeight` -> `line-height`; `050`, `100a`, `xxl` stay as they are. */
const kebabSegment = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
/** CSS custom property prefix (PF-04 decision, 2026-09-29): keeps the library's variables out of Tailwind/shadcn namespaces. */
export const CSS_PREFIX = 'ac';
export const cssName = (path) => [CSS_PREFIX, ...cleanPath(path).map(kebabSegment)].join('-');
export const dotName = (path) => cleanPath(path).join('.');
export const figmaName = (path) => cleanPath(path).join('/');

/** DTCG dimension / duration object form: { value: 4, unit: "px" } */
export const isUnitValue = (v) =>
  v !== null && typeof v === 'object' && !Array.isArray(v) && 'value' in v && 'unit' in v;

export const CSS_TRANSFORMS = [
  'name/dtcg-kebab',
  'unit/css',
  'color/css',
  'fontFamily/css',
  'cubicBezier/css',
  'shadow/css/shorthand',
];

const cssVariables = StyleDictionary.hooks.formats[formats.cssVariables];

/** Remove the leading `/** ... *\/` file header from a generated CSS string. */
export const stripHeader = (css) => css.replace(/^\/\*\*[\s\S]*?\*\/\n+/, '');
export const cssHeader = () => `/**\n${HEADER.map((l) => ` * ${l}`).join('\n')}\n */\n\n`;

export const hooks = {
  transforms: {
    // Style Dictionary 5.5 leaks `$root` into names (issue #1757); this drops it.
    'name/dtcg-kebab': {
      type: transformTypes.name,
      transform: (token) => cssName(token.path),
    },
    // Built-in `size/px` rewrites every unit to px (em, % are lost), so serialize ourselves.
    'unit/css': {
      type: transformTypes.value,
      transitive: true,
      filter: (token) => isUnitValue(token.$value),
      transform: (token) => `${token.$value.value}${token.$value.unit}`,
    },
  },
  formats: {
    // Dark theme: explicit opt-in via data-theme, plus OS preference unless light is forced.
    'css/variables-dark': async (args) => {
      const attr = await cssVariables({
        ...args,
        options: { ...args.options, selector: '[data-theme="dark"]' },
      });
      const media = await cssVariables({
        ...args,
        options: {
          ...args.options,
          selector: ['@media (prefers-color-scheme: dark)', ':root:not([data-theme="light"])'],
        },
      });
      return attr + '\n' + stripHeader(media);
    },
  },
  fileHeaders: {
    ac: () => HEADER,
  },
};
