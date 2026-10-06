// Prints the `use_figma` script that builds the documentation frame of the Button page from the page template
// (figma/lib/page.js + the _Doc blocks). The component set itself stays where it is; the "Button" doc frame is placed to
// its left, and row / column axis labels are placed around the set (rows = variant, columns = state).
//   node figma/button-doc-stage.js → use_figma
// Content mirrors docs/components/button.md. Re-run after editing SPEC; the previous frame is kept as "(old)".
import { PAGE_LIB } from './lib/page.js';

const SPEC = {
  page: 'Button', name: 'Button', x: -1600, y: 0, width: 1440,
  header: {
    status: 'Ready', title: 'Button',
    summary: '操作のきっかけになる部品。variant 5（default / primary / secondary / tertiary / danger）× size 3 × shape 2 × state 6 = 180。寸法・色は変数と Text Style に束縛、focused は Focus Ring、loading は Spinner を置く。',
    updated: '2026-10-06', source: 'packages/ui/src/components/Button · docs/components/button.md', links: 'Storybook Components/Button · figma/button-stage.js',
  },
  sections: [
    { heading: 'Overview', description: '文字必須。icon-only は IconButton（別部品）。primary は画面に 1 つ、danger は破壊的操作にだけ使う。', blocks: [
      { type: 'row', gap: 'Dimension/Space/400', blocks: [
        { type: 'instance', set: 'Button', variant: 'Variant=Default, Size=Medium, Shape=Rounded, State=Default', props: { Label: 'Default' } },
        { type: 'instance', set: 'Button', variant: 'Variant=Primary, Size=Medium, Shape=Rounded, State=Default', props: { Label: 'Primary' } },
        { type: 'instance', set: 'Button', variant: 'Variant=Secondary, Size=Medium, Shape=Rounded, State=Default', props: { Label: 'Secondary' } },
        { type: 'instance', set: 'Button', variant: 'Variant=Tertiary, Size=Medium, Shape=Rounded, State=Default', props: { Label: 'Tertiary' } },
        { type: 'instance', set: 'Button', variant: 'Variant=Danger, Size=Medium, Shape=Rounded, State=Default', props: { Label: 'Danger' } },
      ] },
    ] },
    { heading: 'Anatomy', description: '横並びの auto-layout: Icon Before（任意）→ Label → Icon After（任意）。高さは size、左右余白と間隔は space、角丸は radius に束縛。', blocks: [
      { type: 'row', gap: 'Dimension/Space/600', blocks: [
        { type: 'instance', set: 'Button', variant: 'Variant=Default, Size=Large, Shape=Rounded, State=Default', props: { Label: 'Label', 'Icon Before': true, 'Icon After': true } },
        { type: 'axis', text: 'Icon Before · Label · Icon After' },
      ] },
    ] },
    { heading: 'Properties', description: 'Figma のプロパティ名は Title Case、コードは camelCase。', blocks: [
      { type: 'table', header: ['Prop', 'Values', 'Default', 'Notes'], rows: [
        ['variant', 'default / primary / secondary / tertiary / danger', 'default', 'secondary は枠つき、tertiary は面なし'],
        ['size', 'sm / md / lg', 'md', '高さ 32 / 40 / 48。TextField と同じ段'],
        ['shape', 'rounded / pill', 'rounded', 'rounded = sm 8px、md・lg 12px。pill = radius.full'],
        ['iconBefore / iconAfter', 'Lucide のアイコン（Figma は boolean + Glyph 差し替え）', 'なし', '片側のみ推奨'],
        ['loading', 'boolean', 'false', '幅を保ち Icon Before の位置に Spinner、aria-busy、クリック不可'],
        ['disabled', 'boolean', 'false', '全 variant 共通の見た目'],
        ['fullWidth', 'boolean', 'false', 'Figma ではインスタンスの幅を Fill'],
        ['label', 'text', '必須', 'icon-only は IconButton'],
      ] },
    ] },
    { heading: 'Variants', description: '右のセット: 縦 = 種類（各ブロック内は size × shape）、横 = state（Default / Hovered / Pressed / Focused / Disabled / Loading）。', blocks: [
      { type: 'note', kind: 'Note', text: 'hovered / pressed は「地から離れる向き」に 1 段 / 2 段強く（light は濃く、dark は明るく）。focused は要素から 2px 空けて 2px のリング（Focus Ring 部品）。' },
    ] },
    { heading: 'Usage', blocks: [
      { type: 'note', kind: 'Do', text: 'primary は 1 画面に 1 つ。並べるときは default / secondary / tertiary で強さを落とす。' },
      { type: 'note', kind: 'Do', text: '破壊的操作（削除・取り消せない送信）だけ danger にする。確認ダイアログの確定ボタンに使う。' },
      { type: 'note', kind: "Don't", text: 'アイコンだけのボタンにしない（IconButton を使う）。文字スタイルをサイズごとに手で変えない（Label プロパティで全 variant に写る）。' },
    ] },
    { heading: 'Specs', description: '寸法は Figma を正とした値（2026-10-05）。色は semantic トークン。', blocks: [
      { type: 'table', header: ['Size', 'Height / Padding / Gap', 'Text', 'Icon / Spinner'], rows: [
        ['sm', 'size.800 = 32 / space.300 = 12 / space.100 = 4', 'label.md', '16（Small）'],
        ['md', 'size.1000 = 40 / space.400 = 16 / space.150 = 6', 'label.md', '16（Small）'],
        ['lg', 'size.1200 = 48 / space.500 = 20 / space.200 = 8', 'label.lg', '24（Medium）'],
      ] },
      { type: 'table', header: ['Variant', 'Fill (default / hovered / pressed)', 'Text / Icon', 'Border'], rows: [
        ['default', 'background.neutral.default / .hovered / .pressed（100a / 200a / 300a）', 'text.default', '—'],
        ['primary', 'background.brand.bold / .hovered / .pressed（light 600 / 700 / 800、dark 500 / 400 / 300）', 'text.inverse / icon.inverse', '—'],
        ['secondary', 'background.neutral.subtle（透明）/ .hovered / .pressed', 'text.default', 'border.default 1px'],
        ['tertiary', 'background.neutral.subtle（透明）/ .hovered / .pressed', 'text.default', '—'],
        ['danger', 'background.status.error.bold / .hovered / .pressed', 'text.inverse / icon.inverse', '—'],
        ['disabled（共通）', 'background.disabled', 'text.disabled（primary / danger は icon.disabled）', '—'],
      ] },
    ] },
  ],
  // axis labels around the component set (rows = variant blocks of 6 rows × 72, columns = 6 states × 160; see button-stage.js)
  axes: { variants: ['Default', 'Primary', 'Secondary', 'Tertiary', 'Danger'], states: ['Default', 'Hovered', 'Pressed', 'Focused', 'Disabled', 'Loading'], colW: 160, rowH: 72, pad: 32, groupGap: 32, rowsPerVariant: 6 },
};

const script = String.raw`
${PAGE_LIB}
const SPEC = __SPEC__;
const out = await buildPage(SPEC);
// axis labels next to the set
const page = figma.root.children.find((p) => p.name === SPEC.page); await figma.setCurrentPageAsync(page);
const set = page.findOne((n) => n.type === 'COMPONENT_SET' && n.name === 'Button');
const doc = await __docIndex(); await figma.setCurrentPageAsync(page);
for (const old of page.children.filter((n) => n.name === 'Axes')) old.name = 'Axes (old)';
const axes = figma.createFrame(); axes.name = 'Axes'; axes.fills = []; axes.clipsContent = false; axes.resize(set.width, set.height); axes.x = set.x; axes.y = set.y;
page.appendChild(axes); page.insertChild(0, axes); // behind the set
const A = SPEC.axes;
A.states.forEach((s, i) => { const t = __instance(doc, '_Doc/Axis', null, { Text: s }); axes.appendChild(t); t.x = A.pad + i * A.colW; t.y = -20; });
A.variants.forEach((vName, i) => { const t = __instance(doc, '_Doc/Axis', null, { Text: vName }); axes.appendChild(t); t.x = -(t.width + 16); t.y = A.pad + i * (A.rowsPerVariant * A.rowH + A.groupGap) + 10; });
out.axes = axes.id;
return out;`;

process.stdout.write(script.replace('__SPEC__', JSON.stringify(SPEC)));
