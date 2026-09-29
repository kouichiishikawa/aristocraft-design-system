"""CI checker: reads the committed tokens JSON (the source of truth) and runs the 276 contrast checks.
Run: python3 semantic_color_check.py   (exit 1 on any failure). Writes semantic-color-checks.json."""
import json, re, sys
from semantic_color_checks import run_checks

TOK='../../packages/tokens/tokens'
prim=json.load(open(f'{TOK}/primitives/color.json'))['color']
HEX={f'{fam}.{step}':t['$value'] for fam,steps in prim.items() if not fam.startswith('$') for step,t in steps.items() if isinstance(t,dict) and '$value' in t}
# Translucent neutrals are checked as the colour they composite to on their theme surface (same rule as the generator).
al=json.load(open('neutral-alpha.json'))
for mode in ('light','dark'):
    for x in al[mode]['steps']: HEX[f"neutral.{x['step']}a"]=x['result']

def walk(node,path,out):
    if '$value' in node: out['.'.join(p for p in path if p!='$root')]=node['$value']; return
    for k,v in node.items():
        if isinstance(v,dict): walk(v,path+[k],out)

def to_ref(v):
    m=re.fullmatch(r'\{color\.([a-z]+)\.(\d+a?)\}',v) if isinstance(v,str) else None
    return f'{m.group(1)}.{m.group(2)}' if m else v  # literal hex stays as is

M={}
for mode in ('light','dark'):
    flat={}; walk(json.load(open(f'{TOK}/semantic/color.{mode}.json')),[],flat)
    for path,v in flat.items():
        if isinstance(v,list): continue  # shadow layers are not part of the contrast checks
        M.setdefault(path,{})[mode]=to_ref(v)

def hx(r):
    if r.startswith('#'): return r
    if r not in HEX: sys.exit(f'unknown primitive {r}')
    return HEX[r]

checks=run_checks(M,hx)
json.dump(checks,open('semantic-color-checks.json','w'),indent=1,ensure_ascii=False)
fails=[c for c in checks if not c['ok']]
print('semantic color tokens',len(M),'checks',len(checks),'fails',len(fails))
for c in fails: print('  FAIL',c['mode'],c['label'],c['fg'],c['bg'],c['ratio'],'<',c['need'])
sys.exit(1 if fails else 0)
