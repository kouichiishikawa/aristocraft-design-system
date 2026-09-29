import json
from color import oklch, cr, apca
from scale import to_hex
KEY='#316EEE'; KL,KC,KH=oklch(KEY)
steps=[50,100,200,300,400,500,600,700,800,900,950]
i_key=6; L0=0.97; d=(L0-KL)/i_key
def scale(H):
    out=[]
    for i,s in enumerate(steps):
        L=L0-i*d
        C=KC*(1-0.85*((i-i_key)/i_key)**2) if i<i_key else KC*(1-0.45*((i-i_key)/(len(steps)-1-i_key))**2)
        if H==KH and s==600: hx,c=KEY,KC
        else: hx,c=to_hex(L,C,H)
        out.append(dict(step=s,hex=hx,L=round(L,3),C_target=round(C,3),C=round(c,3),H=round(H,1),
                        on_white=round(cr(hx,'#FFFFFF'),2),white_on=round(cr('#FFFFFF',hx),2),
                        on_g50=round(cr(hx,'#F8F6F4'),2),on_g950=round(cr(hx,'#12100D'),2)))
    return out
names={0:'blue',1:'violet',2:'rose',3:'orange',4:'olive',5:'green',6:'teal',7:'azure'}
res={}
for k in range(8):
    H=(KH+45*k)%360
    res[names[k]]=dict(H=round(H,1),scale=scale(H))
json.dump(res,open('hue-wheel.json','w'),indent=1)
for n,v in res.items():
    sc=v['scale']
    print(f"{n:7} H{v['H']:>6}: "+' '.join(f"{o['step']}:{o['hex']}" for o in sc))
    print(f"        C@600 {sc[6]['C']:.3f} (target {sc[6]['C_target']:.3f}) | 600 on white {sc[6]['on_white']:.2f}, white on 600 {sc[6]['white_on']:.2f} | 700 on g50 {sc[7]['on_g50']:.2f} | 400 on g950 {sc[4]['on_g950']:.2f}")
