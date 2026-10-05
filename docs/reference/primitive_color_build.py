"""Writes the primitive colour tokens from the palette. Run after palette_build.py / neutral_alpha_build.py:
    python3 primitive_color_build.py
Updates $value, $extensions.ac.oklch (derived from the hex, as before) and the alpha fields of
packages/tokens/tokens/primitives/color.json in place; every $description, ac.method and the key order are kept.
The committed JSON stays the source of truth (CI reads it); this only exists so the palette revision is reproducible."""
import json
from color import oklch

TOK='../../packages/tokens/tokens/primitives/color.json'
doc=json.load(open(TOK)); col=doc['color']
pal=json.load(open('palette.json')); al=json.load(open('neutral-alpha.json'))

def lch(hx):
    L,C,H=oklch(hx); return {"l":round(L,3),"c":round(C,3),"h":round(H,1)}

changed=[]
for hue,entry in pal.items():
    for o in entry['scale']:
        tok=col[hue][str(o['step'])]
        if tok['$value'].upper()!=o['hex'].upper(): changed.append(f"{hue}.{o['step']} {tok['$value']} -> {o['hex']}")
        tok['$value']=o['hex']
        if o['hex'].upper() not in ('#FFFFFF','#000000'): tok['$extensions']['ac.oklch']=lch(o['hex'])  # pure white/black keep the nominal hue
for mode,v in al.items():
    fg_ref,fg_hex=v['fg'].split(); bg_ref,bg_hex=v['bg'].split()
    for s in v['steps']:
        tok=col['neutral'][f"{s['step']}a"]
        value=f"{fg_hex}{round(s['alpha']*255):02X}"
        if tok['$value'].upper()!=value.upper(): changed.append(f"neutral.{s['step']}a {tok['$value']} -> {value} (α {s['alpha_pct']}%)")
        tok['$value']=value
        exact=('–' not in s['matches'])
        tok['$description']=f"{fg_ref} （{mode}）α {s['alpha_pct']}%。{bg_ref} 上で {s['matches'].replace('–',' と ')} {'と一致' if exact else 'の中間'}（合成 {s['result']}）"
        ext={"ac.alpha":s['alpha'],"ac.base":f"{{color.{fg_ref}}}","ac.target":s['target']}
        if exact: ext["ac.matches"]=f"{{color.{s['matches']}}}"
        tok['$extensions']=ext
json.dump(doc,open(TOK,'w'),indent=2,ensure_ascii=False); open(TOK,'a').write('\n')
print(f'{len(changed)} values changed'); print('\n'.join('  '+c for c in changed))
