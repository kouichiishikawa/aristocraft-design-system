// Shared `use_figma` snippet for the page template (decision 2026-10-06): one vertical auto-layout frame "Page" per Figma
// page, built from `_Doc/*` instances (figma/doc-stage.js). Foundations and Components pages use the same skeleton:
//   Header (Status badge, summary, meta) → Section heading → blocks (note / table / label / instance / custom) → …
// A *-stage.js script embeds PAGE_LIB in its use_figma code and calls `await buildPage(spec)`.
//   spec = { page, name, x, y, width, replace, header: { status, title, summary, updated, source, links },
//            sections: [{ heading, description, blocks: [block, …] }] }
//   block = { type: 'note', kind: 'Note'|'Do'|"Don't", text }
//         | { type: 'table', header: [c1..c4], rows: [[c1..c4], …] }
//         | { type: 'label', name, meta }
//         | { type: 'instance', set: 'Button', variant: 'Variant=Default, …', props: { 'Icon Before': true, Label: '…' } }
//         | { type: 'row', gap, blocks: [block, …] }   (horizontal group)
// Returns { frameId, renamed }. An existing frame with the same name is renamed "<name> (old)" (scripts never delete).
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
const __column = (name, gapTok) => { const f = figma.createFrame(); f.name = name; f.layoutMode = 'VERTICAL'; f.fills = []; f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'AUTO'; f.setBoundVariable('itemSpacing', __v(gapTok)); return f; };
const __fill = (node) => { node.layoutSizingHorizontal = 'FILL'; };
// Component sets referenced by 'instance' blocks live on other pages, which are loaded lazily: open each page once to resolve them.
const __resolveSets = async (spec) => {
  const names = new Set(); const walk = (bs) => { for (const b of bs ?? []) { if (b.type === 'instance') names.add(b.set); if (b.type === 'row') walk(b.blocks); } };
  for (const s of spec.sections) walk(s.blocks);
  const found = {};
  for (const p of figma.root.children) {
    if (Object.keys(found).length === names.size) break;
    await figma.setCurrentPageAsync(p);
    for (const n of p.children) if ((n.type === 'COMPONENT_SET' || n.type === 'COMPONENT') && names.has(n.name) && !found[n.name]) found[n.name] = n;
  }
  for (const n of names) if (!found[n]) throw new Error('component missing: ' + n);
  return found;
};
async function buildPage(spec) {
  const sets = await __resolveSets(spec);
  const doc = await __docIndex();
  const page = figma.root.children.find((p) => p.name === spec.page); if (!page) throw new Error('page missing: ' + spec.page);
  await figma.setCurrentPageAsync(page);
  const out = { renamed: null, blocks: 0 };
  const prev = page.children.find((n) => n.type === 'FRAME' && n.name === spec.name); // FRAME only: the component set may share the name
  if (prev) { prev.name = spec.name + ' (old)'; out.renamed = prev.id; }
  const root = __column(spec.name, 'Dimension/Space/1600'); // 64 between sections
  root.x = spec.x ?? 0; root.y = spec.y ?? 0;
  for (const k of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']) root.setBoundVariable(k, __v('Dimension/Space/1600'));
  root.fills = [__paint('Elevation/Surface/Default')];
  root.resize(spec.width ?? 1440, 100); root.counterAxisSizingMode = 'FIXED'; root.primaryAxisSizingMode = 'AUTO';
  page.appendChild(root);
  const h = spec.header;
  const header = __instance(doc, '_Doc/Header', 'Status=' + (h.status ?? 'Draft'), { Title: h.title, Summary: h.summary, Updated: 'Updated ' + h.updated, Source: 'Source: ' + h.source, Links: 'Links: ' + h.links });
  root.appendChild(header); __fill(header);
  const addBlock = (parent, b) => {
    let node;
    if (b.type === 'note') node = __instance(doc, '_Doc/Note', 'Kind=' + b.kind, { Text: b.text });
    else if (b.type === 'label') node = __instance(doc, '_Doc/Label', null, { Name: b.name, Meta: b.meta });
    else if (b.type === 'axis') node = __instance(doc, '_Doc/Axis', null, { Text: b.text });
    else if (b.type === 'table') {
      node = __column('Table', 'Dimension/Space/0');
      const row = (kind, cells) => { const r = __instance(doc, '_Doc/Table Row', 'Kind=' + kind, Object.fromEntries(cells.map((c, i) => ['Col ' + (i + 1), c]))); node.appendChild(r); __fill(r); };
      row('Header', b.header); for (const cells of b.rows) row('Row', cells);
    } else if (b.type === 'instance') {
      const src = sets[b.set];
      const main = src.type === 'COMPONENT_SET' ? src.children.find((x) => x.name === b.variant) : src;
      node = main.createInstance(); __setProps(node, b.props);
    } else if (b.type === 'row') {
      node = __column('Row', b.gap ?? 'Dimension/Space/600'); node.layoutMode = 'HORIZONTAL'; node.counterAxisAlignItems = 'CENTER';
      for (const inner of b.blocks) addBlock(node, inner);
    } else throw new Error('unknown block ' + b.type);
    parent.appendChild(node);
    if (b.type === 'note' || b.type === 'table') __fill(node);
    out.blocks++;
    return node;
  };
  for (const s of spec.sections) {
    const section = __column(s.heading, 'Dimension/Space/400'); // 16 between heading and blocks
    root.appendChild(section); __fill(section);
    const head = __instance(doc, '_Doc/Section', null, { Heading: s.heading, Description: s.description ?? '' });
    if (!s.description) __setProps(head, { 'Show Description': false });
    section.appendChild(head); __fill(head);
    for (const b of s.blocks ?? []) addBlock(section, b);
  }
  out.frameId = root.id; out.width = root.width; out.height = root.height;
  return out;
}`;
