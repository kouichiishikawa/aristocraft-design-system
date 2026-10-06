// Prints the `use_figma` script that lays out the Button page with the component page template (figma/lib/page.js):
// Header → Example → Components (the set, with axis labels) → Parts (Spinner, Focus Ring).
//   node figma/button-doc-stage.js → use_figma
// Re-run after editing SPEC; previous Header / sections are kept as "(old)".
import { PAGE_LIB } from './lib/page.js';

const states = ['Default', 'Hovered', 'Pressed', 'Focused', 'Disabled', 'Loading'];
const variants = ['Default', 'Primary', 'Secondary', 'Tertiary', 'Danger'];
const grid = { colW: 160, rowH: 72, pad: 32, groupGap: 32, rowsPerVariant: 6 }; // see button-stage.js

const SPEC = {
  page: 'Button', set: 'Button',
  header: {
    status: 'Ready', title: 'Button',
    summary: '操作のきっかけになる部品。variant 5 × size 3 × shape 2 × state 6。寸法と色はトークンに束縛、focused は Focus Ring、loading は Spinner。文字必須（icon-only は IconButton）。',
    updated: '2026-10-06', storybook: 'Components/Button',
  },
  example: [
    { variant: 'Variant=Primary, Size=Medium, Shape=Rounded, State=Default', props: { Label: 'Primary' } },
    { variant: 'Variant=Default, Size=Medium, Shape=Rounded, State=Default', props: { Label: 'Default' } },
    { variant: 'Variant=Secondary, Size=Medium, Shape=Rounded, State=Default', props: { Label: 'Secondary' } },
    { variant: 'Variant=Tertiary, Size=Medium, Shape=Rounded, State=Default', props: { Label: 'Tertiary' } },
    { variant: 'Variant=Danger, Size=Medium, Shape=Rounded, State=Default', props: { Label: 'Danger' } },
    { variant: 'Variant=Default, Size=Medium, Shape=Pill, State=Default', props: { Label: 'With icon', 'Icon Before': true } },
  ],
  axes: {
    cols: states.map((s, i) => [s, grid.pad + i * grid.colW]),
    rows: variants.map((v, i) => [v, grid.pad + i * (grid.rowsPerVariant * grid.rowH + grid.groupGap) + 10]),
  },
  parts: [
    { set: 'Spinner', variant: 'Size=Medium' },
    { set: 'Focus Ring' },
  ],
};

const script = String.raw`
${PAGE_LIB}
const out = await buildComponentPage(__SPEC__);
return out;`;

process.stdout.write(script.replace('__SPEC__', JSON.stringify(SPEC)));
