// Prints the `use_figma` script that builds the "Spinner" component set on the "Spinner" page (one page per component).
//   node figma/spinner-stage.js → use_figma
// Design: docs/components/spinner.md (loading-ui "dots-ring", MIT). 5 sizes = the Icon steps (12 / 16 / 24 / 32 / 48),
// width / height bound to Dimension/Size, dots filled with Color/Icon/Default, opacity = one frame of the pulse bound to
// Opacity variables (brightest dot at the top, fading clockwise). Idempotent: an existing set is kept, renamed "(old)".
import { SIZE_WORDS } from '@aristocraft/tokens/figma-name';

const SPEC = {
  sizes: [['xs', 300, 12], ['sm', 400, 16], ['md', 600, 24], ['lg', 800, 32], ['xl', 1200, 48]].map(([k, tok, px]) => [SIZE_WORDS[k], `Dimension/Size/${tok}`, px]),
  dots: 8, dotScale: 0.2, radiusScale: 0.34,
  // dot i (0 = top, clockwise) frozen at t = 0 of the CSS animation: dot 7 is at its brightest, then it fades clockwise
  opacity: { 7: 100, 6: 80, 5: 64, 4: 40, 3: 32, 2: 32, 1: 24, 0: 24 },
  fill: 'Color/Icon/Default',
  description: 'ローディング表示。loading-ui の dots-ring（MIT）: 8 点の輪を 1 秒で脈が一周する。Size は Icon と同じ Extra Small 12 / Small 16 / Medium 24 / Large 32 / Extra Large 48（Dimension/Size 300 / 400 / 600 / 800 / 1200）。点の色は Color/Icon/Default、不透明度は脈の 1 コマ（Opacity 100 → 24）。コード: <Spinner size="md" label="Loading" />。Button の loading 状態は Icon Before の位置にこれを置く。',
};

const script = String.raw`
const SPEC = __SPEC__;
const out = { pageId: null, setId: null, variants: 0, dots: 0, missingVars: [], renamed: null };
let page = figma.root.children.find((p) => p.name === 'Spinner');
if (!page) { page = figma.createPage(); page.name = 'Spinner'; }
await figma.setCurrentPageAsync(page);
out.pageId = page.id;
const vars = await figma.variables.getLocalVariablesAsync();
const v = (name) => { const x = vars.find((y) => y.name === name); if (!x) out.missingVars.push(name); return x; };
const fill = v(SPEC.fill);
const opacityVars = Object.fromEntries(Object.entries(SPEC.opacity).map(([i, pct]) => [i, v('Opacity/' + pct)]));
for (const [, tok] of SPEC.sizes) v(tok);
if (out.missingVars.length) return out;

const prev = page.children.find((n) => n.type === 'COMPONENT_SET' && n.name === 'Spinner');
if (prev) { prev.name = 'Spinner (old)'; out.renamed = prev.id; }

const variants = [];
for (const [word, sizeTok, px] of SPEC.sizes) {
  const c = figma.createComponent();
  c.name = 'Size=' + word;
  c.resize(px, px);
  c.fills = [];
  c.setBoundVariable('width', v(sizeTok));
  c.setBoundVariable('height', v(sizeTok));
  const d = px * SPEC.dotScale, r = px * SPEC.radiusScale;
  for (let i = 0; i < SPEC.dots; i++) {
    const a = (i / SPEC.dots) * Math.PI * 2;
    const dot = figma.createEllipse();
    dot.name = 'Dot ' + (i + 1);
    dot.resize(d, d);
    dot.fills = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', fill)];
    dot.setBoundVariable('opacity', opacityVars[i]);
    c.appendChild(dot);
    dot.x = px / 2 + Math.sin(a) * r - d / 2;
    dot.y = px / 2 - Math.cos(a) * r - d / 2;
    dot.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
    out.dots++;
  }
  variants.push(c);
}
const set = figma.combineAsVariants(variants, page);
set.name = 'Spinner';
set.description = SPEC.description;
set.children.forEach((c, idx) => { c.x = 24 + idx * 72; c.y = 24; });
set.resizeWithoutConstraints(24 * 2 + SPEC.sizes.length * 72, 24 * 2 + 48);
const right = page.children.filter((n) => n !== set).reduce((m, n) => Math.max(m, n.x + n.width), -200);
set.x = right + 200; set.y = 0;
out.setId = set.id; out.variants = set.children.length;
return out;`;

process.stdout.write(script.replace('__SPEC__', JSON.stringify(SPEC)));
