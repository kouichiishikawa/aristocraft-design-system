// Prints the `use_figma` script that lays out the Button page with the component page template (figma/lib/page.js):
// Header, then three columns: Example (Light / Dark) | Components (the set with axis labels) | Parts (none for Button —
// Spinner and Focus Ring are components with their own pages, and the Icon slot is the Icon component).
//   node figma/button-doc-stage.js → use_figma
// Re-run after editing SPEC; previous Header / sections are kept as "(old)".
import { PAGE_LIB } from './lib/page.js';

const states = ['Default', 'Hovered', 'Pressed', 'Focused', 'Disabled', 'Loading'];
const variants = ['Default', 'Primary', 'Secondary', 'Tertiary', 'Danger'];
const grid = { colW: 160, rowH: 72, pad: 32, groupGap: 32, rowsPerVariant: 6 }; // see button-stage.js

const md = (variant, state = 'Default', shape = 'Rounded') => `Variant=${variant}, Size=Medium, Shape=${shape}, State=${state}`;
const SPEC = {
  page: 'Button', set: 'Button',
  header: {
    status: 'Ready', title: 'Button',
    summary: '操作のきっかけになる部品。variant 5 × size 3 × shape 2 × state 6。寸法と色はトークンに束縛、focused は Focus Ring、loading は Spinner。文字は必須（icon-only は IconButton）。',
    updated: '2026-10-06', storybook: 'https://kouichiishikawa.github.io/aristocraft-design-system/?path=/docs/components-button--docs',
  },
  example: [
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
  axes: {
    cols: states.map((s, i) => [s, grid.pad + i * grid.colW]),
    rows: variants.map((v, i) => [v, grid.pad + i * (grid.rowsPerVariant * grid.rowH + grid.groupGap) + 10]),
  },
  parts: [],
};

const script = String.raw`
${PAGE_LIB}
const out = await buildComponentPage(__SPEC__);
return out;`;

process.stdout.write(script.replace('__SPEC__', JSON.stringify(SPEC)));
