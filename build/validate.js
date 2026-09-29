// Validates tokens/ against the DTCG rules this repo relies on, before Style Dictionary runs.
// Exit code 1 on any error. Run: `node build/validate.js`
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TOKENS_DIR = path.join(ROOT_DIR, 'tokens');
const KEY = /^[A-Za-z0-9]+$/;
const REF = /^\{([A-Za-z0-9.$]+)\}$/;
const HEX = /^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/;
const UNITS = { dimension: ['px', 'em', 'rem', '%'], duration: ['ms', 's'] };
const TYPO_KEYS = ['fontFamily', 'fontSize', 'lineHeight', 'letterSpacing', 'fontWeight'];
const SHADOW_KEYS = ['color', 'offsetX', 'offsetY', 'blur', 'spread', 'inset'];

const errors = [];
const err = (file, name, msg) => errors.push(`${file} ${name}: ${msg}`);

const isRef = (v) => typeof v === 'string' && REF.test(v);
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const isUnit = (v, units) =>
  v && typeof v === 'object' && isNum(v.value) && units.includes(v.unit);

const VALID = {
  color: (v) => typeof v === 'string' && HEX.test(v),
  dimension: (v) => isUnit(v, UNITS.dimension),
  duration: (v) => isUnit(v, UNITS.duration),
  cubicBezier: (v) => Array.isArray(v) && v.length === 4 && v.every(isNum),
  number: isNum,
  string: (v) => typeof v === 'string',
  fontFamily: (v) => typeof v === 'string' || (Array.isArray(v) && v.every((s) => typeof s === 'string')),
  fontWeight: (v) => (isNum(v) && v >= 1 && v <= 1000) || typeof v === 'string',
  typography: (v) =>
    v && typeof v === 'object' && !Array.isArray(v) &&
    Object.keys(v).every((k) => TYPO_KEYS.includes(k)) &&
    Object.entries(v).every(([k, x]) => isRef(x) || (k === 'fontFamily' ? VALID.fontFamily(x)
      : k === 'fontWeight' ? VALID.fontWeight(x)
      : k === 'lineHeight' ? isNum(x) || VALID.dimension(x)
      : VALID.dimension(x))),
  shadow: (v) =>
    Array.isArray(v) && v.length > 0 && v.every((l) =>
      l && typeof l === 'object' && Object.keys(l).every((k) => SHADOW_KEYS.includes(k)) &&
      (isRef(l.color) || VALID.color(l.color)) &&
      ['offsetX', 'offsetY', 'blur', 'spread'].every((k) => isRef(l[k]) || VALID.dimension(l[k]))),
};

/** Collect every `{ref}` inside a value (strings, arrays, objects). */
function refsIn(v, out = []) {
  if (isRef(v)) out.push(v.slice(1, -1));
  else if (Array.isArray(v)) v.forEach((x) => refsIn(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => refsIn(x, out));
  return out;
}

/** Walk one file. Returns Map<name, { type, value }>. */
function walkFile(file, node) {
  const tokens = new Map();
  const visit = (n, pathSegs, inheritedType) => {
    const name = pathSegs.filter((p) => p !== '$root').join('.');
    const type = n.$type ?? inheritedType;
    if ('$value' in n) {
      const extra = Object.keys(n).filter((k) => !k.startsWith('$'));
      if (extra.length) err(file, name, `token also has children ${extra.join(', ')} (use "$root")`);
      if (!type) err(file, name, 'no $type (own or inherited)');
      else if (!VALID[type]) err(file, name, `unknown $type "${type}"`);
      else if (!isRef(n.$value) && !VALID[type](n.$value)) err(file, name, `invalid ${type} value ${JSON.stringify(n.$value)}`);
      if (tokens.has(name)) err(file, name, 'duplicate token name');
      tokens.set(name, { type, value: n.$value });
      return;
    }
    for (const [k, v] of Object.entries(n)) {
      if (k === '$root') {
        if (!v || typeof v !== 'object' || !('$value' in v)) err(file, name, '$root must be a token');
        else visit(v, [...pathSegs, k], type);
        continue;
      }
      if (k.startsWith('$')) continue; // $type / $description / $metadata / $extensions
      if (!KEY.test(k)) err(file, `${name}.${k}`, 'key must match [A-Za-z0-9]+');
      if (v && typeof v === 'object') visit(v, [...pathSegs, k], type);
      else err(file, `${name}.${k}`, 'group member must be an object');
    }
  };
  visit(node, [], undefined);
  return tokens;
}

function main() {
  const meta = JSON.parse(fs.readFileSync(path.join(TOKENS_DIR, '$metadata.json'), 'utf8'));
  const listed = meta.tokenSetOrder.map((s) => `${s}.json`);
  const onDisk = fs.readdirSync(TOKENS_DIR, { recursive: true })
    .map(String).filter((f) => f.endsWith('.json') && !f.startsWith('$'));
  for (const f of onDisk) if (!listed.includes(f)) err(f, '-', 'not listed in $metadata.json tokenSetOrder');
  for (const f of listed) if (!onDisk.includes(f)) err(f, '-', 'listed in $metadata.json but missing');

  const perFile = new Map();
  for (const f of listed) {
    if (!onDisk.includes(f)) continue;
    let json;
    try { json = JSON.parse(fs.readFileSync(path.join(TOKENS_DIR, f), 'utf8')); }
    catch (e) { err(f, '-', `invalid JSON: ${e.message}`); continue; }
    perFile.set(f, walkFile(f, json));
  }

  // Names are unique across files, except the light/dark pair which must match exactly.
  const light = perFile.get('semantic/color.light.json') ?? new Map();
  const dark = perFile.get('semantic/color.dark.json') ?? new Map();
  for (const n of light.keys()) if (!dark.has(n)) err('semantic/color.dark.json', n, 'missing (exists in light)');
  for (const n of dark.keys()) if (!light.has(n)) err('semantic/color.light.json', n, 'missing (exists in dark)');
  const owner = new Map();
  for (const [f, toks] of perFile) {
    if (f === 'semantic/color.dark.json') continue;
    for (const n of toks.keys()) {
      if (owner.has(n)) err(f, n, `duplicate across files (also in ${owner.get(n)})`);
      owner.set(n, f);
    }
  }

  // Every reference resolves to a known token.
  for (const [f, toks] of perFile) {
    for (const [n, t] of toks) {
      for (const r of refsIn(t.value)) {
        const target = r.replace(/\.\$root$/, '');
        if (!owner.has(target) && !dark.has(target)) err(f, n, `unresolved reference {${r}}`);
      }
    }
  }

  const total = [...perFile.values()].reduce((s, m) => s + m.size, 0);
  if (errors.length) {
    console.error(`tokens: ${errors.length} error(s)\n` + errors.map((e) => '  ' + e).join('\n'));
    process.exit(1);
  }
  console.log(`tokens ok: ${perFile.size} files, ${total} tokens`);
}

main();
