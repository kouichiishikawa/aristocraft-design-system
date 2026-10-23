// Prints the `use_figma` script that builds the single "Focus Ring" component on the "Focus Ring" page.
//   node figma/focus-ring-stage.js → use_figma
// Design: docs/components/focus-ring.md (Atlassian style): 2px clear gap around the element, then a 2px ring whose corner
// radius is the element's radius + 2px. ONE component with corner radius 0 (decision 2026-10-05): the radius depends on
// the element it wraps, so each instance overrides it (Button rounded sm 8 → 10, md / lg 12 → 14, pill → 9999).
// The ring is an empty frame with an OUTSIDE stroke bound to Border/Width/Focused and Color/Border/Focused. Place it over
// the element, absolutely positioned, 2px larger on every side (x −2, y −2, w +4, h +4), constraints STRETCH / STRETCH.
// Idempotent: an existing component (or the earlier variant set) is kept, renamed "(old)".
const SPEC = {
  size: 40,
  width: 'Border/Width/Focused',
  color: 'Color/Border/Focused',
  description: 'フォーカスリング（Atlassian 式）: 要素から 2px 空けて 2px のリング。角丸は 0 で置いてあるので、インスタンスで「要素の角丸 + 2px（space.050）」に上書きする（Button rounded sm 8 → 10、md / lg 12 → 14、pill → 9999）。使い方: 要素の上に絶対配置、上下左右 2px 大きく（x −2, y −2, w +4, h +4）、constraints は左右・上下とも伸縮。ストロークは外側（幅 Border/Width/Focused、色 Color/Border/Focused）。CSS: outline 2px + outline-offset 2px（角丸は自動で追従）。',
};

const script = String.raw`
const SPEC = __SPEC__;
const out = { pageId: null, componentId: null, missingVars: [], renamed: [] };
let page = figma.root.children.find((p) => p.name === 'Focus Ring');
if (!page) { page = figma.createPage(); page.name = 'Focus Ring'; }
await figma.setCurrentPageAsync(page);
out.pageId = page.id;
const vars = await figma.variables.getLocalVariablesAsync();
const v = (name) => { const x = vars.find((y) => y.name === name); if (!x) out.missingVars.push(name); return x; };
const widthVar = v(SPEC.width), colorVar = v(SPEC.color);
if (out.missingVars.length) return out;

for (const prev of page.children.filter((n) => (n.type === 'COMPONENT_SET' || n.type === 'COMPONENT') && n.name === 'Focus Ring')) { prev.name = 'Focus Ring (old)'; out.renamed.push(prev.id); }

const c = figma.createComponent();
c.name = 'Focus Ring';
c.resize(SPEC.size, SPEC.size);
c.fills = [];
c.strokes = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 1 } }, 'color', colorVar)];
c.strokeAlign = 'OUTSIDE';
// frames keep per-side weights: binding 'strokeWeight' is silently ignored, the four side keys are what the UI shows as bound
for (const k of ['strokeTopWeight', 'strokeRightWeight', 'strokeBottomWeight', 'strokeLeftWeight']) c.setBoundVariable(k, widthVar);
c.cornerRadius = 0;
c.description = SPEC.description;
page.appendChild(c);
const right = page.children.filter((n) => n !== c).reduce((m, n) => Math.max(m, n.x + n.width), -200);
c.x = right + 200; c.y = 0;
out.componentId = c.id;
return out;`;

process.stdout.write(script.replace('__SPEC__', JSON.stringify(SPEC)));
