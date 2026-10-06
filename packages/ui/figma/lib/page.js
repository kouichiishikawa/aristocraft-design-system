// Shared `use_figma` snippet for the component page template (decision 2026-10-06, v2 after review):
//   Header            — _Doc/Header instance spanning the columns: brand rule, system name + Storybook link, Title, Summary, Status / Updated
//   Column "Example"    — SECTION: _Doc/Banner, then "Mode: Light" / "Mode: Dark" example frames (same rows; the dark frame sets the Dark mode)
//   Column "Components" — SECTION: _Doc/Banner, _Doc/Chip with the set name, the set itself with _Doc/Axis row / column labels
//   Column "Parts"      — SECTION: _Doc/Banner, one _Doc/Chip + instance per internal part (omitted when the component has none)
// Parts = Figma-only building blocks that are not design-system components themselves (Spinner / Focus Ring have their own pages → not parts).
// A *-doc-stage.js script embeds PAGE_LIB and calls `await buildComponentPage(spec)`:
//   spec = { page, set, header: { status, title, summary, updated, storybook }, example: [[{ variant, props }, …], …],
//            parts: [{ label, set, variant, props }], axes: { rows: [[label, y]], cols: [[label, x]] } }
// Existing Header / sections with the same names are renamed "(old)" (scripts never delete).
export const PAGE_LIB = String.raw`
const __vars = await figma.variables.getLocalVariablesAsync();
const __v = (name) => { const x = __vars.find((y) => y.name === name); if (!x) throw new Error('variable missing: ' + name); return x; };
const __paint = (name) => figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', __v(name));
const __docPage = figma.root.children.find((p) => p.name === '_Doc');
const __docIndex = async () => { await figma.setCurrentPageAsync(__docPage); return Object.fromEntries(__docPage.children.filter((n) => n.name.startsWith('_Doc/')).map((n) => [n.name, n])); };
const __propKey = (node, name) => Object.keys(node.componentProperties ?? {}).find((k) => k === name || k.startsWith(name + '#'));
const __setProps = (inst, props) => { const p = {}; for (const [k, val] of Object.entries(props || {})) { const key = __propKey(inst, k); if (key) p[key] = val; } if (Object.keys(p).length) inst.setProperties(p); };
const __instance = (doc, name, variant, props) => {
  const c = doc[name]; if (!c) throw new Error('block missing: ' + name);
  const main = c.type === 'COMPONENT_SET' ? c.children.find((x) => x.name === variant) : c;
  if (!main) throw new Error(name + ' has no variant ' + variant);
  const inst = main.createInstance(); __setProps(inst, props); return inst;
};
const __variantInstance = (set, variant, props) => { const main = set.type === 'COMPONENT_SET' ? set.children.find((c) => c.name === variant) : set; if (!main) throw new Error('variant missing: ' + variant); const inst = main.createInstance(); __setProps(inst, props); return inst; };
// Component sets live on lazily loaded pages (possibly nested in a section): open each page once to resolve them by name.
const __resolveSets = async (names) => {
  const found = {};
  for (const p of figma.root.children) {
    if (Object.keys(found).length === names.size) break;
    await figma.setCurrentPageAsync(p);
    for (const n of names) if (!found[n]) { const hit = p.findOne((x) => (x.type === 'COMPONENT_SET' || x.type === 'COMPONENT') && x.name === n); if (hit) found[n] = hit; }
  }
  for (const n of names) if (!found[n]) throw new Error('component missing: ' + n);
  return found;
};
const __frame = (name, dir, gapTok) => { const f = figma.createFrame(); f.name = name; f.layoutMode = dir; f.fills = []; f.clipsContent = false; f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'AUTO'; if (gapTok) f.setBoundVariable('itemSpacing', __v(gapTok)); return f; };
const __retire = (page, pred) => { const ids = []; for (const n of page.children.filter(pred)) { n.name = n.name + ' (old)'; ids.push(n.id); } return ids; };
const __section = (name, x, y, w, h) => { const s = figma.createSection(); s.name = name; s.x = x; s.y = y; s.resizeWithoutConstraints(w, h); s.fills = [__paint('Elevation/Surface/Default')]; return s; };
const PAD = 48, COL_GAP = 48, HEAD_GAP = 64, BLOCK_GAP = 40, LABEL_GAP = 12, AXIS_W = 80;
// A column: banner on top, then blocks (each = { chip, node }) stacked; returns the section (height fitted).
const __column = (page, doc, name, x, y, innerW, banner, blocks) => {
  const s = __section(name, x, y, innerW + PAD * 2, 100); page.appendChild(s);
  const b = __instance(doc, '_Doc/Banner', null, banner); s.appendChild(b); b.x = PAD; b.y = PAD; b.resize(innerW, b.height);
  let cy = PAD + b.height + BLOCK_GAP;
  for (const blk of blocks) {
    if (blk.chip) { const c = __instance(doc, '_Doc/Chip', null, { Text: blk.chip }); s.appendChild(c); c.x = PAD + (blk.chipX ?? 0); c.y = cy; cy += c.height + LABEL_GAP; }
    cy += blk.before ?? 0;
    s.appendChild(blk.node); blk.node.x = PAD + (blk.x ?? 0); blk.node.y = cy;
    if (blk.after) blk.after(blk.node);
    cy += blk.node.height + (blk.gap ?? BLOCK_GAP);
  }
  s.resizeWithoutConstraints(innerW + PAD * 2, cy - (blocks.length ? (blocks[blocks.length - 1].gap ?? BLOCK_GAP) : 0) + PAD);
  return s;
};
// Example frame: surface + subtle border, rows of instances. mode = 'Light' | 'Dark' (explicit Semantic - Color mode).
const __exampleFrame = async (name, set, rows, mode) => {
  const f = __frame(name, 'VERTICAL', 'Dimension/Space/600'); f.fills = [__paint('Elevation/Surface/Default')];
  f.strokes = [__paint('Color/Border/Subtle')]; f.strokeAlign = 'INSIDE'; f.strokeWeight = 1;
  for (const k of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) f.setBoundVariable(k, __v('Dimension/Radius/300'));
  for (const k of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']) f.setBoundVariable(k, __v('Dimension/Space/800'));
  for (const row of rows) { const r = __frame('Row', 'HORIZONTAL', 'Dimension/Space/400'); r.counterAxisAlignItems = 'CENTER'; f.appendChild(r); for (const e of row) r.appendChild(__variantInstance(set, e.variant, e.props)); }
  if (mode === 'Dark') { const col = (await figma.variables.getLocalVariableCollectionsAsync()).find((c) => c.name === 'Semantic - Color'); const m = col.modes.find((x) => x.name === 'Dark'); f.setExplicitVariableModeForCollection(col, m.modeId); }
  return f;
};
async function buildComponentPage(spec) {
  const names = new Set([spec.set, ...(spec.parts ?? []).map((p) => p.set)]);
  const sets = await __resolveSets(names);
  const doc = await __docIndex();
  const page = figma.root.children.find((p) => p.name === spec.page); if (!page) throw new Error('page missing: ' + spec.page);
  await figma.setCurrentPageAsync(page);
  const out = { renamed: [] };
  out.renamed.push(...__retire(page, (n) => ((n.type === 'FRAME' || n.type === 'INSTANCE') && (n.name === 'Header' || n.name === spec.page)) || (n.type === 'SECTION' && ['Example', 'Components', 'Parts'].includes(n.name)) || n.name === 'Axes'));
  const set = sets[spec.set];
  const h = spec.header;
  // --- Example column
  const light = await __exampleFrame('Light', set, spec.example ?? [], 'Light');
  const dark = await __exampleFrame('Dark', set, spec.example ?? [], 'Dark');
  page.appendChild(light); page.appendChild(dark);
  const exW = Math.max(560, light.width, dark.width);
  const fit = (n) => { n.layoutSizingHorizontal = 'FIXED'; n.resize(exW, n.height); };
  // --- Components column: chip + set (room for row axis labels on the left)
  const compInnerW = AXIS_W + set.width;
  // --- Parts column
  const parts = (spec.parts ?? []).map((p) => { const inst = __variantInstance(sets[p.set], p.variant, p.props); inst.layoutSizingHorizontal = 'FIXED'; inst.layoutSizingVertical = 'FIXED'; return { chip: p.label, node: inst }; });
  const partsInnerW = parts.length ? Math.max(320, ...parts.map((p) => p.node.width)) : 0;
  const totalW = (exW + PAD * 2) + COL_GAP + (compInnerW + PAD * 2) + (parts.length ? COL_GAP + partsInnerW + PAD * 2 : 0);
  // --- Header
  const header = __instance(doc, '_Doc/Header', 'Status=' + (h.status ?? 'Draft'), { Title: h.title, Summary: h.summary, Updated: h.updated, Storybook: 'Storybook ↗' });
  page.appendChild(header); header.name = 'Header'; header.x = 0; header.y = 0; header.resize(totalW, header.height);
  if (h.storybook) { const t = header.findOne((n) => n.type === 'TEXT' && n.name === 'Storybook'); if (t) { await figma.loadFontAsync(t.fontName); t.hyperlink = { type: 'URL', value: h.storybook }; } }
  let x = 0; const y = header.height + HEAD_GAP;
  const ex = __column(page, doc, 'Example', x, y, exW, { Title: 'Example', Description: 'そのまま貼って使える作例。Light / Dark はモードで切り替わる。' }, [
    { chip: 'Mode: Light', node: light, after: fit, gap: BLOCK_GAP },
    { chip: 'Mode: Dark', node: dark, after: fit },
  ]);
  x += ex.width + COL_GAP;
  const A = spec.axes;
  const comps = __column(page, doc, 'Components', x, y, compInnerW, { Title: 'Components', Description: 'このコンポーネントの全 variant。縦 = 種類、横 = state。' }, [
    { chip: spec.set, node: set, x: AXIS_W, before: 24, after: (n) => {
      if (!A) return;
      for (const [label, cx] of A.cols) { const t = __instance(doc, '_Doc/Axis', null, { Text: label }); n.parent.appendChild(t); t.x = n.x + cx; t.y = n.y - 20; }
      for (const [label, ry] of A.rows) { const t = __instance(doc, '_Doc/Axis', null, { Text: label }); n.parent.appendChild(t); t.x = n.x - t.width - LABEL_GAP; t.y = n.y + ry; }
    } },
  ]);
  x += comps.width + COL_GAP;
  out.header = header.id; out.example = ex.id; out.components = comps.id; out.width = totalW;
  if (parts.length) {
    const ps = __column(page, doc, 'Parts', x, y, partsInnerW, { Title: 'Parts', Description: 'このコンポーネントを組み立てるための Figma 専用の部品。単体のコンポーネントではない。' }, parts);
    out.parts = ps.id;
  }
  return out;
}`;
