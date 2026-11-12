// Shared `use_figma` snippet for the Foundations page template (v3 look, 2026-11-12 draft for DEV-24). Same document
// frame as the component pages (figma/lib/page.js: Surface/Default, padding Space/1600, sections Space/2400 apart,
// explicit Light mode) but no Example / Components: the content already exists on the page (built by icons-stage.js /
// palette-stage.js), so this script re-wraps it instead of redrawing it:
//   Header    — _Doc/Page Header (Storybook line hidden when there is no story)
//   Sections  — _Doc/Section Head, then one block per group: Caption Strong (name) + Caption (meta) over the moved content
// spec = { page, source, header: { status, title, summary, updated, storybook? },
//          sections: [{ heading, description, groups: [{ from, title, meta }] }] }
//   from = name of a group frame inside the source frame; its last child (the Row / Grid) is moved into the new block.
//   meta omitted = reuse the old label's second text (e.g. the hue angle and method written by palette-stage.js).
// The source frame (with the old labels left behind) is renamed "(old)" and moved 9000 to the left (scripts never delete).
export const FOUNDATION_LIB = String.raw`
const __vars = await figma.variables.getLocalVariablesAsync();
const __v = (name) => { const x = __vars.find((y) => y.name === name); if (!x) throw new Error('variable missing: ' + name); return x; };
const __paint = (name) => figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', __v(name));
const __docPage = figma.root.children.find((p) => p.name === '_Doc');
await figma.setCurrentPageAsync(__docPage);
const __doc = Object.fromEntries(__docPage.children.filter((n) => n.name.startsWith('_Doc/')).map((n) => [n.name, n]));
const __propKey = (node, name) => Object.keys(node.componentProperties ?? {}).find((k) => k === name || k.startsWith(name + '#'));
const __instance = (name, variant, props) => {
  const c = __doc[name]; if (!c) throw new Error('block missing: ' + name);
  const main = c.type === 'COMPONENT_SET' ? c.children.find((x) => x.name === variant) : c;
  if (!main) throw new Error(name + ' has no variant ' + variant);
  const inst = main.createInstance(); const p = {};
  for (const [k, val] of Object.entries(props || {})) { const key = __propKey(inst, k); if (!key) throw new Error('no prop ' + k); p[key] = val; }
  if (Object.keys(p).length) inst.setProperties(p);
  return inst;
};
const __al = (name, dir, gapTok) => { const f = figma.createAutoLayout(dir, { name }); f.fills = []; f.clipsContent = false; if (gapTok) f.setBoundVariable('itemSpacing', __v(gapTok)); return f; };
const __pad = (f, tok) => { for (const k of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']) f.setBoundVariable(k, __v(tok)); };
async function buildFoundationPage(spec) {
  const page = figma.root.children.find((p) => p.name === spec.page); if (!page) throw new Error('page missing: ' + spec.page);
  await figma.setCurrentPageAsync(page);
  const src = page.children.find((n) => n.name === spec.source); if (!src) throw new Error('source missing: ' + spec.source);
  const groups = {}; for (const g of src.children) groups[g.name] = g;
  for (const s of spec.sections) for (const g of s.groups) if (!groups[g.from]) throw new Error('group missing: ' + g.from);
  const out = { retired: [src.id], moved: [] };
  src.name += ' (old)'; src.x -= 9000;
  const col = (await figma.variables.getLocalVariableCollectionsAsync()).find((c) => c.name === 'Semantic - Color');
  const frame = __al(spec.page, 'VERTICAL', 'Dimension/Space/2400'); page.appendChild(frame); frame.x = 0; frame.y = 0;
  frame.fills = [__paint('Elevation/Surface/Default')]; __pad(frame, 'Dimension/Space/1600');
  frame.setExplicitVariableModeForCollection(col, col.modes.find((m) => m.name === 'Light').modeId);
  const h = spec.header;
  const header = __instance('_Doc/Page Header', 'Status=' + (h.status ?? 'Draft'), { Title: h.title, Summary: h.summary, Updated: 'Updated ' + h.updated });
  frame.appendChild(header); header.name = 'Header';
  const sb = header.findOne((n) => n.type === 'TEXT' && n.name === 'Storybook');
  if (h.storybook) { await figma.loadFontAsync(sb.fontName); sb.hyperlink = { type: 'URL', value: h.storybook }; } else sb.visible = false;
  out.sections = [];
  for (const s of spec.sections) {
    const sec = __al(s.heading, 'VERTICAL', 'Dimension/Space/800'); frame.appendChild(sec);
    const head = __instance('_Doc/Section Head', null, { Heading: s.heading, Description: s.description }); sec.appendChild(head);
    const list = __al('Groups', 'VERTICAL', 'Dimension/Space/1200'); sec.appendChild(list);
    for (const g of s.groups) {
      const block = __al(g.title, 'VERTICAL', 'Dimension/Space/400'); list.appendChild(block);
      const label = __al('Label', 'HORIZONTAL', 'Dimension/Space/200'); label.counterAxisAlignItems = 'BASELINE'; block.appendChild(label);
      label.appendChild(__instance('_Doc/Caption Strong', null, { Text: g.title }));
      const meta = g.meta ?? groups[g.from].children[0].findAll((n) => n.type === 'TEXT')[1]?.characters;
      if (meta) label.appendChild(__instance('_Doc/Caption', null, { Text: meta }));
      const content = groups[g.from].children[groups[g.from].children.length - 1];
      block.appendChild(content); out.moved.push(content.id);
    }
    out.sections.push(sec.id);
  }
  out.doc = frame.id; out.header = header.id; out.size = [Math.round(frame.width), Math.round(frame.height)];
  return out;
}`;
