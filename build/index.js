// Builds dist/ from tokens/ with Style Dictionary v5. Run: `npm run build`
// Outputs: dist/css (variables), dist/ts (typed module), dist/json (flat), dist/figma (PF-10 input).
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import StyleDictionary from 'style-dictionary';
import { CSS_TRANSFORMS, cssHeader, hooks, stripHeader } from './hooks.js';
import { figmaJson, flatJson, tsModule } from './emit.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(ROOT);

const meta = JSON.parse(await fs.readFile('tokens/$metadata.json', 'utf8'));
const sets = meta.tokenSetOrder.map((s) => `tokens/${s}.json`);
const darkSets = sets.filter((f) => /color\.dark/.test(f));
const lightSets = sets.filter((f) => !darkSets.includes(f));
const primitiveSets = sets.filter((f) => /\/primitives\//.test(f));

// Silent: the only warning SD emits here is the intentional cross-file var() reference.
// Broken references still throw; duplicates/types are caught by build/validate.js.
const log = { warnings: 'warn', verbosity: 'silent' };
const cssFile = (destination, re, format = 'css/variables') => ({
  destination,
  format,
  filter: (token) => re.test(token.filePath),
});
const cssPlatform = (files) => ({
  transforms: CSS_TRANSFORMS,
  expand: { include: ['typography'] }, // font shorthand drops letter-spacing; emit each property instead
  buildPath: 'dist/css/',
  options: { fileHeader: 'ac', outputReferences: true },
  files,
});
const rawPlatform = { transforms: [] }; // resolved DTCG values, untouched

const light = new StyleDictionary({
  source: lightSets,
  hooks,
  log,
  platforms: {
    css: cssPlatform([
      cssFile('primitives.css', /\/primitives\//),
      cssFile('semantic.css', /\/semantic\/(typography|layout|border)\.json$/),
      cssFile('color.light.css', /color\.light/),
    ]),
    raw: rawPlatform,
  },
});
const dark = new StyleDictionary({
  include: primitiveSets, // resolvable, not emitted
  source: darkSets,
  hooks,
  log,
  platforms: {
    css: cssPlatform([cssFile('color.dark.css', /color\.dark/, 'css/variables-dark')]),
    raw: rawPlatform,
  },
});

await fs.rm('dist', { recursive: true, force: true });
await light.buildPlatform('css');
await dark.buildPlatform('css'); // `raw` has no files: export-only

// Single-import bundle.
const parts = ['primitives.css', 'semantic.css', 'color.light.css', 'color.dark.css'];
const bodies = await Promise.all(parts.map((p) => fs.readFile(`dist/css/${p}`, 'utf8')));
await fs.writeFile('dist/css/tokens.css', cssHeader() + bodies.map(stripHeader).join('\n'));

const [lightRaw, darkRaw, lightCss, darkCss] = await Promise.all([
  light.getPlatformTokens('raw'),
  dark.getPlatformTokens('raw'),
  light.getPlatformTokens('css'),
  dark.getPlatformTokens('css'),
]);
await Promise.all(['dist/json', 'dist/ts', 'dist/figma'].map((d) => fs.mkdir(d, { recursive: true })));
await fs.writeFile('dist/json/tokens.json', flatJson(lightRaw.allTokens, darkRaw.allTokens));
await fs.writeFile('dist/ts/tokens.ts', tsModule(lightCss.allTokens, darkCss.allTokens));
await fs.writeFile('dist/figma/variables.json', figmaJson(lightRaw.allTokens, darkRaw.allTokens));

const darkCount = darkRaw.allTokens.filter((t) => /color\.dark/.test(t.filePath)).length;
console.log(`tokens: ${lightRaw.allTokens.length} light + ${darkCount} dark → dist/`);
