import math, json, sys
from color import oklch, cr, lum
def oklch2rgb(L,C,H):
    h=math.radians(H); a=C*math.cos(h); b=C*math.sin(h)
    l_=L+0.3963377774*a+0.2158037573*b
    m_=L-0.1055613458*a-0.0638541728*b
    s_=L-0.0894841775*a-1.2914855480*b
    l,m,s=l_**3,m_**3,s_**3
    r= 4.0767416621*l-3.3077115913*m+0.2309699292*s
    g=-1.2684380046*l+2.6097574011*m-0.3413193965*s
    b2=-0.0041960863*l-0.7034186147*m+1.7076147010*s
    return r,g,b2
def gam(c): return 12.92*c if c<=0.0031308 else 1.055*c**(1/2.4)-0.055
def in_gamut(rgb): return all(-0.0005<=c<=1.0005 for c in rgb)
def to_hex(L,C,H):
    c=C
    while c>0:
        rgb=oklch2rgb(L,c,H)
        if in_gamut(rgb): break
        c-=0.002
    rgb=[min(1,max(0,gam(v))) for v in oklch2rgb(L,c,H)]
    return '#%02X%02X%02X'%tuple(round(v*255) for v in rgb), c
KEY='#316EEE'; KL,KC,KH=oklch(KEY)
steps=[50,100,200,300,400,500,600,700,800,900,950]
i_key=steps.index(600)
L0=0.97; d=(L0-KL)/i_key
out=[]
for i,s in enumerate(steps):
    L=L0-i*d
    # chroma: peak at key, taper toward both ends (quadratic), floor at ends
    t=(i-i_key)/max(i_key,len(steps)-1-i_key)
    C=KC*(1-0.85*t*t) if i<i_key else KC*(1-0.45*((i-i_key)/(len(steps)-1-i_key))**2)
    if s==600: hx,c=KEY,KC
    else: hx,c=to_hex(L,C,KH)
    out.append(dict(step=s,hex=hx,L=round(L,3),C=round(c,3),H=round(KH,1),
        on_white=round(cr(hx,'#FFFFFF'),2), on_black=round(cr(hx,'#000000'),2),
        on_off=round(cr(hx,'#F5F4F2'),2), on_dark=round(cr(hx,'#14120E'),2),
        white_on=round(cr('#FFFFFF',hx),2)))
json.dump(out,open('blue-scale.json','w'),indent=1)
print(f"{'step':>4} {'hex':8} {'L':>5} {'C':>5} | vs#fff vs#F5F4F2 | vs#000 vs#14120E | #fff on")
for o in out:
    print(f"{o['step']:>4} {o['hex']} {o['L']:.3f} {o['C']:.3f} | {o['on_white']:>5.2f} {o['on_off']:>7.2f} | {o['on_black']:>5.2f} {o['on_dark']:>7.2f} | {o['white_on']:>5.2f}")
