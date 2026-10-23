// Shared `use_figma` snippet for the component page template (v3, approved 2026-10-23). One vertical document frame
// named after the page (Surface/Default, padding Space/1600, sections Space/2400 apart, explicit Light mode):
//   Header      — _Doc/Page Header instance: System + Storybook link, Title, Summary, Status badge + Updated
//   Example     — _Doc/Section Head, then Light | Dark canvases side by side (same rows; each canvas sets its mode)
//   Components  — _Doc/Section Head, then a Grid: the set itself, State captions on top, group name (Caption Strong)
//                 and sub-row captions (e.g. "Size · Shape") in the left gutter
//   Parts       — only when the component has Figma-only building blocks (Spinner / Focus Ring have their own pages → not parts)
// Blocks come from doc-page-stage.js. A *-doc-stage.js script embeds PAGE_LIB and calls `await buildComponentPage(spec)`:
//   spec = { page, set, width, header: { status, title, summary, updated, storybook },
//            example: { description, rows: [[{ variant, props }, …], …] },
//            components: { description, grid: { cols, groups, sub: [[label, height]], colW, rowH, pad, groupStride } },
//            parts: [{ label, set, variant, props }] }
// The previous frame / v2 sections are renamed "(old)" and moved 9000 to the left (scripts never delete).
export const PAGE_LIB = String.raw`
const __vars = await figma.variables.getLocalVariablesAsync();
const __v = (name) => { const x = __vars.find((y) => y.name === name); if (!x) throw new Error('variable missing: ' + name); return x; };
const __paint = (name) => figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', __v(name));
const __docPage = figma.root.children.find((p) => p.name === '_Doc');
const __docIndex = async () => { await figma.setCurrentPageAsync(__docPage); return Object.fromEntries(__docPage.children.filter((n) => n.name.startsWith('_Doc/')).map((n) => [n.name, n])); };
const __propKey = (node, name) => Object.keys(node.componentProperties ?? {}).find((k) => k === name || k.startsWith(name + '#'));
const __setProps = (inst, props) => { const p = {}; for (const [k, val] of Object.entries(props || {})) { const key = __propKey(inst, k); if (!key) throw new Error('no prop ' + k); p[key] = val; } if (Object.keys(p).length) inst.setProperties(p); return inst; };
const __instance = (doc, name, variant, props) => {
  const c = doc[name]; if (!c) throw new Error('block missing: ' + name);
  const main = c.type === 'COMPONENT_SET' ? c.children.find((x) => x.name === variant) : c;
  if (!main) throw new Error(name + ' has no variant ' + variant);
  return __setProps(main.createInstance(), props);
};
const __variantInstance = (set, variant, props) => { const main = set.type === 'COMPONENT_SET' ? set.children.find((c) => c.name === variant) : set; if (!main) throw new Error('variant missing: ' + variant); return __setProps(main.createInstance(), props); };
// Component sets live on lazily loaded pages (possibly nested in a frame or section): open each page once to resolve them by name.
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
const __al = (name, dir, gapTok) => { const f = figma.createAutoLayout(dir, { name }); f.fills = []; f.clipsContent = false; if (gapTok) f.setBoundVariable('itemSpacing', __v(gapTok)); return f; };
const __pad = (f, tok) => { for (const k of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']) f.setBoundVariable(k, __v(tok)); };
const __radius = (f, tok) => { for (const k of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) f.setBoundVariable(k, __v(tok)); };
async function buildComponentPage(spec) {
  const names = new Set([spec.set, ...(spec.parts ?? []).map((p) => p.set)]);
  const sets = await __resolveSets(names);
  const doc = await __docIndex();
  const page = figma.root.children.find((p) => p.name === spec.page); if (!page) throw new Error('page missing: ' + spec.page);
  await figma.setCurrentPageAsync(page);
  const W = spec.width ?? 1232;
  const col = (await figma.variables.getLocalVariableCollectionsAsync()).find((c) => c.name === 'Semantic - Color');
  const mode = (name) => col.modes.find((m) => m.name === name).modeId;
  const cap = (t) => __instance(doc, '_Doc/Caption', null, { Text: t });
  const head = (h, d) => __instance(doc, '_Doc/Section Head', null, { Heading: h, Description: d });
  const set = sets[spec.set];
  // 1. retire the previous frame and v2 sections (rename "(old)", move left)
  const out = { retired: [] };
  for (const n of page.children.filter((n) => [spec.page, 'Header', 'Example', 'Components', 'Parts', 'Axes'].includes(n.name) && n.id !== set.id)) { n.name += ' (old)'; n.x -= 9000; out.retired.push(n.id); }
  // 2. document frame
  const frame = __al(spec.page, 'VERTICAL', 'Dimension/Space/2400'); page.appendChild(frame); frame.x = 0; frame.y = 0;
  frame.fills = [__paint('Elevation/Surface/Default')]; __pad(frame, 'Dimension/Space/1600');
  frame.setExplicitVariableModeForCollection(col, mode('Light'));
  // Header
  const h = spec.header;
  const header = __instance(doc, '_Doc/Page Header', 'Status=' + (h.status ?? 'Draft'), { Title: h.title, Summary: h.summary, Updated: 'Updated ' + h.updated });
  frame.appendChild(header); header.name = 'Header';
  if (h.storybook) { const t = header.findOne((n) => n.type === 'TEXT' && n.name === 'Storybook'); await figma.loadFontAsync(t.fontName); t.hyperlink = { type: 'URL', value: h.storybook }; }
  // Example: Light | Dark
  const ex = __al('Example', 'VERTICAL', 'Dimension/Space/800'); frame.appendChild(ex);
  ex.appendChild(head('Example', spec.example.description));
  const pair = __al('Modes', 'HORIZONTAL', 'Dimension/Space/600'); ex.appendChild(pair);
  for (const modeName of ['Light', 'Dark']) {
    const c = __al(modeName, 'VERTICAL', 'Dimension/Space/300'); pair.appendChild(c);
    c.appendChild(cap(modeName));
    const f = __al('Canvas', 'VERTICAL', 'Dimension/Space/600'); c.appendChild(f);
    f.setExplicitVariableModeForCollection(col, mode(modeName));
    f.fills = [__paint('Elevation/Surface/Default')]; f.strokes = [__paint('Color/Border/Subtle')]; f.strokeAlign = 'INSIDE'; f.strokeWeight = 1;
    __pad(f, 'Dimension/Space/1000'); __radius(f, 'Dimension/Radius/300');
    for (const row of spec.example.rows) {
      const r = __al('Row', 'HORIZONTAL', 'Dimension/Space/300'); r.counterAxisAlignItems = 'CENTER'; f.appendChild(r);
      for (const e of row) r.appendChild(__variantInstance(set, e.variant, e.props));
    }
    f.layoutSizingHorizontal = 'FIXED'; f.resize((W - 24) / 2, f.height); f.layoutSizingVertical = 'HUG';
  }
  // Components: the set in a grid with captions (gutter = group name + sub-row label, headroom = column captions)
  const G = spec.components.grid, GUT = 208, HEADROOM = 32;
  const cs = __al('Components', 'VERTICAL', 'Dimension/Space/800'); frame.appendChild(cs);
  cs.appendChild(head('Components', spec.components.description));
  const grid = figma.createFrame(); grid.name = 'Grid'; grid.fills = []; grid.clipsContent = false; cs.appendChild(grid);
  grid.resize(GUT + set.width, HEADROOM + set.height);
  grid.appendChild(set); set.x = GUT; set.y = HEADROOM;
  G.cols.forEach((s, i) => { const t = cap(s); grid.appendChild(t); t.x = GUT + G.pad + i * G.colW; t.y = 0; });
  G.groups.forEach((name, g) => G.sub.forEach(([label, rowH], r) => {
    const cy = HEADROOM + G.pad + g * G.groupStride + r * G.rowH + rowH / 2;
    if (r === 0) { const s = __instance(doc, '_Doc/Caption Strong', null, { Text: name }); grid.appendChild(s); s.x = 0; s.y = Math.round(cy - s.height / 2); }
    if (label) { const t = cap(label); grid.appendChild(t); t.x = 96; t.y = Math.round(cy - t.height / 2); }
  }));
  // Parts (optional): caption + instance per internal building block
  if (spec.parts?.length) {
    const ps = __al('Parts', 'VERTICAL', 'Dimension/Space/800'); frame.appendChild(ps);
    ps.appendChild(head('Parts', 'このコンポーネントを組み立てるための Figma 専用の部品。単体のコンポーネントではない。'));
    const row = __al('Items', 'HORIZONTAL', 'Dimension/Space/1000'); ps.appendChild(row);
    for (const p of spec.parts) { const c = __al(p.label, 'VERTICAL', 'Dimension/Space/300'); row.appendChild(c); c.appendChild(cap(p.label)); c.appendChild(__variantInstance(sets[p.set], p.variant, p.props)); }
    out.parts = ps.id;
  }
  out.doc = frame.id; out.header = header.id; out.example = ex.id; out.components = cs.id; out.grid = grid.id;
  out.size = [Math.round(frame.width), Math.round(frame.height)];
  return out;
}`;
