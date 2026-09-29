import math
def hex2rgb(h): h=h.lstrip('#'); return tuple(int(h[i:i+2],16)/255 for i in (0,2,4))
def lin(c): return c/12.92 if c<=0.04045 else ((c+0.055)/1.055)**2.4
def lum(h): r,g,b=map(lin,hex2rgb(h)); return 0.2126*r+0.7152*g+0.0722*b
def cr(a,b): la,lb=lum(a),lum(b); hi,lo=max(la,lb),min(la,lb); return (hi+0.05)/(lo+0.05)
def oklch(h):
    r,g,b=map(lin,hex2rgb(h))
    l=0.4122214708*r+0.5363325363*g+0.0514459929*b
    m=0.2119034982*r+0.6806995451*g+0.1073969566*b
    s=0.0883024619*r+0.2817188376*g+0.6299787005*b
    l_,m_,s_=l**(1/3),m**(1/3),s**(1/3)
    L=0.2104542553*l_+0.7936177850*m_-0.0040720468*s_
    a=1.9779984951*l_-2.4285922050*m_+0.4505937099*s_
    b2=0.0259040371*l_+0.7827717662*m_-0.8086757660*s_
    C=math.hypot(a,b2); H=math.degrees(math.atan2(b2,a))%360
    return L,C,H
if __name__=='__main__':
    key='#316EEE'
    L,C,H=oklch(key)
    print(f"{key} OKLCH L={L:.3f} C={C:.3f} H={H:.1f}")
    for name,bg in [('white','#FFFFFF'),('light bg f5f4f2','#F5F4F2'),('dark bg 14120e','#14120E'),('black','#000000'),('dark surface 1e1b16','#1E1B16')]:
        print(f"  key as text on {name}: {cr(key,bg):.2f}")
    print(f"  white text on key: {cr('#FFFFFF',key):.2f}")
    print(f"  #14120E text on key: {cr('#14120E',key):.2f}")

# APCA (0.0.98G-4g) Lc contrast. txt, bg as hex.
def _apca_y(h):
    r,g,b=[(c)**2.4 for c in hex2rgb(h)]
    y=0.2126729*r+0.7151522*g+0.0721750*b
    return y+((0.022-y)**1.414) if y<0.022 else y
def apca(txt,bg):
    yt,yb=_apca_y(txt),_apca_y(bg)
    if abs(yb-yt)<0.0005: return 0.0
    if yb>yt:
        s=(yb**0.56-yt**0.57)*1.14
        lc=0 if s<0.1 else s-0.027
    else:
        s=(yb**0.65-yt**0.62)*1.14
        lc=0 if s>-0.1 else s+0.027
    return round(lc*100,1)
