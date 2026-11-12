// Prints the `use_figma` script that re-wraps a Foundations page (Icons / Palette) in the v3 document frame
// (figma/lib/foundation.js): Header, then sections whose groups are the existing rows / grids moved under v3 captions.
//   node figma/foundation-doc-stage.js icons   → use_figma
//   node figma/foundation-doc-stage.js palette → use_figma
// The content itself is still built by icons-stage.js / packages/tokens/figma/palette-stage.js; run those first when the
// icons or colours change, then this script. The previous frame is kept as "<name> (old)".
import { FOUNDATION_LIB } from './lib/foundation.js';

const ICON_GROUPS = [
  ['navigation', '13 · Lucide'], ['action', '16 · Lucide'], ['status', '6 · Lucide'], ['communication', '6 · Lucide'],
  ['content', '16 · Lucide'], ['media', '9 · Lucide'], ['system', '5 · Lucide'],
];
const HUES = ['Blue', 'Violet', 'Purple', 'Pink', 'Red', 'Orange', 'Amber', 'Lime', 'Green', 'Teal', 'Cyan', 'Sky'];

const SPECS = {
  icons: {
    page: 'Icons', source: 'Library',
    header: {
      status: 'Ready', title: 'Icons',
      summary: 'Lucide 71（線をアウトライン化した塗り）と Simple Icons 10（20/24 で光学的に揃える）。色は Color/Icon/* に束縛。置くときは Icon を使い、Size と glyph を選ぶ。正本は packages/ui/icons.json。',
      updated: '2026-09-30', storybook: 'https://kouichiishikawa.github.io/aristocraft-design-system/?path=/story/components-icon--gallery',
    },
    sections: [
      {
        heading: 'Icon', description: '置くのはこの部品。Size は Extra Small 12 / Small 16 / Medium 24 / Large 32 / Extra Large 48（Dimension/Size 300–1200）、glyph は instance swap で選ぶ。',
        groups: [{ from: 'Icon component', title: 'Icon', meta: 'Size 5 · Glyph = instance swap' }],
      },
      {
        heading: 'Glyphs', description: '採用しているアイコンの一覧（用途ごと）。追加は packages/ui/icons.json に足してから icons-stage.js で生成する。',
        groups: [
          ...ICON_GROUPS.map(([g, meta]) => ({ from: g, title: g, meta })),
          { from: 'brand', title: 'brand', meta: '10 · Simple Icons（LinkedIn は Font Awesome）' },
        ],
      },
    ],
  },
  palette: {
    page: 'Palette', source: 'Palette',
    header: {
      status: 'Ready', title: 'Palette',
      summary: 'Primitive の色 153。塗りは Primitives の Color/* 変数に束縛。見本ごとに 段 · Hex · OKLCH · WCAG 2.2 コントラスト比（neutral 50 上 · neutral 950 上）。本文 4.5 / UI 3.0 が AA。正本は packages/tokens/tokens/primitives/color.json。',
      updated: '2026-10-05',
    },
    sections: [
      {
        heading: 'Neutral', description: '地・文字・枠の基になる無彩色（H 82.6°、青の補色側に寄せた灰）と、その半透明 8 段。',
        groups: [
          { from: 'Neutral', title: 'Neutral' },
          { from: 'Neutral Alpha', title: 'Neutral Alpha' },
        ],
      },
      {
        heading: 'Hues', description: '12 色相（30° 刻み）× 11 段（50–950）。Blue の 600 がブランドのキー #316EEE。意味を持たせるのは semantic 層で、ここは素材。',
        groups: HUES.map((h) => ({ from: h, title: h })),
      },
    ],
  },
};

const key = process.argv[2];
if (!SPECS[key]) { console.error('usage: node figma/foundation-doc-stage.js icons|palette'); process.exit(1); }
const script = String.raw`
${FOUNDATION_LIB}
return await buildFoundationPage(__SPEC__);`;

process.stdout.write(script.replace('__SPEC__', JSON.stringify(SPECS[key])));
