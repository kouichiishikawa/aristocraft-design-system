// Shared `use_figma` snippet for the component page template (decision 2026-10-06, simplified after review):
//   Header frame  — _Doc/Header instance: Title, Summary, Status badge, Updated, Storybook link
//   Section "Example"    — a row of representative instances
//   Section "Components" — the component set itself (moved into the section), with _Doc/Axis row / column labels
//   Section "Parts"      — instances of the sub-components it uses (omitted when there are none)
// Sections are Figma SECTION nodes. A *-doc-stage.js script embeds PAGE_LIB and calls `await buildComponentPage(spec)`:
//   spec = { page, set, header: { status, title, summary, updated, storybook },
//            example: [{ variant, props }], parts: [{ set, variant, props }], axes: { rows: [[label, y]], cols: [[label, x]] } }
// Existing Header / sections with the same names are renamed "(old)" (scripts never delete).
export const PAGE_LIB = String.raw`
const __vars = await figma.variables.getLocalVariablesAsync();
const __v = (name) => { const x = __vars.find((y) => y.name === name); if (!x) throw new Error('variable missing: ' + name); return x; };
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
// Component sets live on lazily loaded pages: open each page once to resolve them by name.
const __resolveSets = async (names) => {
  const found = {};
  for (const p of figma.root.children) {
    if (Object.keys(found).length === names.size) break;
    await figma.setCurrentPageAsync(p);
    for (const n of p.children) if ((n.type === 'COMPONENT_SET' || n.type === 'COMPONENT') && names.has(n.name) && !found[n.name]) found[n.name] = n;
  }
  for (const n of names) if (!found[n]) throw new Error('component missing: ' + n);
  return found;
};
const __row = (name, gapTok) => { const f = figma.createFrame(); f.name = name; f.layoutMode = 'HORIZONTAL'; f.counterAxisAlignItems = 'CENTER'; f.fills = []; f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'AUTO'; f.setBoundVariable('itemSpacing', __v(gapTok)); return f; };
const __retire = (page, pred) => { const ids = []; for (const n of page.children.filter(pred)) { n.name = n.name + ' (old)'; ids.push(n.id); } return ids; };
const __section = (name, x, y, w, h) => { const s = figma.createSection(); s.name = name; s.x = x; s.y = y; s.resizeWithoutConstraints(w, h); return s; };
const GAP = 80, PAD = 48;
async function buildComponentPage(spec) {
  const names = new Set([spec.set, ...(spec.parts ?? []).map((p) => p.set)]);
  const sets = await __resolveSets(names);
  const doc = await __docIndex();
  const page = figma.root.children.find((p) => p.name === spec.page); if (!page) throw new Error('page missing: ' + spec.page);
  await figma.setCurrentPageAsync(page);
  const out = { renamed: [] };
  out.renamed.push(...__retire(page, (n) => (n.type === 'FRAME' && (n.name === 'Header' || n.name === spec.page)) || (n.type === 'SECTION' && ['Example', 'Components', 'Parts'].includes(n.name)) || n.name === 'Axes'));
  const set = sets[spec.set];
  const width = Math.max(1280, set.width + PAD * 2);
  let y = 0;
  const h = spec.header;
  const header = __instance(doc, '_Doc/Header', 'Status=' + (h.status ?? 'Draft'), { Title: h.title, Summary: h.summary, Updated: 'Updated ' + h.updated, Storybook: 'Storybook: ' + h.storybook });
  page.appendChild(header); header.name = 'Header'; header.x = 0; header.y = y; header.resize(width, header.height);
  y += header.height + GAP;
  const example = __section('Example', 0, y, width, 100); page.appendChild(example);
  const exRow = __row('Example', 'Dimension/Space/600'); example.appendChild(exRow); exRow.x = PAD; exRow.y = PAD;
  for (const e of spec.example ?? []) { const main = set.type === 'COMPONENT_SET' ? set.children.find((c) => c.name === e.variant) : set; if (!main) throw new Error('variant missing: ' + e.variant); const inst = main.createInstance(); __setProps(inst, e.props); exRow.appendChild(inst); }
  example.resizeWithoutConstraints(width, exRow.height + PAD * 2);
  y += example.height + GAP;
  const comps = __section('Components', 0, y, width, 100); page.appendChild(comps);
  comps.appendChild(set); set.x = PAD; set.y = PAD;
  const A = spec.axes;
  if (A) {
    for (const [label, x] of A.cols) { const t = __instance(doc, '_Doc/Axis', null, { Text: label }); comps.appendChild(t); t.x = PAD + x; t.y = PAD - 20; }
    for (const [label, ry] of A.rows) { const t = __instance(doc, '_Doc/Axis', null, { Text: label }); comps.appendChild(t); t.x = PAD - t.width - 12; t.y = PAD + ry; }
  }
  comps.resizeWithoutConstraints(width, set.height + PAD * 2);
  y += comps.height + GAP;
  if (spec.parts?.length) {
    const parts = __section('Parts', 0, y, width, 100); page.appendChild(parts);
    const row = __row('Parts', 'Dimension/Space/600'); parts.appendChild(row); row.x = PAD; row.y = PAD;
    for (const p of spec.parts) { const src = sets[p.set]; const main = src.type === 'COMPONENT_SET' ? src.children.find((c) => c.name === p.variant) : src; if (!main) throw new Error('variant missing: ' + p.variant); const inst = main.createInstance(); __setProps(inst, p.props); row.appendChild(inst); inst.layoutSizingHorizontal = 'FIXED'; inst.layoutSizingVertical = 'FIXED'; inst.resize(main.width, main.height); } // empty-frame parts (Focus Ring) collapse without an explicit size
    parts.resizeWithoutConstraints(width, row.height + PAD * 2);
    out.parts = parts.id;
  }
  out.header = header.id; out.example = example.id; out.components = comps.id; out.width = width;
  return out;
}`;
