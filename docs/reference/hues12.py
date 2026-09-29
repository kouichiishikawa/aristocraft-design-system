import json
from color import oklch, cr, apca
from scale import to_hex, oklch2rgb, in_gamut
KEY='#316EEE'; KL,KC,KH=oklch(KEY)
steps=[50,100,200,300,400,500,600,700,800,900,950]
names=['blue','violet','purple','pink','red','orange','amber','lime','green','teal','cyan','sky']
jp={'blue':'青','violet':'菫','purple':'紫','pink':'桃','red':'赤','orange':'橙','amber':'琥珀','lime':'黄緑','green':'緑','teal':'青緑','cyan':'水色','sky':'空色'}
def maxC(L,H):
    c=0.0
    while c<0.4 and in_gamut(oklch2rgb(L,c+0.002,H)): c+=0.002
    return c
# chroma targets by step (relative to 1.0 = full), vivid curve
VIV=[0.12,0.30,0.50,0.68,0.84,0.96,1.00,0.96,0.86,0.72,0.56]
def build(H,mode):
    out=[]
    if mode=='peak':
        # find L with highest max chroma between 0.45..0.85, blue keeps KL
        if abs(H-KH)<0.01: L6=KL
        else:
            best=max((maxC(l/100,H),l/100) for l in range(45,86)); L6=best[1]
        dU=(0.97-L6)/6; dD=(KL-0.309)/4   # below 600 use blue's descent
        Ls=[0.97-i*dU for i in range(7)]+[L6-(i)*dD for i in range(1,5)]
    else:
        d=(0.97-KL)/6; Ls=[0.97-i*d for i in range(11)]
    for i,s in enumerate(steps):
        L=Ls[i]
        if mode=='current':
            C=KC*(1-0.85*((i-6)/6)**2) if i<6 else KC*(1-0.45*((i-6)/4)**2)
        else:
            C=VIV[i]*max(KC,maxC(L,H)) if mode=='peak' else VIV[i]*KC*1.0
            if mode=='vivid': C=VIV[i]*max(KC,maxC(L,H))
        if abs(H-KH)<0.01 and s==600: hx,c=KEY,KC
        else: hx,c=to_hex(L,C,H)
        out.append(dict(step=s,hex=hx,L=round(L,3),C=round(c,3),white_on=round(cr('#FFFFFF',hx),2),on_g50=round(cr(hx,'#F8F6F4'),2),on_g950=round(cr(hx,'#12100D'),2)))
    return out
if __name__=="__main__":
  res={}
  for k,n in enumerate(names):
    H=(KH+30*k)%360
    res[n]=dict(H=round(H,1),offset=30*k,current=build(H,'current'),vivid=build(H,'vivid'),peak=build(H,'peak'))
json.dump(res,open('hue-wheel-12-variants.json','w'),indent=1)
for n,v in res.items():
    for m in ('current','vivid','peak'):
        sc=v[m]; print(f"{n:7} {m:7} L600 {sc[6]['L']:.3f} C600 {sc[6]['C']:.3f} C300 {sc[3]['C']:.3f} | w/600 {sc[6]['white_on']:.2f} 700/g50 {sc[7]['on_g50']:.2f} 400/g950 {sc[4]['on_g950']:.2f} | "+' '.join(o['hex'][1:] for o in sc))
