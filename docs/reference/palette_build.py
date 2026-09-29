"""Final palette builder (v2). Run: python3 palette_build.py  -> palette.json"""
import json
from scale import to_hex, oklch2rgb, in_gamut
from color import cr, oklch, apca
KEY='#316EEE'; KL,KC,KH=oklch(KEY)
STEPS=[50,100,200,300,400,500,600,700,800,900,950]
dB=(0.97-KL)/6; BL=[0.97-i*dB for i in range(11)]
ABS_H=[0.035,0.07,0.11,0.15,0.19,0.22,0.24,0.22,0.19,0.16,0.13]
ABS_P=[0.035,0.07,0.11,0.15,0.24,0.24,0.24,0.22,0.19,0.16,0.13]
VIV=[0.12,0.30,0.50,0.68,0.84,0.96,1.00,0.96,0.86,0.72,0.56]  # vivid: fraction of gamut max (v1 definition)
G50,G950='#F8F6F4','#12100D'
HUES={'blue':(262.6,'hybrid'),'violet':(292.6,'hybrid'),'purple':(322.6,'vivid'),'pink':(352.6,'vivid'),'red':(22.6,'hybrid'),'orange':(52.6,'hybrid'),'amber':(82.6,'peak@400'),'lime':(112.6,'peak@400'),'green':(142.6,'vivid'),'teal':(172.6,'hybrid'),'cyan':(202.6,'hybrid'),'sky':(232.6,'hybrid')}
PEAK_L4={'amber':0.83,'lime':0.85}
def maxC(L,H):
    c=0.0
    while c<0.4 and in_gamut(oklch2rgb(L,c+0.002,H)): c+=0.002
    return c
def sdist(a,b):  # signed shortest rotation from a to b
    d=(b-a+180)%360-180
    return d
def drift(H,i,on):
    """warm lights (toward 100°), cool darks (toward 265°). max +-6 at 50, +-4 at 950, 0 at 600"""
    if not on: return H
    if i<6:
        t=(6-i)/6; target=100.0; amt=6*t
    elif i>6:
        t=(i-6)/4; target=265.0; amt=4*t
    else: return H
    d=sdist(H,target)
    if abs(abs(d)-180)<5: d=-abs(d)  # ambiguous: go toward red/orange for darks
    return (H+ (amt if d>0 else -amt))%360
def L_profile(n,H,m):
    if m=='vivid': return list(BL)
    if m=='hybrid':
        if maxC(KL,H)>=0.19: L6=KL
        else:
            L6=0.68
            for l in range(int(KL*100)+1,69):
                if maxC(l/100,H)>=0.19: L6=l/100; break
        return [0.97-i*(0.97-L6)/6 for i in range(7)]+BL[7:]
    L4=PEAK_L4[n]; L7=BL[7]
    return [0.97-i*(0.97-L4)/4 for i in range(5)]+[L4-(L4-L7)/3,L4-2*(L4-L7)/3]+BL[7:]
def rec(step,L,H,C):
    hx,c=to_hex(L,C,H)
    return dict(step=step,hex=hx,L=round(L,3),C=round(c,3),H=round(H,1),
        white_on=round(cr('#FFFFFF',hx),2),on_g50=round(cr(hx,G50),2),on_g950=round(cr(hx,G950),2),apca_g50=apca(hx,G50),apca_g950=apca(hx,G950))
def build(n,H,m,drift_on=True,soften=True):
    Ls=L_profile(n,H,m); ABS=ABS_P if m=='peak@400' else ABS_H
    if soften and Ls[6]>KL+0.01:
        # raise 700 as far as contrast on gray50 stays >= 4.6 and L700 <= midpoint(L600,L800)
        best=Ls[7]; mid=(Ls[6]+Ls[8])/2
        for l in range(int(Ls[7]*1000),int(mid*1000)+1,5):
            L=l/1000; Hd=drift(H,7,drift_on); hx,_=to_hex(L,min(ABS[7],0.92*maxC(L,Hd)),Hd)
            if cr(hx,G50)>=4.6: best=L
        Ls[7]=best
    out=[]
    for i,s in enumerate(STEPS):
        L=Ls[i]; Hd=drift(H,i,drift_on)
        if n=='blue' and s==600: out.append(dict(rec(s,KL,KH,KC),hex=KEY)); continue
        C=VIV[i]*maxC(L,Hd) if m=='vivid' else min(ABS[i],0.92*maxC(L,Hd))
        out.append(rec(s,L,Hd,C))
    return out
def gray():
    steps=[0,50,100,200,300,400,500,600,700,800,900,950,1000]
    L0,L10=0.975,0.175; d=(L0-L10)/10
    Cs=[0.004,0.006,0.008,0.010,0.011,0.012,0.012,0.011,0.010,0.009,0.008]
    out=[dict(step=0,hex='#FFFFFF',L=1.0,C=0.0,H=82.6)]
    for i,s in enumerate(steps[1:-1]):
        hx,c=to_hex(L0-i*d,Cs[i],82.6); out.append(dict(step=s,hex=hx,L=round(L0-i*d,3),C=round(c,3),H=82.6))
    out.append(dict(step=1000,hex='#000000',L=0.0,C=0.0,H=82.6)); return out
if __name__=='__main__':
    pal={'gray':dict(H=82.6,method='gray',scale=gray())}
    for n,(H,m) in HUES.items(): pal[n]=dict(H=H,method=m,scale=build(n,H,m))
    json.dump(pal,open('palette.json','w'),indent=1,ensure_ascii=False)
    v1=json.load(open('palette-v1.json'))
    print("hue     | 700 L v1->v2 | 700/g50 v1->v2 | 400/g950 | H50 H950 | 600 hex v1 -> v2")
    for n in HUES:
        a=v1[n]['scale']; b=pal[n]['scale']
        print(f"{n:7} | {a[7]['L']:.3f}->{b[7]['L']:.3f} | {a[7]['on_g50']:.2f}->{b[7]['on_g50']:.2f} | {b[4]['on_g950']:.2f} | {b[0]['H']:>6} {b[10]['H']:>6} | {a[6]['hex']} -> {b[6]['hex']}")
    print('gray',' '.join(f"{o['step']}:{o['hex'][1:]}" for o in pal['gray']['scale']))
