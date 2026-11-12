// Prints the `use_figma` script that lays out the Focus Ring page with the component page template v3 (figma/lib/page.js):
// Header, Example (Light | Dark: Button's Focused state, then rings with the "element radius + 2px" overrides),
// Components (the single component, radius 0). No Parts, no Storybook story (the ring is a CSS rule, not a component).
//   node figma/focus-ring-doc-stage.js → use_figma
// Re-run after editing SPEC; the previous frame is kept as "Focus Ring (old)".
import { PAGE_LIB } from './lib/page.js';

const btn = (variant, sz, shape) => `Variant=${variant}, Size=${sz}, Shape=${shape}, State=Focused`;
const SPEC = {
  page: 'Focus Ring', set: 'Focus Ring', width: 1232,
  header: {
    status: 'Ready', title: 'Focus Ring',
    summary: 'キーボード操作で現在地を示すリング。要素から 2px 空けて 2px、角丸は要素の角丸 + 2px。部品は角丸 0 の 1 つだけで、置く側で角丸を上書きする。',
    updated: '2026-10-05',
  },
  example: {
    description: 'Button の Focused と、角丸を上書きしたリング（Small 10 / Medium 14 / Pill 9999）。Light と Dark はモードを切り替えただけの同じ構成。',
    rows: [
      [
        { set: 'Button', variant: btn('Secondary', 'Small', 'Rounded'), props: { Label: 'Small' } },
        { set: 'Button', variant: btn('Secondary', 'Medium', 'Rounded'), props: { Label: 'Medium' } },
        { set: 'Button', variant: btn('Primary', 'Medium', 'Pill'), props: { Label: 'Pill' } },
      ],
      [
        { variant: null, size: [72, 36], radius: 10 },
        { variant: null, size: [88, 44], radius: 14 },
        { variant: null, size: [88, 44], radius: 9999 },
      ],
    ],
  },
  components: {
    description: '部品は 1 つ（variant なし、角丸 0、40 × 40）。ストロークは外側 2px で Border/Width/Focused と Color/Border/Focused に束縛。',
    grid: {
      cols: ['Radius 0'],
      groups: ['Focus Ring'],
      sub: [[null, 40]],
      colW: 72, rowH: 40, pad: 0, groupStride: 0,
    },
  },
  parts: [],
};

const script = String.raw`
${PAGE_LIB}
const out = await buildComponentPage(__SPEC__);
return out;`;

process.stdout.write(script.replace('__SPEC__', JSON.stringify(SPEC)));
