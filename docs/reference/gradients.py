import json, math
from color import oklch, cr
from scale import to_hex
pal=json.load(open('palette.json'))
def hx(n,s): return next(o['hex'] for o in pal[n]['scale'] if o['step']==s)
def lerp_oklch(a,b,t):
    La,Ca,Ha=oklch(a); Lb,Cb,Hb=oklch(b)
    if Ca<0.01: Ha=Hb
    if Cb<0.01: Hb=Ha
    d=(Hb-Ha+180)%360-180
    L=La+(Lb-La)*t; C=Ca+(Cb-Ca)*t; H=(Ha+d*t)%360
    return to_hex(L,C,H)[0]
def stops(a,b,n=5): return [lerp_oklch(a,b,i/(n-1)) for i in range(n)]
G=[]
def add(cat,name,a,b,angle,note):
    st=stops(a,b); G.append(dict(cat=cat,name=name,a=a,b=b,angle=angle,stops=st,note=note,
        css=f"linear-gradient(in oklch {angle}, {a}, {b})", css_fallback=f"linear-gradient({angle}, {', '.join(st)})"))
# A. surface (subtle)
add('surface','surface.light.key',hx('gray',50),hx('blue',50),'180deg','ライトのセクション地。gray.50 → blue.50')
add('surface','surface.light.warm',hx('gray',50),hx('amber',50),'180deg','ライトの暖かい地。gray.50 → amber.50（補色側）')
add('surface','surface.dark.key',hx('gray',950),hx('blue',950),'180deg','ダークのセクション地。gray.950 → blue.950')
add('surface','surface.dark.warm',hx('gray',950),hx('amber',950),'180deg','ダークの暖かい地。gray.950 → amber.950')
# B. accent (adjacent hues, same step)
for nm,(p,q,s) in {'accent.key':('sky','blue',600),'accent.key.deep':('blue','violet',600),'accent.violet':('violet','purple',500),'accent.pink':('purple','pink',500),'accent.red':('pink','red',500),'accent.orange':('red','orange',500),'accent.amber':('orange','amber',400),'accent.lime':('amber','lime',400),'accent.green':('lime','green',500),'accent.teal':('green','teal',500),'accent.cyan':('teal','cyan',500),'accent.sky':('cyan','sky',500)}.items():
    add('accent',nm,hx(p,s),hx(q,s),'135deg',f'{p}.{s} → {q}.{s}（30°）')
# C. scrim
G.append(dict(cat='scrim',name='scrim.dark',a='rgba(18,16,13,0)',b='rgba(18,16,13,0.72)',angle='180deg',stops=['rgba(18,16,13,0)','rgba(18,16,13,0.18)','rgba(18,16,13,0.36)','rgba(18,16,13,0.54)','rgba(18,16,13,0.72)'],note='画像の上の暗転。下端で gray.950 の 72%。白文字を乗せる',css='linear-gradient(180deg, rgba(18,16,13,0) 0%, rgba(18,16,13,0.72) 100%)',css_fallback='linear-gradient(180deg, rgba(18,16,13,0), rgba(18,16,13,0.72))'))
G.append(dict(cat='scrim',name='scrim.light',a='rgba(248,246,244,0)',b='rgba(248,246,244,0.80)',angle='180deg',stops=['rgba(248,246,244,0)','rgba(248,246,244,0.2)','rgba(248,246,244,0.4)','rgba(248,246,244,0.6)','rgba(248,246,244,0.8)'],note='画像の上の明転。下端で gray.50 の 80%。黒文字を乗せる',css='linear-gradient(180deg, rgba(248,246,244,0) 0%, rgba(248,246,244,0.80) 100%)',css_fallback='linear-gradient(180deg, rgba(248,246,244,0), rgba(248,246,244,0.8))'))
# D. ui (same hue)
add('ui','ui.primary',hx('blue',500),hx('blue',700),'180deg','塗りボタン。blue.500 → blue.700。白文字は下端で 6.08、上端で 3.45')
add('ui','ui.primary.hover',hx('blue',600),hx('blue',800),'180deg','ホバー時。1 段ずつ濃く')
add('ui','ui.neutral.light',hx('gray',0),hx('gray',100),'180deg','ライトの二次ボタン・カード')
add('ui','ui.neutral.dark',hx('gray',800),hx('gray',900),'180deg','ダークの二次ボタン・カード')
json.dump(G,open('gradients.json','w'),indent=1,ensure_ascii=False)
for g in G: print(f"{g['cat']:7} {g['name']:18} {' '.join(str(x) for x in g['stops'])}")
# midpoint chroma check for accents
print("\naccent midpoint C vs ends (muddiness check):")
for g in G:
    if g['cat']=='accent':
        La,Ca,_=oklch(g['a']); Lb,Cb,_=oklch(g['b']); Lm,Cm,_=oklch(g['stops'][2])
        print(f"  {g['name']:18} C {Ca:.3f} → {Cm:.3f} → {Cb:.3f}")
