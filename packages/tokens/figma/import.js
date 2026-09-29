// Imports dist/figma/variables.json into a Figma file. Runs inside Figma via the
// Figma MCP `use_figma` tool (Plugin API), one STAGE per call, in this order:
//   primitives → semantic → color → text → effects → verify
// The plugin sandbox has no fetch(), so `node figma/stage.js <stage>` prints this file with
// STAGE and DATA filled in; paste that output as the `use_figma` code (≤ 50k chars, so big
// collections are split: `node figma/stage.js color 1/2`, then `2/2`).
// Idempotent: existing collections / variables / styles are matched by name and updated.
// Source of truth stays tokens/ — never edit variables in Figma by hand; edit tokens/, rebuild, re-run.
const STAGE = '__STAGE__'; // primitives | semantic | color | text | effects | verify
const data = __DATA__;

// CSS custom property name from the Figma name (same rule as build/hooks.js cssName).
const css = (name) => `var(--ac-${name.split('/').map((x) => x.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()).join('-')})`;
const hex = (h) => {
  const n = h.replace('#', '');
  const p = (i) => parseInt(n.slice(i, i + 2), 16) / 255;
  return { r: p(0), g: p(2), b: p(4), a: n.length === 8 ? p(6) : 1 };
};
const out = { stage: STAGE, created: 0, updated: 0, errors: [] };
const variables = await figma.variables.getLocalVariablesAsync();
const byName = new Map(variables.map((v) => [v.name, v]));
const collections = await figma.variables.getLocalVariableCollectionsAsync();

async function importCollection(spec) {
  let col = collections.find((c) => c.name === spec.name);
  if (!col) {
    col = figma.variables.createVariableCollection(spec.name);
    col.renameMode(col.modes[0].modeId, spec.modes[0]);
    for (const m of spec.modes.slice(1)) col.addMode(m);
  }
  const modeIds = Object.fromEntries(col.modes.map((m) => [m.name, m.modeId]));
  for (const v of spec.variables) {
    let vr = byName.get(v.name);
    if (vr && vr.variableCollectionId !== col.id) { out.errors.push(`${v.name}: exists in another collection`); continue; }
    if (!vr) { vr = figma.variables.createVariable(v.name, col, v.type); byName.set(v.name, vr); out.created++; }
    else out.updated++;
    vr.scopes = v.scopes;
    vr.description = v.description || '';
    vr.setVariableCodeSyntax('WEB', v.codeSyntax ?? css(v.name));
    for (const [mode, val] of Object.entries(v.values)) {
      const modeId = modeIds[mode];
      if (!modeId) { out.errors.push(`${v.name}: no mode ${mode}`); continue; }
      if (val && typeof val === 'object' && val.alias) {
        const target = byName.get(val.alias);
        if (!target) { out.errors.push(`${v.name}: alias ${val.alias} missing`); continue; }
        vr.setValueForMode(modeId, { type: 'VARIABLE_ALIAS', id: target.id });
      } else {
        vr.setValueForMode(modeId, v.type === 'COLOR' ? hex(val) : val);
      }
    }
  }
  out.collection = { id: col.id, name: col.name, modes: col.modes.map((m) => m.name), variables: col.variableIds.length };
}

async function importTextStyles(specs) {
  // Style names differ between Figma's Google Fonts copy ("Semi Bold") and local Inter 4 ("SemiBold"):
  // pick whichever variant this Figma instance can load.
  const available = await figma.listAvailableFontsAsync();
  const has = (family, style) => available.some((f) => f.fontName.family === family && f.fontName.style === style);
  const resolveStyle = (family, style) => {
    const variants = [style, style.replace(/([a-z])([A-Z])/g, '$1 $2'), style.replace(/ /g, '')];
    return variants.find((v) => has(family, v)) ?? style;
  };
  for (const s of specs) s.figmaFont = { family: s.figmaFont.family, style: resolveStyle(s.figmaFont.family, s.figmaFont.style) };
  const fonts = new Set(specs.map((s) => JSON.stringify(s.figmaFont)));
  for (const f of fonts) await figma.loadFontAsync(JSON.parse(f));
  const existing = new Map((await figma.getLocalTextStylesAsync()).map((s) => [s.name, s]));
  for (const s of specs) {
    let st = existing.get(s.name);
    if (!st) { st = figma.createTextStyle(); st.name = s.name; out.created++; } else out.updated++;
    st.fontName = s.figmaFont;
    st.fontSize = s.fontSize;
    st.lineHeight = s.lineHeight;
    st.letterSpacing = s.letterSpacing;
    st.description = `${s.description}\nfont-family: ${s.fontFamily.join(', ')}\nCSS: ${s.codeSyntax}`;
  }
  out.textStyles = (await figma.getLocalTextStylesAsync()).length;
}

async function importEffectStyles(specs) {
  const existing = new Map((await figma.getLocalEffectStylesAsync()).map((s) => [s.name, s]));
  for (const s of specs) {
    let st = existing.get(s.name);
    if (!st) { st = figma.createEffectStyle(); st.name = s.name; out.created++; } else out.updated++;
    st.effects = s.effects.map((e) => {
      let eff = { type: e.type, color: hex(e.color), offset: e.offset, radius: e.radius, spread: e.spread, visible: true, blendMode: 'NORMAL' };
      const cv = byName.get(e.colorVariable);
      if (cv) eff = figma.variables.setBoundVariableForEffect(eff, 'color', cv);
      else out.errors.push(`${s.name}: colour variable ${e.colorVariable} missing`);
      return eff;
    });
    st.description = `${s.description}\nCSS: ${s.codeSyntax}`;
  }
  out.effectStyles = (await figma.getLocalEffectStylesAsync()).length;
}

async function verify() {
  out.collections = collections.map((c) => ({ name: c.name, modes: c.modes.map((m) => m.name), variables: c.variableIds.length }));
  out.expected = data.collections.map((c) => ({ name: c.name, variables: c.variables.length }));
  out.textStyles = (await figma.getLocalTextStylesAsync()).length;
  out.effectStyles = (await figma.getLocalEffectStylesAsync()).map((s) => ({ name: s.name, bound: s.effects.every((e) => e.boundVariables?.color) }));
  const sample = byName.get('color/text/brand');
  const col = collections.find((c) => c.id === sample?.variableCollectionId);
  out.sample = sample && col ? Object.fromEntries(col.modes.map((m) => {
    const v = sample.valuesByMode[m.modeId];
    const target = v?.type === 'VARIABLE_ALIAS' ? variables.find((x) => x.id === v.id) : null;
    return [m.name, target ? `alias → ${target.name}` : JSON.stringify(v)];
  })) : 'color/text/brand not found';
  out.missing = data.collections.flatMap((c) => c.variables.filter((v) => !byName.has(v.name)).map((v) => v.name));
}

if (STAGE === 'text') await importTextStyles(data.textStyles);
else if (STAGE === 'effects') await importEffectStyles(data.effectStyles.light);
else if (STAGE === 'verify') await verify();
else {
  const spec = data.collections.find((c) => c.name === STAGE);
  if (!spec) throw new Error(`unknown stage ${STAGE}`);
  await importCollection(spec);
}
return out;
