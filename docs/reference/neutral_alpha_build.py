"""Neutral alpha steps. Run: python3 neutral_alpha_build.py  -> neutral-alpha.json
Translucent neutrals that composite, on the theme surface, to ONE STEP LIGHTER than their number (2026-10-05 revision;
until then 100a matched 100 exactly, which read too dark):
  light: neutral.950 over neutral.50  -> 100a = midpoint(50, 100), 200a = 100, 300a = 200, 400a = 300
  dark:  neutral.50  over neutral.950 -> 900a = midpoint(950, 900), 800a = 900, 700a = 800, 600a = 700
Compositing is the browser default (linear interpolation of sRGB 8-bit values). alpha is searched in 0.1 % steps for the
smallest max channel error. Read by primitive_color_build.py, semantic_color_build.py and semantic_color_check.py."""
import json
from color import hex2rgb, oklch
from scale import to_hex

pal=json.load(open('palette.json'))
N={o['step']:o['hex'] for o in pal['neutral']['scale']}
PLAN={'light':dict(fg=950,bg=50,steps=[(100,(50,100)),(200,(100,)),(300,(200,)),(400,(300,))]),
      'dark': dict(fg=50,bg=950,steps=[(900,(950,900)),(800,(900,)),(700,(800,)),(600,(700,))])}

def rgb8(h): return [round(c*255) for c in hex2rgb(h)]
def hexs(rgb): return '#%02X%02X%02X'%tuple(rgb)
def midpoint(a,b):  # OKLCH midpoint of two neutral steps
    (L1,C1,H1),(L2,C2,H2)=oklch(a),oklch(b)
    return to_hex((L1+L2)/2,(C1+C2)/2,(H1+H2)/2)[0]
def composite(fg,a,bg): return [round(f*a+b*(1-a)) for f,b in zip(fg,bg)]
def fit(fg,bg,target):
    best=None
    for i in range(1,1000):
        a=i/1000; r=composite(fg,a,bg); err=max(abs(x-y) for x,y in zip(r,target))
        if best is None or err<best[2]: best=(a,r,err)
    return best

out={}
for mode,p in PLAN.items():
    fg,bg=rgb8(N[p['fg']]),rgb8(N[p['bg']])
    steps=[]
    for step,match in p['steps']:
        target=midpoint(N[match[0]],N[match[1]]) if len(match)==2 else N[match[0]]
        a,r,err=fit(fg,bg,rgb8(target))
        steps.append(dict(step=step,matches='neutral.'+'–'.join(map(str,match)),target=target,alpha=round(a,3),alpha_pct=round(a*100,1),result=hexs(r),err=err))
    out[mode]=dict(fg=f"neutral.{p['fg']} {N[p['fg']]}",bg=f"neutral.{p['bg']} {N[p['bg']]}",steps=steps)
json.dump(out,open('neutral-alpha.json','w'),indent=1,ensure_ascii=False)
for mode,v in out.items():
    print(mode,v['fg'],'over',v['bg'])
    for s in v['steps']: print(f"  {s['step']}a α {s['alpha_pct']:>5}% → {s['result']} (target {s['target']} = {s['matches']}, err {s['err']})")
