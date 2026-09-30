// Emitters for the non-CSS outputs. Each takes Style Dictionary token arrays
// (`allTokens` from getPlatformTokens) and returns file contents as a string.
import { HEADER, ROOT, cleanPath, cssName, dotName, figmaName, isUnitValue } from './hooks.js';

/** Figma variable scopes by public name (first match wins). [] = hidden from every picker. */
const SCOPES = [
  [/^color\/(text|link)\//, ['TEXT_FILL']],
  [/^color\/icon\//, ['SHAPE_FILL']],
  [/^color\/border\//, ['STROKE_COLOR']],
  [/^(color\/background|elevation\/surface)\//, ['FRAME_FILL', 'SHAPE_FILL']],
  [/^elevation\/shadow\//, ['EFFECT_COLOR']],
  [/^color\//, ['ALL_FILLS', 'STROKE_COLOR', 'EFFECT_COLOR']], // primitives
  [/^dimension\/space\//, ['GAP']],
  [/^dimension\/(size|breakpoint)\//, ['WIDTH_HEIGHT']],
  [/^dimension\/radius\/shape\//, []],
  [/^dimension\/radius\//, ['CORNER_RADIUS']],
  [/^(dimension\/border|border\/width)\//, ['STROKE_FLOAT']],
  [/^typography\/size\//, ['FONT_SIZE']],
  [/^typography\/lineHeight\//, ['LINE_HEIGHT']],
  [/^typography\/weight\//, ['FONT_WEIGHT']],
  [/^(typography|font)\/family\//, ['FONT_FAMILY']],
  [/^opacity\//, ['OPACITY']],
  [/^layout\/(breakpoint|container)\//, ['WIDTH_HEIGHT']],
  [/^layout\/(grid\/(gutter|margin)|section)\//, ['GAP']],
];
const scopesFor = (name) => SCOPES.find(([re]) => re.test(name))?.[1] ?? [];
/** Figma font family / style names for the token stacks and weights. */
const FIGMA_FAMILY = { 'Inter Variable': 'Inter', 'Geist Mono': 'Geist Mono', Lora: 'Lora', 'Noto Sans JP': 'Noto Sans JP' };
const FIGMA_STYLE = {
  Inter: { 400: 'Regular', 500: 'Medium', 600: 'Semi Bold', 700: 'Bold' },
  'Geist Mono': { 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold' },
  Lora: { 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold' },
  'Noto Sans JP': { 400: 'Regular', 500: 'Medium', 600: 'Bold', 700: 'Bold' },
};

const setOf = (t) => t.filePath.replace(/^.*tokens\//, '').replace(/\.json$/, '');
const isDark = (t) => /color\.dark/.test(t.filePath);
const refOf = (t) => {
  const v = t.original?.$value;
  return typeof v === 'string' && /^\{.*\}$/.test(v) ? v.replace(`.${ROOT}}`, '}') : undefined;
};
const refPath = (ref) => ref.slice(1, -1).split('.');

/* ---------- flat JSON: one entry per public name, themed values side by side ---------- */
export function flatJson(lightRaw, darkRaw) {
  const dark = new Map(darkRaw.filter(isDark).map((t) => [dotName(t.path), t]));
  const out = {};
  for (const t of lightRaw) {
    const name = dotName(t.path);
    const d = dark.get(name);
    const entry = { $type: t.$type, $set: setOf(t) };
    if (d) {
      entry.$value = { light: t.$value, dark: d.$value };
      const refs = { light: refOf(t), dark: refOf(d) };
      if (refs.light || refs.dark) entry.$ref = refs;
    } else {
      entry.$value = t.$value;
      const r = refOf(t);
      if (r) entry.$ref = r;
    }
    if (t.$description) entry.$description = t.$description;
    if (t.$extensions) entry.$extensions = t.$extensions;
    out[name] = entry;
  }
  return JSON.stringify({ $comment: HEADER.join(' '), tokens: out }, null, 2) + '\n';
}

/* ---------- TypeScript: nested `as const` objects, `$root` becomes DEFAULT (Tailwind convention) ---------- */
function nest(tokens) {
  const obj = {};
  for (const t of tokens) {
    const segs = t.path.map((s) => (s === ROOT ? 'DEFAULT' : s));
    let node = obj;
    for (const s of segs.slice(0, -1)) node = node[s] ??= {};
    node[segs.at(-1)] = t.$value;
  }
  return obj;
}
export function tsModule(lightCss, darkCss) {
  const pick = (re) => lightCss.filter((t) => re.test(t.filePath));
  const json = (o) => JSON.stringify(o, null, 2);
  return [
    `// ${HEADER.join('\n// ')}`,
    '',
    `export const primitives = ${json(nest(pick(/primitives\//)))} as const;`,
    '',
    `export const semantic = ${json(nest(pick(/semantic\/(typography|layout|border)/)))} as const;`,
    '',
    'export const color = {',
    `  light: ${json(nest(pick(/color\.light/))).replace(/\n/g, '\n  ')},`,
    `  dark: ${json(nest(darkCss.filter(isDark))).replace(/\n/g, '\n  ')},`,
    '} as const;',
    '',
    'export type Theme = keyof typeof color;',
    'export type Tokens = { primitives: typeof primitives; semantic: typeof semantic; color: typeof color };',
    '',
  ].join('\n');
}

/* ---------- Figma: collections / modes / variables + text & effect styles, consumed by the PF-10 script ---------- */
function toVariable(t) {
  const v = t.$value;
  switch (t.$type) {
    case 'color': return { type: 'COLOR', value: v };
    case 'number':
      // Figma binds layer opacity on a 0–100 scale; the token is 0–1.
      if (t.path[0] === 'opacity') return { type: 'FLOAT', value: Math.round(v * 100), unit: '%' };
      return { type: 'FLOAT', value: v };
    case 'fontWeight': return { type: 'FLOAT', value: v };
    case 'dimension':
      return isUnitValue(v) && v.unit === 'px' ? { type: 'FLOAT', value: v.value }
        : { skip: `dimension unit "${v?.unit}" has no Figma variable equivalent` };
    case 'duration': return { type: 'FLOAT', value: v.unit === 's' ? v.value * 1000 : v.value, unit: 'ms' };
    case 'string': return { type: 'STRING', value: v };
    case 'fontFamily': { // Figma family name for the first family in the stack (Inter Variable → Inter)
      const first = Array.isArray(v) ? v[0] : v;
      return { type: 'STRING', value: FIGMA_FAMILY[first] ?? first };
    }
    case 'cubicBezier': return { skip: 'Figma has no easing variable type' };
    default: return { skip: `type ${t.$type} is exported as a style, not a variable` };
  }
}
const textStyle = (t) => {
  const v = t.$value;
  const ls = v.letterSpacing;
  return {
    name: figmaName(t.path),
    fontFamily: Array.isArray(v.fontFamily) ? v.fontFamily : [v.fontFamily],
    fontSize: v.fontSize.value,
    lineHeight: isUnitValue(v.lineHeight) ? { unit: 'PIXELS', value: v.lineHeight.value }
      : { unit: 'PERCENT', value: v.lineHeight * 100 },
    letterSpacing: ls.unit === 'em' ? { unit: 'PERCENT', value: ls.value * 100 } : { unit: 'PIXELS', value: ls.value },
    fontWeight: v.fontWeight,
    figmaFont: (() => {
      const family = FIGMA_FAMILY[(Array.isArray(v.fontFamily) ? v.fontFamily : [v.fontFamily])[0]] ?? 'Inter';
      return { family, style: FIGMA_STYLE[family]?.[v.fontWeight] ?? 'Regular' };
    })(),
    codeSyntax: `var(--${cssName(t.path)}-font-size)`,
    description: t.$description ?? '',
  };
};
const effectStyle = (t) => ({
  name: figmaName(t.path),
  description: t.$description ?? '',
  codeSyntax: `var(--${cssName(t.path)})`,
  effects: t.$value.map((l, i) => ({
    type: l.inset ? 'INNER_SHADOW' : 'DROP_SHADOW',
    color: l.color,
    colorVariable: `${figmaName(t.path)}/layer${i + 1}`,
    offset: { x: l.offsetX.value, y: l.offsetY.value },
    radius: l.blur.value,
    spread: l.spread.value,
  })),
});
/** Shadow layer colors as themed COLOR variables, so one effect style follows light / dark. */
const shadowLayerVariables = (t, d) =>
  t.$value.map((l, i) => ({
    name: `${figmaName(t.path)}/layer${i + 1}`,
    type: 'COLOR',
    description: `${t.$description ?? ''} (layer ${i + 1})`.trim(),
    scopes: ['EFFECT_COLOR'],
    codeSyntax: `var(--${cssName(t.path)})`,
    values: { light: l.color, dark: d.$value[i].color },
  }));

export function figmaJson(lightRaw, darkRaw) {
  const dark = new Map(darkRaw.filter(isDark).map((t) => [dotName(t.path), t]));
  const collections = {
    primitives: { name: 'primitives', modes: ['value'], variables: [] },
    semantic: { name: 'semantic', modes: ['value'], variables: [] },
    color: { name: 'color', modes: ['light', 'dark'], variables: [] },
  };
  const textStyles = [];
  const effectStyles = { light: [], dark: [] };
  const skipped = [];
  const names = new Set();
  const valueOrAlias = (t, conv) => {
    const r = refOf(t);
    return r ? { alias: figmaName(refPath(r)) } : conv.value;
  };
  for (const t of lightRaw) {
    const name = figmaName(t.path);
    if (t.$type === 'typography') { textStyles.push(textStyle(t)); continue; }
    if (t.$type === 'shadow') {
      const d = dark.get(dotName(t.path));
      effectStyles.light.push(effectStyle(t));
      effectStyles.dark.push(effectStyle(d));
      for (const v of shadowLayerVariables(t, d)) { collections.color.variables.push(v); names.add(v.name); }
      continue;
    }
    const conv = toVariable(t);
    if (conv.skip) { skipped.push({ name, reason: conv.skip }); continue; }
    const set = setOf(t);
    const col = set.startsWith('primitives/') ? collections.primitives
      : set === 'semantic/color.light' ? collections.color : collections.semantic;
    const variable = {
      name, type: conv.type, description: t.$description ?? '',
      scopes: scopesFor(name), codeSyntax: `var(--${cssName(t.path)})`,
    };
    if (conv.unit) variable.unit = conv.unit;
    if (col === collections.color) {
      const d = dark.get(dotName(t.path));
      variable.values = { light: valueOrAlias(t, conv), dark: valueOrAlias(d, toVariable(d)) };
    } else {
      variable.values = { value: valueOrAlias(t, conv) };
    }
    col.variables.push(variable);
    names.add(name);
  }
  // Aliases must point at variables that exist (skipped targets would break the PF-10 script).
  for (const col of Object.values(collections)) {
    for (const v of col.variables) {
      for (const val of Object.values(v.values)) {
        if (val && typeof val === 'object' && 'alias' in val && !names.has(val.alias)) {
          throw new Error(`figma: ${v.name} aliases ${val.alias}, which is not exported as a variable`);
        }
      }
    }
  }
  return JSON.stringify({
    $schema: 'aristocraft/figma-variables@1',
    $comment: HEADER.join(' '),
    collections: Object.values(collections),
    textStyles,
    effectStyles,
    skipped,
  }, null, 2) + '\n';
}
