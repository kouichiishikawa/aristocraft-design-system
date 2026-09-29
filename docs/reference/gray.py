import json
from color import oklch, cr, apca
from scale import to_hex
H=42.0
steps=[50,100,200,300,400,500,600,700,800,900,950]
L0,L10=0.975,0.175
d=(L0-L10)/10
# chroma: tiny, slightly higher mid, lower at ends
Cs=[0.004,0.006,0.008,0.010,0.011,0.012,0.012,0.011,0.010,0.009,0.008]
out=[]
for i,s in enumerate(steps):
    L=L0-i*d
    hx,c=to_hex(L,Cs[i],H)
    out.append(dict(step=s,hex=hx,L=round(L,3),C=round(c,3),H=H))
json.dump(out,open('gray-scale.json','w'),indent=1)
bg_l=out[0]['hex']; bg_d=out[-1]['hex']
print("gray H42:",' '.join(f"{o['step']}:{o['hex']}" for o in out))
print(f"\nlight bg = 50 {bg_l}, dark bg = 950 {bg_d}")
print("text on light bg (50):  step  hex  WCAG  APCA")
for o in out[4:]:
    print(f"  {o['step']:>4} {o['hex']} {cr(o['hex'],bg_l):>5.2f} {apca(o['hex'],bg_l):>7}")
print("text on dark bg (950):")
for o in out[:7]:
    print(f"  {o['step']:>4} {o['hex']} {cr(o['hex'],bg_d):>5.2f} {apca(o['hex'],bg_d):>7}")
print("\nblue on gray bgs (WCAG / APCA):")
for b in json.load(open('blue-scale.json')):
    if b['step'] in (400,500,600,700,800):
        print(f"  blue{b['step']} on gray50 {cr(b['hex'],bg_l):>5.2f} / {apca(b['hex'],bg_l):>6}   on gray950 {cr(b['hex'],bg_d):>5.2f} / {apca(b['hex'],bg_d):>6}")
print("\nwhite/black vs ends:", f"#FFF vs 50 {cr('#FFFFFF',bg_l):.2f}", f"#000 vs 950 {cr('#000000',bg_d):.2f}")
