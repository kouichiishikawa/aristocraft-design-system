// Prints the `use_figma` script that builds the "Palette" page: every primitive colour as a swatch bound to its
// Primitives variable, annotated with step · hex · OKLCH · WCAG contrast on neutral 50 / 950.
//   node figma/palette-stage.js > /tmp/palette.js   → paste into use_figma (one call, < 50k chars)
// Source of truth: tokens/primitives/color.json (hex, $description, ac.oklch). Contrast is computed here (WCAG 2.2);
// alpha steps are composited onto their intended ground (light 100a–400a on neutral 50, dark 600a–900a on neutral 950).
// Re-running keeps the previous frame as "Palette (old)" for manual deletion (scripts never delete, see docs/pf-10-figma.md).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { figmaName } from '../build/figma-name.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { color } = JSON.parse(fs.readFileSync(path.join(ROOT, 'tokens/primitives/color.json'), 'utf8'));

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const lum = ([r, g, b]) => [r, g, b].map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)).reduce((s, c, i) => s + c * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a, b) => { const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x); return ((l1 + 0.05) / (l2 + 0.05)).toFixed(2); };
const over = (fg, alpha, bg) => fg.map((c, i) => c * alpha + bg[i] * (1 - alpha));
const fmt = (n) => (n === 0 || n === 1 ? String(n) : n.toFixed(3).replace(/^0/, '').replace(/0+$/, ''));

const G50 = rgb(color.neutral['50'].$value), G950 = rgb(color.neutral['950'].$value);
const steps = (hue) => Object.keys(color[hue]).filter((k) => !k.startsWith('$'));
const swatch = (hue, step) => {
  const t = color[hue][step];
  const hex = t.$value.toUpperCase();
  const base = { var: figmaName(['color', hue, step]), step, hex };
  if (hex.length === 9) {
    // alpha: "neutral.950 （light）α 11.6%。neutral.50 上で neutral.100 と一致（合成 #DDDBD9）"
    const alpha = parseInt(hex.slice(7), 16) / 255;
    const light = /light/.test(t.$description);
    const [bgVar, bg] = light ? ['Color/Neutral/50', G50] : ['Color/Neutral/950', G950];
    const composite = t.$description.match(/合成 (#[0-9A-Fa-f]{6})/)?.[1] ?? '';
    const designed = t.$extensions['ac.alpha'] ?? alpha; // show the designed alpha (11.6%), not the 8-bit rounding (11.8%)
    return { ...base, bg: bgVar, lch: `α ${(designed * 100).toFixed(1)}% → ${composite.toUpperCase()}`, ratio: `on ${light ? 50 : 950} ${contrast(over(rgb(hex), alpha, bg), bg)}` };
  }
  const { l, c, h } = t.$extensions['ac.oklch'];
  return { ...base, lch: `L ${fmt(l)} C ${fmt(c)} H ${h}`, ratio: `50 ${contrast(rgb(hex), G50)} · 950 ${contrast(rgb(hex), G950)}` };
};

const hues = [];
for (const hue of Object.keys(color)) {
  const all = steps(hue);
  const solid = all.filter((s) => !s.endsWith('a')), alpha = all.filter((s) => s.endsWith('a'));
  const meta = color[hue].$description ?? '';
  hues.push({ name: figmaName([hue]), meta: `${meta} · ${solid.length} steps`, swatches: solid.map((s) => swatch(hue, s)) });
  if (alpha.length) hues.push({ name: `${figmaName([hue])} Alpha`, meta: `neutral 950 / 50 at reduced opacity · ${alpha.length} steps`, swatches: alpha.map((s) => swatch(hue, s)) });
}
const total = hues.reduce((n, h) => n + h.swatches.length, 0);
const data = {
  hues,
  total,
  cell: 136, swatchH: 64, gap: 8, pad: 64,
  date: new Date().toISOString().slice(0, 10),
  intro: `Primitive の色 ${total}。正本は packages/tokens/tokens/primitives/color.json、塗りは Primitives の Color/* 変数に束縛。各見本: 段 · Hex · OKLCH（L / C / H）· WCAG 2.2 コントラスト比（neutral 50 上 · neutral 950 上）。alpha 段は下地に合成した色の比。本文 4.5 / UI 3.0 が AA。生成: packages/tokens/figma/palette-stage.js（${new Date().toISOString().slice(0, 10)}）`,
};

const script = String.raw`
const data = __DATA__;
const out = { pageId: null, frameId: null, swatches: 0, bound: 0, missingVars: [], renamed: null };
let page = figma.root.children.find((p) => p.name === 'Palette');
if (!page) { page = figma.createPage(); page.name = 'Palette'; }
await figma.setCurrentPageAsync(page);
out.pageId = page.id;

const vars = await figma.variables.getLocalVariablesAsync();
const v = (name) => { const x = vars.find((y) => y.name === name); if (!x) out.missingVars.push(name); return x; };
const styles = Object.fromEntries((await figma.getLocalTextStylesAsync()).map((s) => [s.name, s]));
const S = { title: styles['Font/Heading/XXL'], body: styles['Font/Body/SM'], label: styles['Font/Label/SM'], mono: styles['Font/Label/Mono/XS'] };
for (const s of Object.values(S)) await figma.loadFontAsync(s.fontName);
const C = { text: v('Color/Text/Default'), subtle: v('Color/Text/Subtle'), subtlest: v('Color/Text/Subtlest'), surface: v('Elevation/Surface/Default') };
const radius = v('Dimension/Radius/200');
if (out.missingVars.length) return out;

const paint = (variable) => figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', variable);
const text = (chars, style, colorVar, width) => {
  const t = figma.createText();
  t.textStyleId = style.id;
  t.characters = chars; t.name = chars;
  t.fills = [paint(colorVar)];
  if (width) { t.textAutoResize = 'HEIGHT'; t.resize(width, t.height); }
  return t;
};
const column = (name, gap) => { const f = figma.createFrame(); f.name = name; f.layoutMode = 'VERTICAL'; f.itemSpacing = gap; f.fills = []; f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'AUTO'; return f; };
const row = (name, gap) => { const f = column(name, gap); f.layoutMode = 'HORIZONTAL'; return f; };
const roundCorners = (n) => { for (const k of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) n.setBoundVariable(k, radius); };

// Previous run: keep it, renamed, for manual deletion.
const prev = page.children.find((n) => n.name === 'Palette');
if (prev) { prev.name = 'Palette (old)'; out.renamed = prev.id; }
const right = page.children.reduce((m, n) => Math.max(m, n.x + n.width), -200);

const width = data.pad * 2 + data.cell * 13 + data.gap * 12;
const root = column('Palette', 48);
root.x = right + 200; root.y = 0;
root.paddingTop = root.paddingRight = root.paddingBottom = root.paddingLeft = data.pad;
root.fills = [paint(C.surface)];
root.resize(width, 100); root.counterAxisSizingMode = 'FIXED'; root.primaryAxisSizingMode = 'AUTO';
out.frameId = root.id;

const header = column('Header', 8);
root.appendChild(header); header.layoutSizingHorizontal = 'FILL';
header.appendChild(text('Palette', S.title, C.text));
const intro = text(data.intro, S.body, C.subtle, width - data.pad * 2);
header.appendChild(intro); intro.layoutSizingHorizontal = 'FILL';

for (const hue of data.hues) {
  const section = column(hue.name, 16);
  root.appendChild(section); section.layoutSizingHorizontal = 'FILL';
  const label = row('Label', 12); label.counterAxisAlignItems = 'BASELINE';
  section.appendChild(label);
  label.appendChild(text(hue.name, S.label, C.text));
  label.appendChild(text(hue.meta, S.mono, C.subtlest));
  const r = row('Row', data.gap);
  section.appendChild(r);
  for (const sw of hue.swatches) {
    const variable = v(sw.var);
    if (!variable) continue;
    const cell = column(sw.step, 6);
    r.appendChild(cell);
    cell.resize(data.cell, 10); cell.counterAxisSizingMode = 'FIXED'; cell.primaryAxisSizingMode = 'AUTO';
    let face;
    if (sw.bg) {
      // alpha: ground frame bound to neutral 50 / 950, colour rectangle on top
      face = figma.createFrame(); face.name = 'Ground'; face.resize(data.cell, data.swatchH); face.clipsContent = true;
      face.fills = [paint(v(sw.bg))];
      const rect = figma.createRectangle(); rect.name = 'Swatch'; rect.resize(data.cell, data.swatchH);
      rect.fills = [paint(variable)];
      face.appendChild(rect); rect.x = 0; rect.y = 0;
    } else {
      face = figma.createRectangle(); face.name = 'Swatch'; face.resize(data.cell, data.swatchH);
      face.fills = [paint(variable)];
    }
    roundCorners(face);
    cell.appendChild(face);
    cell.appendChild(text(sw.step, S.label, C.text, data.cell));
    cell.appendChild(text(sw.hex, S.mono, C.subtle, data.cell));
    cell.appendChild(text(sw.lch, S.mono, C.subtlest, data.cell));
    cell.appendChild(text(sw.ratio, S.mono, C.subtlest, data.cell));
    out.swatches++; out.bound++;
  }
}
out.expected = data.total;
return out;`;

process.stdout.write(script.replace('__DATA__', JSON.stringify(data)));
