// Prints the `use_figma` script that lays out the Spinner page with the component page template v3 (figma/lib/page.js):
// Header, Example (Light | Dark: the 5 sizes, then Button's loading state that places it), Components (the set in a
// labelled grid). No Parts. The set itself is built by spinner-stage.js (x = 24 + 72 · i, y = 24).
//   node figma/spinner-doc-stage.js → use_figma
// Re-run after editing SPEC; the previous frame is kept as "Spinner (old)".
import { PAGE_LIB } from './lib/page.js';

const size = (s) => `Size=${s}`;
const btn = (variant, sz = 'Medium') => `Variant=${variant}, Size=${sz}, Shape=Rounded, State=Loading`;
const SPEC = {
  page: 'Spinner', set: 'Spinner', width: 1232,
  header: {
    status: 'Ready', title: 'Spinner',
    summary: '読み込み中を示す部品。8 点の輪を 1 秒で脈が一周する（loading-ui の dots-ring）。径は Icon と同じ 5 段、色は親の文字色に従う。',
    updated: '2026-10-05', storybook: 'https://kouichiishikawa.github.io/aristocraft-design-system/?path=/story/components-spinner--sizes',
  },
  example: {
    description: '径の 5 段と、Button の loading での使い方。Light と Dark はモードを切り替えただけの同じ構成。',
    rows: [
      ['Extra Small', 'Small', 'Medium', 'Large', 'Extra Large'].map((s) => ({ variant: size(s) })),
      [
        { set: 'Button', variant: btn('Primary'), props: { Label: 'Saving' } },
        { set: 'Button', variant: btn('Default'), props: { Label: 'Loading' } },
        { set: 'Button', variant: btn('Secondary', 'Small'), props: { Label: 'Loading' } },
      ],
    ],
  },
  components: {
    description: '全 5 variant（Size）。径は Dimension/Size 300 / 400 / 600 / 800 / 1200 = 12 / 16 / 24 / 32 / 48。',
    grid: {
      cols: ['xs · 12', 'sm · 16', 'md · 24', 'lg · 32', 'xl · 48'],
      groups: ['Size'],
      sub: [[null, 48]],
      colW: 72, rowH: 48, pad: 24, groupStride: 0,
    },
  },
  parts: [],
};

const script = String.raw`
${PAGE_LIB}
const out = await buildComponentPage(__SPEC__);
return out;`;

process.stdout.write(script.replace('__SPEC__', JSON.stringify(SPEC)));
