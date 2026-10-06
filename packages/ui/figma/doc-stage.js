// Prints the `use_figma` script that builds the documentation building blocks on the "_Doc" page (decision 2026-10-06:
// one page template for Foundations and Components, see docs/pf-10-figma.md). Every block is a component (or set) named
// `_Doc/*` — the `_` prefix keeps them out of the published library. Every value is bound to a variable or Text Style.
//   node figma/doc-stage.js pages      → page skeleton (Cover, Getting Started, separators, Foundations / Components / Internal order)
//   node figma/doc-stage.js blocks     → the _Doc components (idempotent: existing ones are renamed "(old)")
// Requires the sans family variable to resolve to a font the MCP sandbox can load ("Inter"); see pf-10 for the Inter Display rule.
const PAGES = ['Cover', 'Getting Started', '——— Foundations ———', 'Palette', 'Typography', 'Spacing & Layout', 'Elevation', 'Icons', '——— Components ———', 'Button', 'Spinner', 'Focus Ring', '——— Internal ———', '_Doc'];

const SPEC = {
  text: { title: 'Font/Heading/XXL', summary: 'Font/Body/SM', section: 'Font/Heading/MD', body: 'Font/Body/SM', label: 'Font/Label/SM', badge: 'Font/Label/XS', mono: 'Font/Label/Mono/XS', monoSm: 'Font/Label/Mono/SM', sample: 'Font/Body/MD' },
  color: { text: 'Color/Text/Default', subtle: 'Color/Text/Subtle', subtlest: 'Color/Text/Subtlest', surface: 'Elevation/Surface/Default', border: 'Color/Border/Subtle', bar: 'Color/Background/Brand/Default', swatch: 'Color/Neutral/500' },
  status: { Draft: 'Warning', Ready: 'Success', Deprecated: 'Error' },     // badge → status role
  note: { Note: 'Info', Do: 'Success', "Don't": 'Error' },
  space: { 50: 'Dimension/Space/050', 100: 'Dimension/Space/100', 200: 'Dimension/Space/200', 300: 'Dimension/Space/300', 400: 'Dimension/Space/400' },
  radius: 'Dimension/Radius/200',
  borderWidth: 'Border/Width/Default',
  width: 1312, // content width of a 1440 page with 64 padding (instances are set to FILL anyway)
};

const pagesScript = String.raw`
const PAGES = __PAGES__;
const out = { renamed: [], created: [], order: [] };
const p1 = figma.root.children.find((p) => p.name === 'Page 1');
if (p1) { await figma.setCurrentPageAsync(p1); if (p1.children.length === 0) { p1.name = 'Cover'; out.renamed.push('Page 1 → Cover'); } }
for (const name of PAGES) if (!figma.root.children.some((p) => p.name === name)) { const p = figma.createPage(); p.name = name; out.created.push(name); }
PAGES.forEach((name, i) => figma.root.insertChild(i, figma.root.children.find((x) => x.name === name)));
out.order = figma.root.children.map((p) => p.name);
return out;`;

const blocksScript = String.raw`
const SPEC = __SPEC__;
const out = { created: [], renamed: [], missing: [] };
let page = figma.root.children.find((p) => p.name === '_Doc');
if (!page) { page = figma.createPage(); page.name = '_Doc'; }
await figma.setCurrentPageAsync(page);
const vars = await figma.variables.getLocalVariablesAsync();
const v = (name) => { const x = vars.find((y) => y.name === name); if (!x) out.missing.push(name); return x; };
const styles = Object.fromEntries((await figma.getLocalTextStylesAsync()).map((s) => [s.name, s]));
for (const name of Object.values(SPEC.text)) { if (!styles[name]) out.missing.push('style ' + name); else await figma.loadFontAsync(styles[name].fontName); }
for (const name of Object.values(SPEC.color)) v(name);
if (out.missing.length) return out;
const paint = (name) => figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', v(name));
const text = (chars, style, color, name) => { const t = figma.createText(); t.textStyleId = styles[style].id; t.characters = chars; t.name = name ?? chars; t.fills = [paint(color)]; return t; };
const frame = (name, dir, gapTok) => { const f = figma.createFrame(); f.name = name; f.layoutMode = dir; f.fills = []; f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'AUTO'; if (gapTok) f.setBoundVariable('itemSpacing', v(gapTok)); return f; };
const pad = (f, tok) => { for (const k of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']) f.setBoundVariable(k, v(tok)); };
const radius = (f) => { for (const k of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) f.setBoundVariable(k, v(SPEC.radius)); };
const fill = (f, varName) => { f.fills = [paint(varName)]; };
// Wire a TEXT property to the matching layer in EVERY variant (findOne on a set would only reach the first variant).
const textProp = (comp, layerName, propName, value) => {
  const key = comp.addComponentProperty(propName, 'TEXT', value);
  const variants = comp.type === 'COMPONENT_SET' ? comp.children : [comp];
  for (const c of variants) { const t = c.findOne((n) => n.type === 'TEXT' && n.name === layerName); if (t) t.componentPropertyReferences = { ...(t.componentPropertyReferences || {}), characters: key }; }
  return key;
};
const retire = (name) => { for (const n of page.children.filter((c) => (c.type === 'COMPONENT' || c.type === 'COMPONENT_SET') && c.name === name)) { n.name = name + ' (old)'; out.renamed.push(name); } };
const place = (node, x, y) => { node.x = x; node.y = y; out.created.push(node.name + ' ' + node.id); };
const comp = (name) => { const c = figma.createComponent(); c.name = name; c.layoutMode = 'VERTICAL'; c.fills = []; c.primaryAxisSizingMode = 'AUTO'; c.counterAxisSizingMode = 'AUTO'; return c; };
let y = 0; const step = (h) => { const cur = y; y += h; return cur; };

// 1. _Doc/Header — Status variants (Draft / Ready / Deprecated): title, summary, meta row with a status badge
retire('_Doc/Header');
{
  const variants = [];
  for (const [status, role] of Object.entries(SPEC.status)) {
    const c = comp('Status=' + status);
    c.setBoundVariable('itemSpacing', v(SPEC.space[200]));
    c.resize(SPEC.width, 10); c.counterAxisSizingMode = 'FIXED'; c.primaryAxisSizingMode = 'AUTO';
    c.appendChild(text('Title', SPEC.text.title, SPEC.color.text, 'Title'));
    const summary = text('Summary — what this page is for, in one or two sentences.', SPEC.text.summary, SPEC.color.subtle, 'Summary');
    c.appendChild(summary); summary.textAutoResize = 'HEIGHT'; summary.layoutSizingHorizontal = 'FILL';
    const meta = frame('Meta', 'HORIZONTAL', SPEC.space[300]); meta.counterAxisAlignItems = 'CENTER';
    const badge = frame('Badge', 'HORIZONTAL', null); badge.paddingLeft = badge.paddingRight = 8; badge.paddingTop = badge.paddingBottom = 2; radius(badge);
    fill(badge, 'Color/Background/Status/' + role + '/Subtle');
    badge.appendChild(text(status, SPEC.text.badge, 'Color/Text/Status/' + role + '/Bold', 'Status'));
    meta.appendChild(badge);
    meta.appendChild(text('Updated 2026-10-06', SPEC.text.mono, SPEC.color.subtlest, 'Updated'));
    meta.appendChild(text('Source: tokens/…', SPEC.text.mono, SPEC.color.subtlest, 'Source'));
    meta.appendChild(text('Links: Storybook · docs/…', SPEC.text.mono, SPEC.color.subtlest, 'Links'));
    c.appendChild(meta);
    variants.push(c);
  }
  const set = figma.combineAsVariants(variants, page);
  set.name = '_Doc/Header';
  set.description = 'ページ見出し。Status = Draft / Ready / Deprecated（バッジは background.status.*.subtle + text.status.*.bold）。Title / Summary / Updated / Source / Links は文字プロパティ。幅は置く側で Fill にする';
  textProp(set, 'Title', 'Title', 'Title'); textProp(set, 'Summary', 'Summary', 'Summary — what this page is for, in one or two sentences.'); textProp(set, 'Updated', 'Updated', 'Updated 2026-10-06'); textProp(set, 'Source', 'Source', 'Source: tokens/…'); textProp(set, 'Links', 'Links', 'Links: Storybook · docs/…');
  set.children.forEach((c, i) => { c.x = 24; c.y = 24 + i * 140; });
  set.resizeWithoutConstraints(SPEC.width + 48, 24 * 2 + variants.length * 140);
  place(set, 0, step(set.height + 80));
}

// 2. _Doc/Section — section heading + description (content goes below it as siblings)
retire('_Doc/Section');
{
  const c = comp('_Doc/Section');
  c.setBoundVariable('itemSpacing', v(SPEC.space[100]));
  c.resize(SPEC.width, 10); c.counterAxisSizingMode = 'FIXED'; c.primaryAxisSizingMode = 'AUTO';
  c.appendChild(text('Section', SPEC.text.section, SPEC.color.text, 'Heading'));
  const d = text('What this section shows and how to read it.', SPEC.text.body, SPEC.color.subtle, 'Description');
  c.appendChild(d); d.textAutoResize = 'HEIGHT'; d.layoutSizingHorizontal = 'FILL';
  c.description = '節の見出し + 説明。中身は Figma の制約上この部品の中には入れず、ページ上で直後に並べる。順は Overview → Anatomy → Properties → Variants → Usage → Specs（部品）/ Overview → Scale → Usage → 対応表（Foundations）';
  textProp(c, 'Heading', 'Heading', 'Section'); textProp(c, 'Description', 'Description', 'What this section shows and how to read it.');
  const show = c.addComponentProperty('Show Description', 'BOOLEAN', true); d.componentPropertyReferences = { ...d.componentPropertyReferences, visible: show }; // keep the characters ref
  page.appendChild(c); place(c, 0, step(c.height + 80));
}

// 3. _Doc/Label — row label: name + mono meta (the Icons page pattern)
retire('_Doc/Label');
{
  const c = comp('_Doc/Label'); c.layoutMode = 'HORIZONTAL'; c.counterAxisAlignItems = 'BASELINE'; c.setBoundVariable('itemSpacing', v(SPEC.space[300]));
  c.appendChild(text('Name', SPEC.text.label, SPEC.color.text, 'Name'));
  c.appendChild(text('meta · 12 steps', SPEC.text.mono, SPEC.color.subtlest, 'Meta'));
  c.description = '行・グループのラベル。Name（Label/SM）+ Meta（Label/Mono/XS）';
  textProp(c, 'Name', 'Name', 'Name'); textProp(c, 'Meta', 'Meta', 'meta · 12 steps');
  page.appendChild(c); place(c, 0, step(c.height + 80));
}

// 4. _Doc/Axis — row / column label for variant grids
retire('_Doc/Axis');
{
  const c = comp('_Doc/Axis'); c.layoutMode = 'HORIZONTAL';
  c.appendChild(text('Default', SPEC.text.mono, SPEC.color.subtlest, 'Text'));
  c.description = '格子の行・列ラベル（Label/Mono/XS、text.subtlest）。Button の縦 = 種類 / 横 = state などに貼る';
  textProp(c, 'Text', 'Text', 'Default');
  page.appendChild(c); place(c, 0, step(c.height + 80));
}

// 5. _Doc/Note — Kind variants: Note / Do / Don't
retire('_Doc/Note');
{
  const variants = [];
  for (const [kind, role] of Object.entries(SPEC.note)) {
    const c = comp('Kind=' + kind); c.layoutMode = 'HORIZONTAL'; c.setBoundVariable('itemSpacing', v(SPEC.space[200])); pad(c, SPEC.space[300]); radius(c);
    c.resize(SPEC.width, 10); c.primaryAxisSizingMode = 'FIXED'; c.counterAxisSizingMode = 'AUTO'; // horizontal: width fixed, height hugs
    fill(c, 'Color/Background/Status/' + role + '/Subtle');
    const k = text(kind, SPEC.text.label, 'Color/Text/Status/' + role + '/Bold', 'Kind'); c.appendChild(k); k.resize(64, k.height); k.textAutoResize = 'HEIGHT';
    const b = text('Guidance text.', SPEC.text.body, SPEC.color.text, 'Text'); c.appendChild(b); b.textAutoResize = 'HEIGHT'; b.layoutSizingHorizontal = 'FILL';
    variants.push(c);
  }
  const set = figma.combineAsVariants(variants, page);
  set.name = '_Doc/Note';
  set.description = '補足カード。Kind = Note（info）/ Do（success）/ Don\'t（error）。面は background.status.*.subtle、見出しは text.status.*.bold';
  textProp(set, 'Text', 'Text', 'Guidance text.');
  set.children.forEach((c, i) => { c.x = 24; c.y = 24 + i * 72; });
  set.resizeWithoutConstraints(SPEC.width + 48, 24 * 2 + variants.length * 72);
  place(set, 0, step(set.height + 80));
}

// 6. _Doc/Table Row — Kind variants: Header / Row, 4 columns (prop / values / default / notes)
retire('_Doc/Table Row');
{
  const cols = [['Col 1', 200], ['Col 2', 320], ['Col 3', 160], ['Col 4', 0]];
  const variants = [];
  for (const kind of ['Header', 'Row']) {
    const c = comp('Kind=' + kind); c.layoutMode = 'HORIZONTAL'; c.setBoundVariable('itemSpacing', v(SPEC.space[300])); c.paddingTop = c.paddingBottom = 8;
    c.resize(SPEC.width, 10); c.primaryAxisSizingMode = 'FIXED'; c.counterAxisSizingMode = 'AUTO'; // horizontal: width fixed, height hugs
    c.strokes = [paint(SPEC.color.border)]; c.strokeAlign = 'INSIDE'; c.strokeTopWeight = 0; c.strokeLeftWeight = 0; c.strokeRightWeight = 0; c.setBoundVariable('strokeBottomWeight', v(SPEC.borderWidth));
    cols.forEach(([name, w], i) => {
      const style = kind === 'Header' ? SPEC.text.label : i === 0 ? SPEC.text.monoSm : SPEC.text.body;
      const t = text(kind === 'Header' ? ['Prop', 'Values', 'Default', 'Notes'][i] : ['prop', 'a / b / c', 'a', '—'][i], style, kind === 'Header' ? SPEC.color.subtle : SPEC.color.text, name);
      c.appendChild(t); t.textAutoResize = 'HEIGHT'; if (w) t.resize(w, t.height); else t.layoutSizingHorizontal = 'FILL';
    });
    variants.push(c);
  }
  const set = figma.combineAsVariants(variants, page);
  set.name = '_Doc/Table Row';
  set.description = '簡易表の 1 行。Kind = Header / Row。列は 200 / 320 / 160 / 残り。props 表やトークン対応表に';
  for (const [name] of cols) textProp(set, name, name, name);
  set.children.forEach((c, i) => { c.x = 24; c.y = 24 + i * 56; });
  set.resizeWithoutConstraints(SPEC.width + 48, 24 * 2 + 2 * 56);
  place(set, 0, step(set.height + 80));
}

// 7. _Doc/Swatch — the Palette cell as a component (fill is overridden per instance)
retire('_Doc/Swatch');
{
  const c = comp('_Doc/Swatch'); c.setBoundVariable('itemSpacing', v(SPEC.space[100]));
  c.resize(136, 10); c.counterAxisSizingMode = 'FIXED'; c.primaryAxisSizingMode = 'AUTO';
  const face = figma.createRectangle(); face.name = 'Swatch'; face.resize(136, 64); face.fills = [paint(SPEC.color.swatch)]; radius(face); c.appendChild(face);
  for (const [chars, style, color, name] of [['500', SPEC.text.label, SPEC.color.text, 'Step'], ['#7C7871', SPEC.text.mono, SPEC.color.subtle, 'Hex'], ['L .574 C .012 H 81.8', SPEC.text.mono, SPEC.color.subtlest, 'LCH'], ['50 4.07 · 950 4.33', SPEC.text.mono, SPEC.color.subtlest, 'Ratio']]) {
    const t = text(chars, style, color, name); c.appendChild(t); t.textAutoResize = 'HEIGHT'; t.layoutSizingHorizontal = 'FILL';
  }
  c.description = '色見本セル（Palette ページの 1 セル）。塗りはインスタンスで変数に上書き。Step / Hex / LCH / Ratio は文字プロパティ';
  for (const n of ['Step', 'Hex', 'LCH', 'Ratio']) textProp(c, n, n, c.findOne((x) => x.name === n).characters);
  page.appendChild(c); place(c, 0, step(c.height + 80));
}

// 8. _Doc/Specimen — type specimen: style name, sample (style overridden per instance), spec line
retire('_Doc/Specimen');
{
  const c = comp('_Doc/Specimen'); c.setBoundVariable('itemSpacing', v(SPEC.space[100]));
  c.resize(SPEC.width, 10); c.counterAxisSizingMode = 'FIXED'; c.primaryAxisSizingMode = 'AUTO';
  c.appendChild(text('Font/Body/MD', SPEC.text.mono, SPEC.color.subtlest, 'Name'));
  const s = text('The quick brown fox jumps over the lazy dog — 素早い茶色の狐が怠け者の犬を飛び越える', SPEC.text.sample, SPEC.color.text, 'Sample'); c.appendChild(s); s.textAutoResize = 'HEIGHT'; s.layoutSizingHorizontal = 'FILL';
  c.appendChild(text('16px / 28px · regular · letterSpacing.md', SPEC.text.mono, SPEC.color.subtlest, 'Spec'));
  c.description = '文字見本。Sample の Text Style をインスタンスで差し替える（Name / Spec は文字プロパティ）';
  for (const n of ['Name', 'Sample', 'Spec']) textProp(c, n, n, c.findOne((x) => x.name === n).characters);
  page.appendChild(c); place(c, 0, step(c.height + 80));
}

// 9. _Doc/Bar — dimension bar: name, bar (width bound per instance), value
retire('_Doc/Bar');
{
  const c = comp('_Doc/Bar'); c.layoutMode = 'HORIZONTAL'; c.counterAxisAlignItems = 'CENTER'; c.setBoundVariable('itemSpacing', v(SPEC.space[300]));
  const n = text('space.400', SPEC.text.mono, SPEC.color.subtlest, 'Name'); c.appendChild(n); n.textAutoResize = 'HEIGHT'; n.resize(120, n.height);
  const bar = figma.createRectangle(); bar.name = 'Bar'; bar.resize(16, 16); bar.setBoundVariable('width', v(SPEC.space[400])); fill(bar, SPEC.color.bar); c.appendChild(bar);
  c.appendChild(text('16', SPEC.text.mono, SPEC.color.subtlest, 'Value'));
  c.description = '寸法の棒。Bar の幅をインスタンスで変数に束縛し直す（space / size / radius）。Name / Value は文字プロパティ';
  for (const k of ['Name', 'Value']) textProp(c, k, k, c.findOne((x) => x.name === k).characters);
  page.appendChild(c); place(c, 0, step(c.height + 80));
}
return out;`;

const mode = process.argv[2];
if (mode === 'pages') process.stdout.write(pagesScript.replace('__PAGES__', JSON.stringify(PAGES)));
else if (mode === 'blocks') process.stdout.write(blocksScript.replace('__SPEC__', JSON.stringify(SPEC)));
else { console.error('mode: pages | blocks'); process.exit(1); }
