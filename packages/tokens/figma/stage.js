// Prints the use_figma script for one stage: `node figma/stage.js Primitives 1/2` (collection name), `text`, `effects`, `verify`
//   --only Color/Background/Brand   re-sync one group (name prefix)
//   --changed-since <git-ref>       only variables whose spec differs from that ref's dist/figma/variables.json (new or changed)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const stage = process.argv[2];
const opt = (flag) => (process.argv.includes(flag) ? process.argv[process.argv.indexOf(flag) + 1] : null);
const only = opt('--only');
const since = opt('--changed-since');
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
  let prev = null;
  if (since) {
    const old = JSON.parse(execFileSync('git', ['show', `${since}:packages/tokens/dist/figma/variables.json`], { cwd: ROOT, encoding: 'utf8' }));
    prev = new Map((old.collections.find((c) => c.name === stage)?.variables ?? []).map((v) => [v.name, JSON.stringify(v)]));
  }
  const vars = col.variables
    .filter((v) => !only || v.name.startsWith(only))
    .filter((v) => !prev || prev.get(v.name) !== JSON.stringify(v))
    .map(({ codeSyntax, ...v }) => (codeSyntax === derived(v.name) ? v : { ...v, codeSyntax }));
  if (since) console.error(`${stage}: ${vars.length} of ${col.variables.length} variables new or changed since ${since}`);
  const size = Math.ceil(vars.length / parts);
  data = { collections: [{ ...col, variables: vars.slice((part - 1) * size, part * size) }] };
}
const code = template.replace('__STAGE__', stage).replace('__DATA__', JSON.stringify(data));
process.stdout.write(code);
