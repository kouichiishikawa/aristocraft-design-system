// Prints the `use_figma` script that builds the Button component set on the "Button" page (one page per component).
//   node figma/button-stage.js                      → all variants
//   node figma/button-stage.js --variants default   → only the listed variants (comma separated)
//   node figma/button-stage.js --swap-spinner       → keep the existing set, only swap the Loading icon for the Spinner component
//   node figma/button-stage.js --swap-focus         → keep the existing set, only replace the Focused shadows with a Focus Ring instance
// Figma naming is Title Case with spaces (props "Icon Before", values "Medium", layers "Label"); code keeps camelCase.
// Design: docs/components/button.md. variant 5 × size 3 × shape 2 × state 6 = 180 variants, every value bound
// to a variable or text style. Re-run after changing the SPEC below.
import { SIZE_WORDS, figmaName } from '@aristocraft/tokens/figma-name';
const SPEC = {
  // Row order in Figma = this order (default first). secondary / tertiary rest on neutral.subtle, which is transparent (Atlassian model).
  // 2026-10-06: link → tertiary (text.default, no underline), secondary border = border.default, loading keeps full opacity.
  variants: {
    // [fill default, fill hovered, fill pressed, text, border]  (variable names)
    default:   ['color/background/neutral/default', 'color/background/neutral/default/hovered', 'color/background/neutral/default/pressed', 'color/text/default', null],
    primary:   ['color/background/brand/bold', 'color/background/brand/bold/hovered', 'color/background/brand/bold/pressed', 'color/text/inverse', null],
    secondary: ['color/background/neutral/subtle', 'color/background/neutral/subtle/hovered', 'color/background/neutral/subtle/pressed', 'color/text/default', 'color/border/default'],
    tertiary:  ['color/background/neutral/subtle', 'color/background/neutral/subtle/hovered', 'color/background/neutral/subtle/pressed', 'color/text/default', null],
    danger:    ['color/background/status/error/bold', 'color/background/status/error/bold/hovered', 'color/background/status/error/bold/pressed', 'color/text/inverse', null],
  },
  // icon colour per variant (Icon Before / Icon After glyphs and the loading Spinner are bound to icon.default in their
  // components; bold fills need the inverse icon colour — instance override, approved 2026-10-06)
  iconColor: { primary: 'color/icon/inverse', danger: 'color/icon/inverse' },
  // height token, padding-inline token, gap token, text style, icon size (Icon / Spinner sets: sm 16 / md 24), rounded radius token
  // 2026-10-05 (Figma is the source for these): gap sm 4 / md 6 / lg 8 (space.100 / 150 / 200), sm shares label.md with md.
  sizes: {
    sm: ['dimension/size/800', 'dimension/space/300', 'dimension/space/100', 'font/label/md', 'sm', 'dimension/radius/200'],
    md: ['dimension/size/1000', 'dimension/space/400', 'dimension/space/150', 'font/label/md', 'sm', 'dimension/radius/300'],
    lg: ['dimension/size/1200', 'dimension/space/500', 'dimension/space/200', 'font/label/lg', 'md', 'dimension/radius/300'],
  },
  shapes: { rounded: null, pill: 'dimension/radius/full' }, // null = per-size rounded token
  states: ['default', 'hovered', 'pressed', 'focused', 'disabled', 'loading'],
  disabled: { fill: 'color/background/disabled', text: 'color/text/disabled' },
  // focused: the single "Focus Ring" component (figma/focus-ring-stage.js); the instance's corner radius = button radius + inset
  focus: { ring: 'Focus Ring', radius: { 'dimension/radius/200': 8, 'dimension/radius/300': 12, 'dimension/radius/full': 9999 }, inset: 2 },
  label: 'Button',
  icon: 'icon/arrow-right',
  spinner: 'Spinner', // component set on the Spinner page (figma/spinner-stage.js); the loading state shows it where Icon Before sits
};

SPEC.variantOrder = Object.keys(SPEC.variants); // the grid is laid out over every variant, even when only some are generated
const only = process.argv.includes('--variants') ? process.argv[process.argv.indexOf('--variants') + 1].split(',') : null;
if (only) SPEC.variants = Object.fromEntries(Object.entries(SPEC.variants).filter(([k]) => only.includes(k)));
// Figma display names (Title Case). Code props stay camelCase: variant/size/shape, iconBefore/iconAfter, label.
SPEC.names = {
  props: { variant: 'Variant', size: 'Size', shape: 'Shape', state: 'State', label: 'Label', iconBefore: 'Icon Before', iconAfter: 'Icon After' },
  values: { default: 'Default', primary: 'Primary', secondary: 'Secondary', tertiary: 'Tertiary', danger: 'Danger', ...SIZE_WORDS, rounded: 'Rounded', pill: 'Pill', hovered: 'Hovered', pressed: 'Pressed', focused: 'Focused', disabled: 'Disabled', loading: 'Loading' },
};
// Variable / style / component names in Figma are Title Case: convert the lowercase SPEC references once here.
const fig = (s) => (typeof s === 'string' && s.includes('/') ? figmaName(s.split('/')) : s);
for (const k of Object.keys(SPEC.variants)) SPEC.variants[k] = SPEC.variants[k].map(fig);
for (const k of Object.keys(SPEC.sizes)) SPEC.sizes[k] = SPEC.sizes[k].map((x, i) => (i === 4 ? SIZE_WORDS[x] : fig(x)));
SPEC.shapes = Object.fromEntries(Object.entries(SPEC.shapes).map(([k, x]) => [k, fig(x)]));
SPEC.disabled = { fill: fig(SPEC.disabled.fill), text: fig(SPEC.disabled.text) };
SPEC.focus.radius = Object.fromEntries(Object.entries(SPEC.focus.radius).map(([k, val]) => [fig(k), val]));
SPEC.icon = fig(SPEC.icon);
SPEC.iconColor = Object.fromEntries(Object.entries(SPEC.iconColor).map(([k, x]) => [k, fig(x)]));
SPEC.borderWidth = fig('border/width/default');

const script = String.raw`
const SPEC = __SPEC__;
const out = { created: 0, errors: [] };
const N = SPEC.names; const nm = (k) => N.values[k] ?? k;
let page = figma.root.children.find((p) => p.name === 'Button');
const legacy = figma.root.children.find((p) => p.name === 'Components');
if (!page && legacy) { legacy.name = 'Button'; page = legacy; } // one page per component
if (!page) { page = figma.createPage(); page.name = 'Button'; }
await figma.setCurrentPageAsync(page);
const vars = await figma.variables.getLocalVariablesAsync();
const v = (name) => { const x = vars.find((y) => y.name === name); if (!x) throw new Error('variable missing: ' + name); return x; };
const styles = Object.fromEntries((await figma.getLocalTextStylesAsync()).map((s) => [s.name, s]));
for (const name of Object.values(SPEC.sizes).map((s) => s[3])) await figma.loadFontAsync(styles[name].fontName);
const iconsPage = figma.root.children.find((p) => p.name === 'Icons');
await figma.setCurrentPageAsync(iconsPage);
const iconSet = iconsPage.findOne((n) => n.type === 'COMPONENT_SET' && n.name === 'Icon');
const glyphProp = Object.keys(iconSet.componentPropertyDefinitions).find((k) => k.startsWith('Glyph'));
const glyphs = Object.fromEntries(iconsPage.findAll((n) => n.type === 'COMPONENT' && n.name === SPEC.icon).map((n) => [n.name, n.id]));
const spinnerPage = figma.root.children.find((p) => p.name === SPEC.spinner);
await figma.setCurrentPageAsync(spinnerPage);
const spinnerSet = spinnerPage.findOne((n) => n.type === 'COMPONENT_SET' && n.name === SPEC.spinner);
if (!spinnerSet) throw new Error('Spinner set missing: run figma/spinner-stage.js first');
const focusPage = figma.root.children.find((p) => p.name === SPEC.focus.ring);
await figma.setCurrentPageAsync(focusPage);
const focusComp = focusPage.findOne((n) => n.type === 'COMPONENT' && n.name === SPEC.focus.ring);
if (!focusComp) throw new Error('Focus Ring component missing: run figma/focus-ring-stage.js first');
await figma.setCurrentPageAsync(page);
// Idempotent: an existing set is kept (hand edits and instance links survive); only variants that are missing are added.
let set = page.findOne((n) => n.type === 'COMPONENT_SET' && n.name === 'Button');
const existing = new Set(set ? set.children.map((c) => c.name) : []);
out.skipped = 0;
const paint = (name) => figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', v(name));

const iconInstance = (sizeVariant, glyphName, layerName, colorTok) => {
  const variant = iconSet.children.find((c) => c.name === 'Size=' + sizeVariant);
  const inst = variant.createInstance();
  inst.name = layerName;
  inst.setProperties({ [glyphProp]: glyphs[glyphName] });
  // override the glyph fill while the instance is still visible (hidden instances expose no children to the API)
  if (colorTok) for (const s of inst.findAll((n) => n.type === 'VECTOR' || n.type === 'BOOLEAN_OPERATION')) s.fills = [paint(colorTok)];
  return inst;
};
// focused: Focus Ring instance over the whole button, 2px larger on every side, stretching with it; radius = button + inset
const focusRing = (c, radiusPx) => {
  const ring = focusComp.createInstance();
  ring.name = SPEC.focus.ring;
  ring.cornerRadius = radiusPx >= 9999 ? 9999 : radiusPx + SPEC.focus.inset;
  c.appendChild(ring);
  ring.layoutPositioning = 'ABSOLUTE';
  ring.x = -SPEC.focus.inset; ring.y = -SPEC.focus.inset;
  ring.resize(c.width + SPEC.focus.inset * 2, c.height + SPEC.focus.inset * 2);
  ring.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
  return ring;
};
// loading: the Spinner set's variant of the same size as the icon (Small 16 / Medium 24)
const spinnerInstance = (sizeVariant, colorTok) => {
  const inst = spinnerSet.children.find((c) => c.name === 'Size=' + sizeVariant).createInstance();
  inst.name = SPEC.spinner;
  if (colorTok) for (const dot of inst.findAll((n) => n.type === 'ELLIPSE')) dot.fills = [paint(colorTok)]; // instance override
  return inst;
};

const variants = [];
for (const [variant, [fill, fillHover, fillPress, textColor, border]] of Object.entries(SPEC.variants)) {
  for (const [size, [heightTok, padTok, gapTok, textStyle, iconSize, roundedTok]] of Object.entries(SPEC.sizes)) {
    for (const [shape, shapeTok] of Object.entries(SPEC.shapes)) {
      for (const state of SPEC.states) {
        const name = N.props.variant + '=' + nm(variant) + ', ' + N.props.size + '=' + nm(size) + ', ' + N.props.shape + '=' + nm(shape) + ', ' + N.props.state + '=' + nm(state);
        if (existing.has(name)) { out.skipped++; continue; }
        const c = figma.createComponent();
        c.name = name;
        c.layoutMode = 'HORIZONTAL';
        c.primaryAxisSizingMode = 'AUTO';
        c.counterAxisSizingMode = 'FIXED';
        c.counterAxisAlignItems = 'CENTER';
        c.primaryAxisAlignItems = 'CENTER';
        c.resize(96, 40);
        c.primaryAxisSizingMode = 'AUTO'; // resize() resets sizing to FIXED
        c.setBoundVariable('height', v(heightTok));
        c.setBoundVariable('paddingLeft', v(padTok)); c.setBoundVariable('paddingRight', v(padTok));
        c.setBoundVariable('itemSpacing', v(gapTok));
        const radius = shapeTok ?? roundedTok;
        for (const k of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) c.setBoundVariable(k, v(radius));
        // fills / strokes by state
        const isDisabled = state === 'disabled';
        const fillTok = isDisabled ? SPEC.disabled.fill : state === 'hovered' ? fillHover : state === 'pressed' ? fillPress : fill;
        c.fills = fillTok ? [paint(fillTok)] : [];
        if (border && !isDisabled) { c.strokes = [paint(border)]; c.strokeAlign = 'INSIDE'; for (const k of ['strokeTopWeight', 'strokeRightWeight', 'strokeBottomWeight', 'strokeLeftWeight']) c.setBoundVariable(k, v(SPEC.borderWidth)); }
        else c.strokes = [];
        if (state === 'focused') c.clipsContent = false; // the Focus Ring instance (added after the children) sits 2px outside
        // children: iconStart (or spinner when loading), label, iconEnd
        const iconColor = isDisabled ? null : SPEC.iconColor[variant]; // disabled keeps icon.default (not decided yet)
        const start = state === 'loading' ? spinnerInstance(iconSize, iconColor) : iconInstance(iconSize, SPEC.icon, N.props.iconBefore, iconColor);
        c.appendChild(start); start.visible = state === 'loading'; start.isExposedInstance = true;
        const t = figma.createText(); t.name = N.props.label; t.textStyleId = styles[textStyle].id; t.characters = SPEC.label;
        t.fills = [paint(isDisabled ? SPEC.disabled.text : textColor)];
        c.appendChild(t);
        const end = iconInstance(iconSize, SPEC.icon, N.props.iconAfter, iconColor);
        c.appendChild(end); end.visible = false; end.isExposedInstance = true;
        if (state === 'focused') focusRing(c, SPEC.focus.radius[radius]);
        variants.push(c);
      }
    }
  }
}
if (set) { for (const c of variants) set.appendChild(c); } // appended components become variants of the existing set
else {
  set = figma.combineAsVariants(variants, page);
  set.name = 'Button';
  set.description = 'Variant: Primary は画面に 1 つ / default が標準 / secondary は default の隣の副次操作（枠つき）/ tertiary は面なしの控えめな操作 / danger は破壊的操作。size sm 32 · md 40 · lg 48（TextField と同じ段）。shape rounded（sm 8px、md・lg 12px、squircle）/ pill。disabled は全 variant 共通。icon-only は IconButton を使う。label 必須。実装: <Button variant size shape iconStart iconEnd loading fullWidth>';
}
// component properties (boolean/text) on the set, wired to the layers.
// Figma bug (forum "Issue with Text property overriding text styles in component sets"): once text layers are linked to the
// same TEXT property, any later text-style / decoration write on one of them is applied to all of them at commit time, and
// newly linked layers adopt the property's style. So the Label property is (re)created only after every label has its final
// style, all labels are linked in one go, and nothing touches a label afterwards.
const propKey = (name) => Object.keys(set.componentPropertyDefinitions).find((k) => k === name || k.startsWith(name + '#'));
const oldLabel = propKey(N.props.label);
if (oldLabel) set.deleteComponentProperty(oldLabel); // instances lose their Label override; they are re-linked below
const pLabel = set.addComponentProperty(N.props.label, 'TEXT', SPEC.label);
const pStart = propKey(N.props.iconBefore) ?? set.addComponentProperty(N.props.iconBefore, 'BOOLEAN', false);
const pEnd = propKey(N.props.iconAfter) ?? set.addComponentProperty(N.props.iconAfter, 'BOOLEAN', false);
for (const c of set.children) c.findChild((n) => n.name === N.props.label).componentPropertyReferences = { characters: pLabel };
for (const c of variants) {
  const isLoading = c.name.includes(N.props.state + '=' + nm('loading'));
  if (!isLoading) c.findChild((n) => n.name === N.props.iconBefore).componentPropertyReferences = { visible: pStart };
  c.findChild((n) => n.name === N.props.iconAfter).componentPropertyReferences = { visible: pEnd };
}
// grid (decision 2026-10-06): rows = variant (then size × shape inside each variant block), columns = state
const sizes = Object.keys(SPEC.sizes), shapes = Object.keys(SPEC.shapes), variantsK = SPEC.variantOrder;
const colW = 160, rowH = 72, pad = 32, groupGap = 32;
for (const c of set.children) {
  const m = Object.fromEntries(c.name.split(', ').map((kv) => kv.split('=')));
  const key = (val) => Object.keys(N.values).find((k) => N.values[k] === val) ?? val;
  const vi = variantsK.indexOf(key(m[N.props.variant]));
  const row = vi * sizes.length * shapes.length + sizes.indexOf(key(m[N.props.size])) * shapes.length + shapes.indexOf(key(m[N.props.shape]));
  const col = SPEC.states.indexOf(key(m[N.props.state]));
  c.x = pad + col * colW; c.y = pad + row * rowH + vi * groupGap;
}
set.resizeWithoutConstraints(pad * 2 + SPEC.states.length * colW, pad * 2 + variantsK.length * sizes.length * shapes.length * rowH + (variantsK.length - 1) * groupGap);
out.added = variants.length; out.total = set.children.length; out.id = set.id; out.props = Object.keys(set.componentPropertyDefinitions);
return out;`;

// `--swap-spinner`: in-place update of an existing (hand-tuned) Button set — replace the Icon/Loader Circle instance of every
// State=Loading variant with a Spinner instance of the same size. Nothing else is touched, so manual edits survive.
const swap = String.raw`
const WORDS = __WORDS__;
const out = { swapped: [], skipped: [] };
const spinnerPage = figma.root.children.find((p) => p.name === 'Spinner');
await figma.setCurrentPageAsync(spinnerPage);
const spinnerSet = spinnerPage.findOne((n) => n.type === 'COMPONENT_SET' && n.name === 'Spinner');
const page = figma.root.children.find((p) => p.name === 'Button');
await figma.setCurrentPageAsync(page);
const set = page.findOne((n) => n.type === 'COMPONENT_SET' && n.name === 'Button');
for (const c of set.children) {
  if (!c.name.includes('State=Loading')) continue;
  const old = c.children.find((n) => n.type === 'INSTANCE' && n.name !== 'Icon After');
  if (!old || old.mainComponent?.parent?.name === 'Spinner') { out.skipped.push(c.name); continue; }
  const word = WORDS[Math.round(old.width)];
  if (!word) { out.skipped.push(c.name + ': icon width ' + old.width); continue; }
  const inst = spinnerSet.children.find((n) => n.name === 'Size=' + word).createInstance();
  inst.name = 'Spinner';
  c.insertChild(c.children.indexOf(old), inst);
  old.remove();
  out.swapped.push(c.name + ' → ' + word);
}
return out;`;

// `--swap-focus`: in-place update of an existing Button set — drop the two drop-shadow effects of every State=Focused variant,
// remove any earlier Focus Ring instance, and add one from the single Focus Ring component, absolutely positioned 2px outside
// the button with the corner radius overridden to button radius + 2.
const swapFocus = String.raw`
const INSET = __INSET__;
const out = { swapped: [], skipped: [] };
const focusPage = figma.root.children.find((p) => p.name === 'Focus Ring');
await figma.setCurrentPageAsync(focusPage);
const focusComp = focusPage.findOne((n) => n.type === 'COMPONENT' && n.name === 'Focus Ring');
if (!focusComp) throw new Error('Focus Ring component missing: run figma/focus-ring-stage.js first');
const page = figma.root.children.find((p) => p.name === 'Button');
await figma.setCurrentPageAsync(page);
const set = page.findOne((n) => n.type === 'COMPONENT_SET' && n.name === 'Button');
for (const c of set.children) {
  if (!c.name.includes('State=Focused')) continue;
  for (const old of c.children.filter((n) => n.type === 'INSTANCE' && n.name === 'Focus Ring')) old.remove();
  c.effects = []; c.clipsContent = false;
  const radius = c.topLeftRadius >= 9999 ? 9999 : c.topLeftRadius + INSET;
  const ring = focusComp.createInstance(); ring.name = 'Focus Ring';
  ring.cornerRadius = radius;
  c.appendChild(ring);
  ring.layoutPositioning = 'ABSOLUTE';
  ring.x = -INSET; ring.y = -INSET;
  ring.resize(c.width + INSET * 2, c.height + INSET * 2);
  ring.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
  out.swapped.push(c.name + ' → r' + radius);
}
return out;`;

if (process.argv.includes('--swap-spinner')) process.stdout.write(swap.replace('__WORDS__', JSON.stringify({ 16: SIZE_WORDS.sm, 24: SIZE_WORDS.md })));
else if (process.argv.includes('--swap-focus')) process.stdout.write(swapFocus.replace('__INSET__', String(SPEC.focus.inset)));
else process.stdout.write(script.replace('__SPEC__', JSON.stringify(SPEC)));
