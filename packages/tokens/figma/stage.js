// Prints the use_figma script for one stage: `node figma/stage.js primitives`
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const stage = process.argv[2];
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
const [part, parts] = (process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : '1/1').split('/').map(Number);
const all = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist/figma/variables.json'), 'utf8'));
const template = fs.readFileSync(path.join(ROOT, 'figma/import.js'), 'utf8');

let data;
if (stage === 'text') data = { textStyles: all.textStyles };
else if (stage === 'effects') data = { effectStyles: all.effectStyles };
else if (stage === 'verify') data = { collections: all.collections.map((c) => ({ name: c.name, variables: c.variables.map((v) => ({ name: v.name })) })) };
else {
  const col = all.collections.find((c) => c.name === stage);
  if (!col) { console.error(`unknown stage ${stage}`); process.exit(1); }
  // Strip what the plugin can derive (codeSyntax) and slice into parts to stay under the 50k-char limit.
  // codeSyntax is derivable from the name (see css() in import.js) except for the shadow layer
  // colours, which point at the composite CSS shadow token; keep only the non-derivable ones.
  const derived = (name) => `var(--ac-${name.split('/').map((x) => x.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()).join('-')})`;
  const vars = col.variables
    .filter((v) => !only || v.name.startsWith(only)) // `--only Color/Background/Brand` = re-sync one group
    .map(({ codeSyntax, ...v }) => (codeSyntax === derived(v.name) ? v : { ...v, codeSyntax }));
  const size = Math.ceil(vars.length / parts);
  data = { collections: [{ ...col, variables: vars.slice((part - 1) * size, part * size) }] };
}
const code = template.replace('__STAGE__', stage).replace('__DATA__', JSON.stringify(data));
process.stdout.write(code);
