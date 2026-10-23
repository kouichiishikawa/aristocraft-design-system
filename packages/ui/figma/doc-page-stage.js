// Prints the `use_figma` script that builds the page template v3 blocks on the "_Doc" page (approved 2026-10-23).
// They are what figma/lib/page.js composes; the older blocks of doc-stage.js stay for the Foundations pages.
//   _Doc/Page Header    — Status = Draft / Ready / Deprecated: System + Storybook row, Title (Display/SM),
//                         Summary (Body/MD, 640 wide), Status badge + Updated. No bottom rule (the Section Head draws it)
//   _Doc/Section Head   — top rule, Heading (Heading/XL) + Description (Body/MD, 800 wide)
//   _Doc/Caption        — Label/SM, text.subtle: column / row / mode captions
//   _Doc/Caption Strong — Label/MD, text.default: group names in a grid. A separate component, not a variant: a TEXT
//                         property syncs the Text Style across variants, so two styles cannot share one set
//   node figma/doc-page-stage.js → use_figma   (idempotent: existing blocks are renamed "(old)")
const W = 1232;
const ST = { title: 'Font/Display/SM', summary: 'Font/Body/MD', kicker: 'Font/Label/SM', heading: 'Font/Heading/XL', body: 'Font/Body/MD', caption: 'Font/Label/SM', strong: 'Font/Label/MD' };
const STATUS = { Draft: 'Warning', Ready: 'Success', Deprecated: 'Error' };

const script = String.raw`
const W = __W__, ST = __ST__, STATUS = __STATUS__;
const page = figma.root.children.find((p) => p.name === '_Doc');
await figma.setCurrentPageAsync(page);
const vars = await figma.variables.getLocalVariablesAsync();
const v = (name) => { const x = vars.find((y) => y.name === name); if (!x) throw new Error('variable missing: ' + name); return x; };
const styles = Object.fromEntries((await figma.getLocalTextStylesAsync()).map((s) => [s.name, s]));
for (const s of Object.values(ST)) { if (!styles[s]) throw new Error('style missing ' + s); await figma.loadFontAsync(styles[s].fontName); }
const paint = (name) => figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', v(name));
const text = (chars, style, color, name) => { const t = figma.createText(); t.textStyleId = styles[style].id; t.characters = chars; t.name = name; t.fills = [paint(color)]; return t; };
const al = (name, dir, gap) => { const f = figma.createAutoLayout(dir, { name }); f.fills = []; if (gap) f.setBoundVariable('itemSpacing', v(gap)); return f; };
const comp = (name, dir) => { const c = figma.createComponent(); c.name = name; c.layoutMode = dir; c.fills = []; c.primaryAxisSizingMode = 'AUTO'; c.counterAxisSizingMode = 'AUTO'; return c; };
const topRule = (f) => { f.strokes = [paint('Color/Border/Subtle')]; f.strokeAlign = 'INSIDE'; f.strokeBottomWeight = 0; f.strokeLeftWeight = 0; f.strokeRightWeight = 0; f.setBoundVariable('strokeTopWeight', v('Border/Width/Default')); };
// Wire a TEXT property to the matching layer in EVERY variant (findOne on a set would only reach the first variant).
const textProp = (c, layer, prop, val) => { const key = c.addComponentProperty(prop, 'TEXT', val); for (const x of (c.type === 'COMPONENT_SET' ? c.children : [c])) { const t = x.findOne((n) => n.type === 'TEXT' && n.name === layer); if (t) t.componentPropertyReferences = { ...(t.componentPropertyReferences || {}), characters: key }; } };
const out = { created: {}, renamed: [] };
const retire = (name) => { for (const n of page.children.filter((c) => (c.type === 'COMPONENT' || c.type === 'COMPONENT_SET') && c.name === name)) { n.name = name + ' (old)'; out.renamed.push(n.id); } };
let y = Math.max(0, ...page.children.map((n) => n.y + n.height)) + 160; // 0: an empty page would give -Infinity
const place = (n) => { n.x = 0; n.y = y; y += n.height + 80; out.created[n.name] = n.id; };
// _Doc/Page Header
retire('_Doc/Page Header');
{
  const variants = [];
  for (const [status, role] of Object.entries(STATUS)) {
    const c = comp('Status=' + status, 'VERTICAL'); c.setBoundVariable('itemSpacing', v('Dimension/Space/800'));
    c.resize(W, 10); c.counterAxisSizingMode = 'FIXED'; c.primaryAxisSizingMode = 'AUTO';
    const k = al('Kicker', 'HORIZONTAL'); c.appendChild(k); k.layoutSizingHorizontal = 'FILL'; k.primaryAxisAlignItems = 'SPACE_BETWEEN'; k.counterAxisAlignItems = 'CENTER';
    k.appendChild(text('Aristocraft Design System', ST.kicker, 'Color/Text/Subtle', 'System'));
    k.appendChild(text('Storybook ↗', ST.kicker, 'Color/Link/Default', 'Storybook'));
    const intro = al('Intro', 'VERTICAL', 'Dimension/Space/300'); c.appendChild(intro);
    intro.appendChild(text('Title', ST.title, 'Color/Text/Default', 'Title'));
    const s = text('Summary — what this component is for, in one or two sentences.', ST.summary, 'Color/Text/Subtle', 'Summary');
    intro.appendChild(s); s.resize(640, s.height); s.textAutoResize = 'HEIGHT';
    const meta = al('Meta', 'HORIZONTAL', 'Dimension/Space/400'); meta.counterAxisAlignItems = 'CENTER'; c.appendChild(meta);
    const badge = al('Badge', 'HORIZONTAL'); badge.paddingLeft = badge.paddingRight = 8; badge.paddingTop = badge.paddingBottom = 2;
    for (const r of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) badge.setBoundVariable(r, v('Dimension/Radius/100'));
    badge.fills = [paint('Color/Background/Status/' + role + '/Subtle')];
    badge.appendChild(text(status, ST.kicker, 'Color/Text/Status/' + role + '/Bold', 'Status'));
    meta.appendChild(badge);
    meta.appendChild(text('Updated 2026-10-06', ST.kicker, 'Color/Text/Subtlest', 'Updated'));
    variants.push(c);
  }
  const set = figma.combineAsVariants(variants, page);
  set.name = '_Doc/Page Header';
  set.description = 'ページ見出し（v3）。System / Storybook の行、Title（Display/SM）、Summary（Body/MD、幅 640、2 行以内）、Status バッジ + Updated。下罫線なし（次の Section Head の上罫線が区切る）。Status = Draft / Ready / Deprecated';
  textProp(set, 'Title', 'Title', 'Title'); textProp(set, 'Summary', 'Summary', 'Summary — what this component is for, in one or two sentences.'); textProp(set, 'Updated', 'Updated', 'Updated 2026-10-06');
  set.layoutMode = 'VERTICAL'; set.itemSpacing = 48; set.paddingTop = set.paddingBottom = set.paddingLeft = set.paddingRight = 24; set.primaryAxisSizingMode = 'AUTO'; set.counterAxisSizingMode = 'AUTO';
  place(set);
}
// _Doc/Section Head
retire('_Doc/Section Head');
{
  const c = comp('_Doc/Section Head', 'VERTICAL'); c.setBoundVariable('itemSpacing', v('Dimension/Space/200'));
  c.resize(W, 10); c.counterAxisSizingMode = 'FIXED'; c.primaryAxisSizingMode = 'AUTO';
  c.setBoundVariable('paddingTop', v('Dimension/Space/600')); topRule(c);
  c.appendChild(text('Section', ST.heading, 'Color/Text/Default', 'Heading'));
  const d = text('What this section shows and how to read it.', ST.body, 'Color/Text/Subtle', 'Description'); c.appendChild(d); d.resize(800, d.height); d.textAutoResize = 'HEIGHT';
  c.description = '節の見出し（v3）。上に罫線、Heading/XL + 説明（Body/MD、幅 800）。中身はページ上で直後に並べる';
  textProp(c, 'Heading', 'Heading', 'Section'); textProp(c, 'Description', 'Description', 'What this section shows and how to read it.');
  page.appendChild(c); place(c);
}
// _Doc/Caption (+ Strong)
for (const [name, style, color, desc] of [['_Doc/Caption', ST.caption, 'Color/Text/Subtle', '小見出し・軸ラベル（Label/SM、text.subtle）'], ['_Doc/Caption Strong', ST.strong, 'Color/Text/Default', '格子の行グループ名（Label/MD、text.default）']]) {
  retire(name);
  const c = comp(name, 'HORIZONTAL'); c.appendChild(text('Caption', style, color, 'Text'));
  c.description = desc; textProp(c, 'Text', 'Text', 'Caption');
  page.appendChild(c); place(c);
}
return out;`;

process.stdout.write(script.replace('__W__', W).replace('__ST__', JSON.stringify(ST)).replace('__STATUS__', JSON.stringify(STATUS)));
