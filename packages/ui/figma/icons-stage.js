// Prints the `use_figma` script that creates the icon library in Figma from icons.json:
//   node figma/icons-stage.js icons 1/2   → icon/* components (Lucide, strokes outlined into one filled vector bound to color/icon/default)
//   node figma/icons-stage.js icons 2/2
//   node figma/icons-stage.js brand       → brand/* components (Simple Icons, fills bound to color/icon/default)
//   node figma/icons-stage.js wrapper     → "Icon" component set: size sm/md/lg/xl (bound to dimension/size) + instance swap
// Idempotent: existing components are matched by name and left in place.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { BRAND_TITLES, SIZE_WORDS, figmaSegment } from '@aristocraft/tokens/figma-name';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'icons.json'), 'utf8'));
const [stage, partSpec = '1/1'] = process.argv.slice(2);
const [part, parts] = partSpec.split('/').map(Number);

const lucideSvg = (name) => fs.readFileSync(require.resolve(`lucide-static/icons/${name}.svg`), 'utf8')
  .replace(/<!--[\s\S]*?-->\s*/g, '').replace(/\s*class="[^"]*"/, '').replace(/\s+/g, ' ').trim();
// Brand glyphs are drawn edge to edge; show them at 20/24 so they sit optically with Lucide (same as BrandIcon).
const BRAND_VIEWBOX = '-2.4 -2.4 28.8 28.8';
const brandSvg = (name) => {
  const custom = path.join(ROOT, 'icons/brand', `${name}.json`);
  const g = fs.existsSync(custom) ? JSON.parse(fs.readFileSync(custom, 'utf8')) : require('simple-icons')[`si${name[0].toUpperCase()}${name.slice(1)}`];
  const transform = g.transform ? ` transform="${g.transform}"` : '';
  return { svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="${BRAND_VIEWBOX}"><path fill="#000"${transform} d="${g.path}"/></svg>`, title: g.title, hex: g.hex, source: g.source };
};

let data;
if (stage === 'icons') {
  const names = Object.values(manifest.lucide.groups).flat();
  const size = Math.ceil(names.length / parts);
  data = { kind: 'icons', prefix: 'Icon', license: `Lucide ${manifest.lucide.version} (ISC)`, items: names.slice((part - 1) * size, part * size).map((n) => ({ name: figmaSegment(n), svg: lucideSvg(n) })) };
} else if (stage === 'brand') {
  data = { kind: 'icons', prefix: 'Brand', license: `Simple Icons ${manifest.brand.version} (CC0)`, items: manifest.brand.icons.map((n) => ({ name: BRAND_TITLES[n] ?? figmaSegment(n), ...brandSvg(n) })) };
} else if (stage === 'wrapper') {
  data = { kind: 'wrapper', defaultIcon: 'Icon/Arrow Right', sizes: [[SIZE_WORDS.sm, 300, 12], [SIZE_WORDS.md, 400, 16], [SIZE_WORDS.lg, 500, 20], [SIZE_WORDS.xl, 600, 24]] };
} else { console.error('stage: icons [n/m] | brand | wrapper'); process.exit(1); }

const script = String.raw`
const data = __DATA__;
const out = { created: 0, updated: 0, errors: [], ids: [] };
let page = figma.root.children.find((p) => p.name === 'Icons');
if (!page) { page = figma.createPage(); page.name = 'Icons'; }
await figma.setCurrentPageAsync(page);
const vars = await figma.variables.getLocalVariablesAsync();
const v = (name) => vars.find((x) => x.name === name);
const iconColor = v('Color/Icon/Default');
const comps = new Map(page.findAll((n) => n.type === 'COMPONENT' || n.type === 'COMPONENT_SET').map((n) => [n.name, n]));

if (data.kind === 'icons') {
  const GAP = 40, COLS = 16;
  let i = [...comps.keys()].filter((k) => k.startsWith(data.prefix + '/')).length;
  for (const item of data.items) {
    const name = data.prefix + '/' + item.name;
    if (comps.has(name)) { out.updated++; continue; }
    const frame = figma.createNodeFromSvg(item.svg);
    const comp = figma.createComponentFromNode(frame);
    comp.name = name;
    comp.description = (item.title ? item.title + ' · ' : '') + (item.source ? item.source : data.license) + (item.hex ? ' · brand #' + item.hex : '');
    comp.x = (data.prefix === 'Brand' ? 900 : 0) + (i % COLS) * GAP; comp.y = Math.floor(i / COLS) * GAP; i++;
    // Figma strokes keep their weight when scaled, so outline them into one filled vector ("glyph").
    // outlineStroke() drops the node on the page with parent-relative numbers: append it back first.
    const parts = [];
    for (const child of [...comp.children]) {
      if (child.type === 'VECTOR' && child.strokes.length) {
        const o = child.outlineStroke();
        if (o) comp.appendChild(o);
        const keep = child.fills !== figma.mixed && child.fills.length > 0; // filled dots stay as parts
        if (keep) { child.strokes = []; parts.push(child); } else child.remove();
        if (o) parts.push(o);
      } else parts.push(child);
    }
    const merged = parts.length > 1 ? figma.union(parts, comp) : parts[0];
    const glyphNode = figma.flatten([merged], comp);
    glyphNode.name = 'Glyph'; glyphNode.strokes = [];
    glyphNode.fills = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', iconColor)];
    glyphNode.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
    comps.set(name, comp); out.created++; out.ids.push(comp.id);
  }
}

if (data.kind === 'wrapper') {
  if (comps.has('Icon')) { out.errors.push('Icon component set already exists; delete it to rebuild'); return out; }
  const glyph = comps.get(data.defaultIcon);
  if (!glyph) { out.errors.push(data.defaultIcon + ' missing: run the icons stage first'); return out; }
  const variants = [];
  for (const [label, token, px] of data.sizes) {
    const c = figma.createComponent();
    c.name = 'Size=' + label;
    c.resize(px, px);
    c.setBoundVariable('width', v('Dimension/Size/' + token));
    c.setBoundVariable('height', v('Dimension/Size/' + token));
    const inst = glyph.createInstance();
    c.appendChild(inst);
    inst.x = 0; inst.y = 0; inst.resize(px, px);
    inst.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
    inst.name = 'Glyph';
    variants.push(c);
  }
  const set = figma.combineAsVariants(variants, page);
  set.name = 'Icon';
  set.description = 'アイコン枠。Size は Dimension/Size 300〜600、Glyph は Icon/* と Brand/* をスワップ。コード: <Icon icon={…} size="md" />';
  set.x = 0; set.y = -200;
  const iconComps = [...comps.entries()].filter(([k]) => k.startsWith('Icon/') || k.startsWith('Brand/')).map(([, c]) => c);
  const prop = set.addComponentProperty('Glyph', 'INSTANCE_SWAP', glyph.id, { preferredValues: iconComps.map((c) => ({ type: 'COMPONENT', key: c.key })) });
  for (const c of variants) { const inst = c.findChild((n) => n.name === 'Glyph'); inst.componentPropertyReferences = { mainComponent: prop }; }
  set.children.forEach((c, idx) => { c.x = idx * 48; c.y = 0; });
  out.created = set.children.length; out.ids.push(set.id); out.property = prop; out.preferred = iconComps.length;
}
return out;`;

process.stdout.write(script.replace('__DATA__', JSON.stringify(data)));
