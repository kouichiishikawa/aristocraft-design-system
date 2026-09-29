// Imports dist/figma/variables.json into a Figma file. Runs inside Figma via the
// Figma MCP `use_figma` tool (Plugin API), one STAGE per call, in this order:
//   primitives → semantic → color → text → effects → verify
// The plugin sandbox has no fetch(), so `node figma/stage.js <stage>` prints this file with
// STAGE and DATA filled in; paste that output as the `use_figma` code (≤ 50k chars, so big
// collections are split: `node figma/stage.js color 1/2`, then `2/2`).
// Idempotent: existing collections / variables / styles are matched by name and updated.
// Source of truth stays tokens/ — never edit variables in Figma by hand; edit tokens/, rebuild, re-run.
const STAGE = 'text'; // primitives | semantic | color | text | effects | verify
const data = {"textStyles":[{"name":"font/display/sm","fontFamily":["Inter Variable","Inter","Noto Sans JP","system-ui","sans-serif"],"fontSize":48,"lineHeight":{"unit":"PIXELS","value":60},"letterSpacing":{"unit":"PERCENT","value":-2},"fontWeight":700,"figmaFont":{"family":"Inter","style":"Bold"},"codeSyntax":"var(--font-display-sm-font-size)","description":"48px / 60px（1.25）· bold · letterSpacing.sm"},{"name":"font/display/md","fontFamily":["Inter Variable","Inter","Noto Sans JP","system-ui","sans-serif"],"fontSize":64,"lineHeight":{"unit":"PIXELS","value":80},"letterSpacing":{"unit":"PERCENT","value":-2},"fontWeight":700,"figmaFont":{"family":"Inter","style":"Bold"},"codeSyntax":"var(--font-display-md-font-size)","description":"64px / 80px（1.25）· bold · letterSpacing.sm"},{"name":"font/display/lg","fontFamily":["Inter Variable","Inter","Noto Sans JP","system-ui","sans-serif"],"fontSize":80,"lineHeight":{"unit":"PIXELS","value":100},"letterSpacing":{"unit":"PERCENT","value":-2},"fontWeight":700,"figmaFont":{"family":"Inter","style":"Bold"},"codeSyntax":"var(--font-display-lg-font-size)","description":"80px / 100px（1.25）· bold · letterSpacing.sm"},{"name":"font/display/xl","fontFamily":["Inter Variable","Inter","Noto Sans JP","system-ui","sans-serif"],"fontSize":96,"lineHeight":{"unit":"PIXELS","value":120},"letterSpacing":{"unit":"PERCENT","value":-2},"fontWeight":700,"figmaFont":{"family":"Inter","style":"Bold"},"codeSyntax":"var(--font-display-xl-font-size)","description":"96px / 120px（1.25）· bold · letterSpacing.sm"},{"name":"font/display/xxl","fontFamily":["Inter Variable","Inter","Noto Sans JP","system-ui","sans-serif"],"fontSize":128,"lineHeight":{"unit":"PIXELS","value":160},"letterSpacing":{"unit":"PERCENT","value":-2},"fontWeight":700,"figmaFont":{"family":"Inter","style":"Bold"},"codeSyntax":"var(--font-display-xxl-font-size)","description":"128px / 160px（1.25）· bold · letterSpacing.sm"},{"name":"font/heading/xs","fontFamily":["Inter Variable","Inter","Noto Sans JP","system-ui","sans-serif"],"fontSize":16,"lineHeight":{"unit":"PIXELS","value":20},"letterSpacing":{"unit":"PERCENT","value":0},"fontWeight":600,"figmaFont":{"family":"Inter","style":"Semi Bold"},"codeSyntax":"var(--font-heading-xs-font-size)","description":"16px / 20px（1.25）· semibold · letterSpacing.md"},{"name":"font/heading/sm","fontFamily":["Inter Variable","Inter","Noto Sans JP","system-ui","sans-serif"],"fontSize":18,"lineHeight":{"unit":"PIXELS","value":24},"letterSpacing":{"unit":"PERCENT","value":0},"fontWeight":600,"figmaFont":{"family":"Inter","style":"Semi Bold"},"codeSyntax":"var(--font-heading-sm-font-size)","description":"18px / 24px（1.33）· semibold · letterSpacing.md"},{"name":"font/heading/md","fontFamily":["Inter Variable","Inter","Noto Sans JP","system-ui","sans-serif"],"fontSize":20,"lineHeight":{"unit":"PIXELS","value":28},"letterSpacing":{"unit":"PERCENT","value":0},"fontWeight":600,"figmaFont":{"family":"Inter","style":"Semi Bold"},"codeSyntax":"var(--font-heading-md-font-size)","description":"20px / 28px（1.40）· semibold · letterSpacing.md"},{"name":"font/heading/lg","fontFamily":["Inter Variable","Inter","Noto Sans JP","system-ui","sans-serif"],"fontSize":24,"lineHeight":{"unit":"PIXELS","value":32},"letterSpacing":{"unit":"PERCENT","value":0},"fontWeight":600,"figmaFont":{"family":"Inter","style":"Semi Bold"},"codeSyntax":"var(--font-heading-lg-font-size)","description":"24px / 32px（1.33）· semibold · letterSpacing.md"},{"name":"font/heading/xl","fontFamily":["Inter Variable","Inter","Noto Sans JP","system-ui","sans-serif"],"fontSize":28,"lineHeight":{"unit":"PIXELS","value":36},"letterSpacing":{"unit":"PERCENT","value":-2},"fontWeight":600,"figmaFont":{"family":"Inter","style":"Semi Bold"},"codeSyntax":"var(--font-heading-xl-font-size)","description":"28px / 36px（1.29）· semibold · letterSpacing.sm"},{"name":"font/heading/xxl","fontFamily":["Inter Variable","Inter","Noto Sans JP","system-ui","sans-serif"],"fontSize":32,"lineHeight":{"unit":"PIXELS","value":40},"letterSpacing":{"unit":"PERCENT","value":-2},"fontWeight":600,"figmaFont":{"family":"Inter","style":"Semi Bold"},"codeSyntax":"var(--font-heading-xxl-font-size)","description":"32px / 40px（1.25）· semibold · letterSpacing.sm"},{"name":"font/heading/xxxl","fontFamily":["Inter Variable","Inter","Noto Sans JP","system-ui","sans-serif"],"fontSize":40,"lineHeight":{"unit":"PIXELS","value":48},"letterSpacing":{"unit":"PERCENT","value":-2},"fontWeight":600,"figmaFont":{"family":"Inter","style":"Semi Bold"},"codeSyntax":"var(--font-heading-xxxl-font-size)","description":"40px / 48px（1.20）· semibold · letterSpacing.sm"},{"name":"font/body/sm","fontFamily":["Inter Variable","Inter","Noto Sans JP","system-ui","sans-serif"],"fontSize":14,"lineHeight":{"unit":"PIXELS","value":24},"letterSpacing":{"unit":"PERCENT","value":0},"fontWeight":400,"figmaFont":{"family":"Inter","style":"Regular"},"codeSyntax":"var(--font-body-sm-font-size)","description":"14px / 24px（1.71）· regular · letterSpacing.md"},{"name":"font/body/md","fontFamily":["Inter Variable","Inter","Noto Sans JP","system-ui","sans-serif"],"fontSize":16,"lineHeight":{"unit":"PIXELS","value":28},"letterSpacing":{"unit":"PERCENT","value":0},"fontWeight":400,"figmaFont":{"family":"Inter","style":"Regular"},"codeSyntax":"var(--font-body-md-font-size)","description":"16px / 28px（1.75）· regular · letterSpacing.md"},{"name":"font/body/lg","fontFamily":["Inter Variable","Inter","Noto Sans JP","system-ui","sans-serif"],"fontSize":18,"lineHeight":{"unit":"PIXELS","value":28},"letterSpacing":{"unit":"PERCENT","value":0},"fontWeight":400,"figmaFont":{"family":"Inter","style":"Regular"},"codeSyntax":"var(--font-body-lg-font-size)","description":"18px / 28px（1.56）· regular · letterSpacing.md"},{"name":"font/body/xl","fontFamily":["Inter Variable","Inter","Noto Sans JP","system-ui","sans-serif"],"fontSize":20,"lineHeight":{"unit":"PIXELS","value":32},"letterSpacing":{"unit":"PERCENT","value":0},"fontWeight":400,"figmaFont":{"family":"Inter","style":"Regular"},"codeSyntax":"var(--font-body-xl-font-size)","description":"20px / 32px（1.60）· regular · letterSpacing.md"},{"name":"font/label/xs","fontFamily":["Inter Variable","Inter","Noto Sans JP","system-ui","sans-serif"],"fontSize":10,"lineHeight":{"unit":"PIXELS","value":12},"letterSpacing":{"unit":"PERCENT","value":2},"fontWeight":500,"figmaFont":{"family":"Inter","style":"Medium"},"codeSyntax":"var(--font-label-xs-font-size)","description":"10px / 12px（1.20）· medium · letterSpacing.lg"},{"name":"font/label/sm","fontFamily":["Inter Variable","Inter","Noto Sans JP","system-ui","sans-serif"],"fontSize":12,"lineHeight":{"unit":"PIXELS","value":16},"letterSpacing":{"unit":"PERCENT","value":2},"fontWeight":500,"figmaFont":{"family":"Inter","style":"Medium"},"codeSyntax":"var(--font-label-sm-font-size)","description":"12px / 16px（1.33）· medium · letterSpacing.lg"},{"name":"font/label/md","fontFamily":["Inter Variable","Inter","Noto Sans JP","system-ui","sans-serif"],"fontSize":14,"lineHeight":{"unit":"PIXELS","value":20},"letterSpacing":{"unit":"PERCENT","value":0},"fontWeight":500,"figmaFont":{"family":"Inter","style":"Medium"},"codeSyntax":"var(--font-label-md-font-size)","description":"14px / 20px（1.43）· medium · letterSpacing.md"},{"name":"font/label/lg","fontFamily":["Inter Variable","Inter","Noto Sans JP","system-ui","sans-serif"],"fontSize":16,"lineHeight":{"unit":"PIXELS","value":24},"letterSpacing":{"unit":"PERCENT","value":0},"fontWeight":500,"figmaFont":{"family":"Inter","style":"Medium"},"codeSyntax":"var(--font-label-lg-font-size)","description":"16px / 24px（1.50）· medium · letterSpacing.md"},{"name":"font/label/mono/xs","fontFamily":["Geist Mono","ui-monospace","SFMono-Regular","Menlo","monospace"],"fontSize":10,"lineHeight":{"unit":"PIXELS","value":12},"letterSpacing":{"unit":"PERCENT","value":0},"fontWeight":400,"figmaFont":{"family":"Geist Mono","style":"Regular"},"codeSyntax":"var(--font-label-mono-xs-font-size)","description":"10px / 12px（1.20）· regular · letterSpacing.md"},{"name":"font/label/mono/sm","fontFamily":["Geist Mono","ui-monospace","SFMono-Regular","Menlo","monospace"],"fontSize":12,"lineHeight":{"unit":"PIXELS","value":16},"letterSpacing":{"unit":"PERCENT","value":0},"fontWeight":400,"figmaFont":{"family":"Geist Mono","style":"Regular"},"codeSyntax":"var(--font-label-mono-sm-font-size)","description":"12px / 16px（1.33）· regular · letterSpacing.md"},{"name":"font/label/mono/md","fontFamily":["Geist Mono","ui-monospace","SFMono-Regular","Menlo","monospace"],"fontSize":14,"lineHeight":{"unit":"PIXELS","value":20},"letterSpacing":{"unit":"PERCENT","value":0},"fontWeight":400,"figmaFont":{"family":"Geist Mono","style":"Regular"},"codeSyntax":"var(--font-label-mono-md-font-size)","description":"14px / 20px（1.43）· regular · letterSpacing.md"},{"name":"font/label/mono/lg","fontFamily":["Geist Mono","ui-monospace","SFMono-Regular","Menlo","monospace"],"fontSize":16,"lineHeight":{"unit":"PIXELS","value":24},"letterSpacing":{"unit":"PERCENT","value":0},"fontWeight":400,"figmaFont":{"family":"Geist Mono","style":"Regular"},"codeSyntax":"var(--font-label-mono-lg-font-size)","description":"16px / 24px（1.50）· regular · letterSpacing.md"}]};

// CSS custom property name from the Figma name (same rule as build/hooks.js cssName).
const css = (name) => `var(--${name.split('/').map((x) => x.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()).join('-')})`;
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
