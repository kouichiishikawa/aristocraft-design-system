// Prints the `use_figma` script that builds the "Focus Ring" component set on the "Focus Ring" page.
//   node figma/focus-ring-stage.js → use_figma
// Design: docs/components/focus-ring.md (Atlassian style): 2px clear gap around the element, then a 2px ring whose corner
// radius is the element's radius + 2px. One variant per inner radius (Radius = 8 / 12 / Full); the ring itself is an
// empty frame with an OUTSIDE stroke bound to Border/Width/Focused and Color/Border/Focused. Place it over the element,
// absolutely positioned, 2px larger on every side (x −2, y −2, w +4, h +4), constraints STRETCH / STRETCH.
// Idempotent: an existing set is kept, renamed "(old)".
const SPEC = {
  // [variant value, inner radius, ring radius]  (ring = inner + space.050; 10 and 14 are not tokens, so literal)
  radii: [['8', 8, 10], ['12', 12, 14], ['Full', 9999, 9999]],
  size: 40,
  width: 'Border/Width/Focused',
  color: 'Color/Border/Focused',
  description: 'フォーカスリング（Atlassian 式）: 要素から 2px 空けて 2px のリング、角丸は要素 + 2px（space.050）。Radius は内側の要素の角丸で選ぶ（8 = Button rounded sm、12 = rounded md / lg、Full = pill）。使い方: 要素の上に絶対配置、上下左右 2px 大きく（x −2, y −2, w +4, h +4）、constraints は左右・上下とも伸縮。ストロークは外側（幅 Border/Width/Focused、色 Color/Border/Focused）。CSS: outline 2px + outline-offset 2px（角丸は自動で追従）。',
};

const script = String.raw`
const SPEC = __SPEC__;
const out = { pageId: null, setId: null, variants: 0, missingVars: [], renamed: null };
let page = figma.root.children.find((p) => p.name === 'Focus Ring');
if (!page) { page = figma.createPage(); page.name = 'Focus Ring'; }
await figma.setCurrentPageAsync(page);
out.pageId = page.id;
const vars = await figma.variables.getLocalVariablesAsync();
const v = (name) => { const x = vars.find((y) => y.name === name); if (!x) out.missingVars.push(name); return x; };
const widthVar = v(SPEC.width), colorVar = v(SPEC.color);
if (out.missingVars.length) return out;

const prev = page.children.find((n) => n.type === 'COMPONENT_SET' && n.name === 'Focus Ring');
if (prev) { prev.name = 'Focus Ring (old)'; out.renamed = prev.id; }

const variants = [];
for (const [value, inner, ring] of SPEC.radii) {
  const c = figma.createComponent();
  c.name = 'Radius=' + value;
  c.resize(SPEC.size, SPEC.size);
  c.fills = [];
  c.strokes = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 1 } }, 'color', colorVar)];
  c.strokeAlign = 'OUTSIDE';
  // frames keep per-side weights: binding 'strokeWeight' is silently ignored, the four side keys are what the UI shows as bound
  for (const k of ['strokeTopWeight', 'strokeRightWeight', 'strokeBottomWeight', 'strokeLeftWeight']) c.setBoundVariable(k, widthVar);
  c.cornerRadius = ring;
  c.description = '内側の角丸 ' + inner + ' → リングの角丸 ' + ring + '（+2px）';
  variants.push(c);
}
const set = figma.combineAsVariants(variants, page);
set.name = 'Focus Ring';
set.description = SPEC.description;
set.children.forEach((c, idx) => { c.x = 24 + idx * (SPEC.size + 32); c.y = 24; });
set.resizeWithoutConstraints(24 * 2 + SPEC.radii.length * (SPEC.size + 32) - 32, 24 * 2 + SPEC.size);
const right = page.children.filter((n) => n !== set).reduce((m, n) => Math.max(m, n.x + n.width), -200);
set.x = right + 200; set.y = 0;
out.setId = set.id; out.variants = set.children.length;
return out;`;

process.stdout.write(script.replace('__SPEC__', JSON.stringify(SPEC)));
