// Prints the `use_figma` script that lays out the Button page with the component page template v3 (figma/lib/page.js):
// one vertical document frame — Header, Example (Light | Dark), Components (the set in a labelled grid). No Parts for
// Button: Spinner and Focus Ring are components with their own pages, and the Icon slot is the Icon component.
//   node figma/button-doc-stage.js → use_figma
// Re-run after editing SPEC; the previous frame is kept as "Button (old)".
import { PAGE_LIB } from './lib/page.js';

const grid = { colW: 160, rowH: 72, pad: 32, groupGap: 32, rowsPerVariant: 6 }; // see button-stage.js

const md = (variant, state = 'Default', shape = 'Rounded') => `Variant=${variant}, Size=Medium, Shape=${shape}, State=${state}`;
const SPEC = {
  page: 'Button', set: 'Button', width: 1232,
  header: {
    status: 'Ready', title: 'Button',
    summary: '操作のきっかけになる部品。寸法と色はトークンに束縛し、フォーカスは Focus Ring、読み込み中は Spinner で示す。文字ラベルは必須（アイコンだけなら IconButton）。',
    updated: '2026-10-06', storybook: 'https://kouichiishikawa.github.io/aristocraft-design-system/?path=/docs/components-button--docs',
  },
  example: {
    description: 'そのまま貼って使える作例。Light と Dark はモードを切り替えただけの同じ構成。',
    rows: [
      [
        { variant: md('Primary'), props: { Label: 'Primary' } },
        { variant: md('Default'), props: { Label: 'Default' } },
        { variant: md('Secondary'), props: { Label: 'Secondary' } },
        { variant: md('Tertiary'), props: { Label: 'Tertiary' } },
        { variant: md('Danger'), props: { Label: 'Danger' } },
      ],
      [
        { variant: 'Variant=Default, Size=Small, Shape=Rounded, State=Default', props: { Label: 'Small' } },
        { variant: md('Default'), props: { Label: 'Medium' } },
        { variant: 'Variant=Default, Size=Large, Shape=Rounded, State=Default', props: { Label: 'Large' } },
        { variant: md('Primary', 'Default', 'Pill'), props: { Label: 'Continue', 'Icon After': true } },
      ],
      [
        { variant: md('Primary', 'Loading'), props: { Label: 'Saving' } },
        { variant: md('Default', 'Disabled'), props: { Label: 'Disabled' } },
        { variant: md('Secondary', 'Focused'), props: { Label: 'Focused' } },
      ],
    ],
  },
  components: {
    description: '全 180 variant（Variant 5 × Size 3 × Shape 2 × State 6）。行は Size と Shape、列は State。',
    grid: {
      cols: ['Default', 'Hovered', 'Pressed', 'Focused', 'Disabled', 'Loading'],
      groups: ['Default', 'Primary', 'Secondary', 'Tertiary', 'Danger'],
      // [caption, button height] per row inside a variant group (button-stage.js order)
      sub: [['Small · Rounded', 32], ['Small · Pill', 32], ['Medium · Rounded', 40], ['Medium · Pill', 40], ['Large · Rounded', 48], ['Large · Pill', 48]],
      colW: grid.colW, rowH: grid.rowH, pad: grid.pad, groupStride: grid.rowsPerVariant * grid.rowH + grid.groupGap,
    },
  },
  parts: [],
};

const script = String.raw`
${PAGE_LIB}
const out = await buildComponentPage(__SPEC__);
return out;`;

process.stdout.write(script.replace('__SPEC__', JSON.stringify(SPEC)));
