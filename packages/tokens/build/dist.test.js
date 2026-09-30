// Checks the generated dist/ (run after `npm run build`): `node --test build/`
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const css = {
  primitives: read('dist/css/primitives.css'),
  semantic: read('dist/css/semantic.css'),
  light: read('dist/css/color.light.css'),
  dark: read('dist/css/color.dark.css'),
  all: read('dist/css/tokens.css'),
};
const declared = (s) => [...s.matchAll(/^\s*(--[a-z0-9-]+):/gm)].map((m) => m[1]);
const flat = JSON.parse(read('dist/json/tokens.json')).tokens;
const figma = JSON.parse(read('dist/figma/variables.json'));

test('css has no leaked objects, references, $root or $ signs', () => {
  for (const [name, s] of Object.entries(css)) {
    assert.doesNotMatch(s, /\[object Object\]/, `${name}: object leaked`);
    assert.doesNotMatch(s, /\{[a-z]/, `${name}: unresolved {reference}`);
    assert.doesNotMatch(s, /-root:/, `${name}: $root leaked into a name`);
    assert.doesNotMatch(s, /\$/, `${name}: $ in output`);
    assert.doesNotMatch(s, /NaN|undefined/, `${name}: NaN/undefined`);
  }
});

test('every var(--x) used in css is declared in tokens.css', () => {
  const defined = new Set(declared(css.all));
  const used = new Set([...css.all.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]));
  const missing = [...used].filter((v) => !defined.has(v));
  assert.deepEqual(missing, []);
});

test('css counts: 272 primitives, light and dark declare the same names twice for dark', () => {
  assert.equal(declared(css.primitives).length, 272);
  const l = declared(css.light);
  const d = declared(css.dark);
  assert.equal(l.length, 191);
  assert.equal(d.length, 382, 'dark = data-theme block + prefers-color-scheme block');
  assert.deepEqual([...new Set(d)].sort(), [...l].sort());
  assert.match(css.dark, /\[data-theme="dark"\]/);
  assert.match(css.dark, /@media \(prefers-color-scheme: dark\)/);
});

test('flat json: 524 public names (dark merged as a mode), themed entries carry light and dark', () => {
  const names = Object.keys(flat);
  assert.equal(names.length, 524);
  assert.ok(!names.some((n) => n.includes('$root')));
  const themed = names.filter((n) => flat[n].$set === 'semantic/color.light');
  assert.equal(themed.length, 191);
  for (const n of themed) assert.deepEqual(Object.keys(flat[n].$value), ['light', 'dark'], n);
  assert.equal(flat['color.text.brand'].$ref.light, '{color.blue.700}');
  assert.ok(figma.collections.some((c) => c.variables.some((v) => v.name === 'Color/Text/Brand')), 'Figma names are Title Case');
});

test('figma json: aliases resolve, styles and skips are accounted for', () => {
  const names = new Set(figma.collections.flatMap((c) => c.variables.map((v) => v.name)));
  for (const c of figma.collections) {
    for (const v of c.variables) {
      assert.deepEqual(Object.keys(v.values), c.modes, v.name);
      for (const val of Object.values(v.values)) {
        if (val && typeof val === 'object') assert.ok(names.has(val.alias), `${v.name} → ${val.alias}`);
      }
    }
  }
  assert.deepEqual(figma.collections.map((c) => c.name), ['Primitives', 'Semantic - Typography', 'Semantic - Layout', 'Semantic - Border', 'Semantic - Color']);
  assert.equal(figma.textStyles.length, 24);
  assert.equal(figma.effectStyles.light.length, 4);
  assert.equal(figma.effectStyles.dark.length, 4);
  const layerVars = [...names].filter((n) => /^Elevation\/Shadow\/.*\/Layer \d$/.test(n)).length;
  assert.equal(layerVars, 8, 'shadow layers become themed colour variables');
  const total = names.size - layerVars + figma.textStyles.length + figma.effectStyles.light.length + figma.skipped.length;
  assert.equal(total, 524, 'every public name is a variable, a style, or an explicit skip');
  for (const c of figma.collections) for (const v of c.variables) {
    assert.ok(Array.isArray(v.scopes), `${v.name} scopes`);
    assert.match(v.codeSyntax, /^var\(--[a-z0-9-]+\)$/, `${v.name} codeSyntax`);
  }
  for (const s of figma.textStyles) assert.ok(s.figmaFont.family && s.figmaFont.style, s.name);
  for (const s of figma.effectStyles.light) for (const e of s.effects) assert.ok(names.has(e.colorVariable), e.colorVariable);
});

test('typescript module loads and mirrors the css values', async () => {
  const mod = await import(path.join(ROOT, 'dist/ts/tokens.ts'));
  assert.equal(mod.color.light.color.text.brand.DEFAULT, mod.primitives.color.blue['700']);
  assert.equal(mod.color.light.color.text.brand.bold, mod.primitives.color.blue['800']);
  assert.equal(mod.primitives.dimension.space['100'], '4px');
  assert.equal(mod.primitives.typography.letterSpacing.sm, '-0.02em');
  assert.equal(mod.semantic.layout.container.full, '100%');
  assert.equal(mod.semantic.font.heading.md.letterSpacing, '0em');
  assert.equal(typeof mod.semantic.layout.grid.columns.lg, 'number');
  assert.equal(mod.color.dark.elevation.surface.default, mod.primitives.color.neutral['950']);
});
