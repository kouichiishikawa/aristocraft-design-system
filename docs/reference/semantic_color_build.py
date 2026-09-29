"""Semantic color builder (A: Atlassian model). Run: python3 semantic_color_build.py"""
import json
from color import cr
pal=json.load(open('palette.json')); al=json.load(open('neutral-alpha.json'))
P={n:{o['step']:o['hex'] for o in v['scale']} for n,v in pal.items()}
HUES=['blue','violet','purple','pink','red','orange','amber','lime','green','teal','cyan','sky']
STATUS={'success':'green','warning':'amber','error':'red','info':'sky'}
PRIMARY='blue'
def fill_step(h):  # bold fill: lowest step where white text (black for amber/lime) is AA
    if h in ('amber','lime'): return 400
    return next(s for s in (600,700,800) if cr('#FFFFFF',P[h][s])>=4.5)
M={}
def add(path,l,d,desc=""): M[path]=dict(light=l,dark=d,desc=desc)
# surface
add('elevation.surface.default','neutral.50','neutral.950','ページ・セクションの地')
add('elevation.surface.raised','neutral.0','neutral.900','カード・パネル。light は影で浮かせる')
add('elevation.surface.overlay','neutral.0','neutral.800','モーダル・メニュー・ポップオーバー')
add('elevation.surface.sunken','neutral.100','neutral.1000','入力欄・くぼみ・コードブロックの地。文字は text.default / subtle まで')
# text / icon
add('color.text.default','neutral.950','neutral.50','本文・見出し'); add('color.text.subtle','neutral.700','neutral.200','副次テキスト'); add('color.text.subtlest','neutral.600','neutral.300','キャプション・メタ')
add('color.text.disabled','neutral.400','neutral.500','無効（コントラスト要件の対象外）'); add('color.text.inverse','neutral.50','neutral.950','反転面の上')
add('color.text.brand',f'{PRIMARY}.700',f'{PRIMARY}.400','ブランド色の文字・リンク'); add('color.text.brand.bold',f'{PRIMARY}.800',f'{PRIMARY}.300','brand.subtle の面に乗せる文字')
add('color.text.selected',f'{PRIMARY}.700',f'{PRIMARY}.400','選択状態の文字')
add('color.icon.default','neutral.900','neutral.100',''); add('color.icon.subtle','neutral.700','neutral.200',''); add('color.icon.subtlest','neutral.600','neutral.300','')
add('color.icon.disabled','neutral.400','neutral.500',''); add('color.icon.inverse','neutral.50','neutral.950',''); add('color.icon.brand',f'{PRIMARY}.600',f'{PRIMARY}.400','')
# border
add('color.border.subtlest','neutral.100a','neutral.900a','装飾的な区切り（3:1 の要件なし）'); add('color.border.subtle','neutral.200a','neutral.800a','カードの枠（装飾）'); add('color.border.default','neutral.300a','neutral.700a','既定の境界線（装飾）')
add('color.border.bold','neutral.500','neutral.400','入力欄など機能的な境界（3:1）'); add('color.border.focused',f'{PRIMARY}.600',f'{PRIMARY}.400','フォーカスリング'); add('color.border.inverse','neutral.50','neutral.950','反転面の上')
add('color.border.brand',f'{PRIMARY}.600',f'{PRIMARY}.500','')

# disabled / selected / input / blanket / icon.status / link
add('color.background.disabled','neutral.100a','neutral.900a','無効なボタン・入力欄の地')
add('color.border.disabled','neutral.200a','neutral.800a','無効な入力欄の枠')
add('color.background.selected',f'{PRIMARY}.50',f'{PRIMARY}.950','ナビの現在地、タブ、選択行')
add('color.background.selected.hovered',f'{PRIMARY}.100',f'{PRIMARY}.900','')
add('color.background.selected.pressed',f'{PRIMARY}.200',f'{PRIMARY}.800','')
add('color.border.selected',f'{PRIMARY}.600',f'{PRIMARY}.400','選択タブの下線など')
add('color.background.input','neutral.100','neutral.1000','入力欄の地（surface.sunken と同値）')
add('color.background.input.hovered','neutral.200','neutral.900','')
add('color.background.blanket','neutral.1000@40','neutral.1000@60','モーダル背後の暗幕。neutral.1000 の 40% / 60%')
for role,h in STATUS.items(): add(f'color.icon.status.{role}',f'{h}.700',f'{h}.400','状態アイコン')
add('color.link.default',f'{PRIMARY}.700',f'{PRIMARY}.400','本文中のリンク')
add('color.link.hovered',f'{PRIMARY}.800',f'{PRIMARY}.300','')
add('color.link.visited','purple.700','purple.400','訪問済み（ブログ本文）')
# static (theme-invariant)
for ns in ('text','icon','border'):
    add(f'color.{ns}.static.white','neutral.0','neutral.0','テーマに依存しない白。bold 塗り・写真・スクリムの上')
    add(f'color.{ns}.static.black','neutral.1000','neutral.1000','テーマに依存しない黒。amber / lime の bold 塗り・明るい写真の上')
# background neutral
add('color.background.neutral.subtlest','neutral.100a','neutral.900a','ホバー面・薄いタグ')
add('color.background.neutral.subtle','neutral.200a','neutral.800a','二次ボタン・チップ'); add('color.background.neutral.subtle.hovered','neutral.300a','neutral.700a',''); add('color.background.neutral.subtle.pressed','neutral.400a','neutral.600a','')
add('color.background.neutral.default','neutral.200','neutral.800','塗りの二次ボタン'); add('color.background.neutral.default.hovered','neutral.300','neutral.700',''); add('color.background.neutral.default.pressed','neutral.400','neutral.600','')
add('color.background.neutral.bold','neutral.700','neutral.300','強い塗り'); add('color.background.neutral.boldest','neutral.950','neutral.50','反転面。inverse の文字を乗せる')
def emphasis(base,h,states=True):
    add(f'{base}.subtlest',f'{h}.50',f'{h}.950','ほのかな色の面'); add(f'{base}.subtle',f'{h}.100',f'{h}.900','薄いタグ・通知の地（文字は .bold）'); add(f'{base}.default',f'{h}.200',f'{h}.800','色つきの面（文字は text.default）')
    b=fill_step(h); add(f'{base}.bold',f'{h}.{b}',f'{h}.{b}','塗り（白文字。amber / lime は黒文字）')
    if states: add(f'{base}.bold.hovered',f'{h}.{b+100}',f'{h}.{b+100}','1 段濃く'); add(f'{base}.bold.pressed',f'{h}.{b+200}',f'{h}.{b+200}','2 段濃く')
    add(f'{base}.boldest',f'{h}.800',f'{h}.300','最も強い塗り（light 白文字、dark 黒文字）')
# primary (brand)
emphasis('color.background.brand',PRIMARY)
# status
for role,h in STATUS.items():
    emphasis(f'color.background.status.{role}',h)
    add(f'color.text.status.{role}',f'{h}.700',f'{h}.400',''); add(f'color.text.status.{role}.bold',f'{h}.800',f'{h}.300',f'{role}.subtle の面に乗せる文字')
    add(f'color.border.status.{role}',f'{h}.600',f'{h}.500','')
# accent (all 12 hues, no states)
for h in HUES:
    emphasis(f'color.background.accent.{h}',h,states=False)
    add(f'color.text.accent.{h}',f'{h}.700',f'{h}.400','意味を持たない色の文字（neutral 面・subtlest 面）'); add(f'color.text.accent.{h}.bold',f'{h}.800',f'{h}.300',f'accent.{h}.subtle の面に乗せる文字')
SH={'rest':{'desc':'静止したカード、区切りの補助','light':[('#0000000A',0,1,2,0),('#0000000F',0,1,3,0)],'dark':[('#0000004D',0,1,2,0),('#00000033',0,1,3,0)]},
    'lifted':{'desc':'浮いたカード、ホバーで持ち上がる面、ドロップダウン','light':[('#0000000F',0,2,4,0),('#0000001F',0,4,12,-2)],'dark':[('#00000066',0,2,4,0),('#0000004D',0,4,12,-2)]},
    'floating':{'desc':'ポップオーバー、固定バー、ドラッグ中の要素','light':[('#00000014',0,4,8,0),('#00000029',0,12,24,-4)],'dark':[('#00000073',0,4,8,0),('#00000073',0,12,24,-4)]},
    'overlay':{'desc':'モーダル、ダイアログ、最上位のオーバーレイ','light':[('#00000014',0,8,16,0),('#0000003D',0,24,48,-8)],'dark':[('#00000080',0,8,16,0),('#00000099',0,24,48,-8)]}}
def px(n): return {"value":n,"unit":"px"}
def layers(ls): return [dict(color=c,offsetX=px(x),offsetY=px(y),blur=px(b),spread=px(s)) for c,x,y,b,s in ls]
def hx(r):
    if '@' in r: r=r.split('@')[0]
    fam,step=r.split('.')
    if step.endswith('a'):
        st=int(step[:-1]); mode='light' if st<=400 else 'dark'; return next(x for x in al[mode]['steps'] if x['step']==st)['result']
    return P[fam][int(step)]
def ref(r):
    if '@' in r:
        base,pct=r.split('@'); return f"#000000{round(int(pct)*255/100):02X}"
    fam,step=r.split('.'); return f"{{color.{fam}.{step}}}"
if __name__=='__main__':
    json.dump(M,open('semantic-color-map.json','w'),indent=1,ensure_ascii=False)
    json.dump({k:{'desc':v['desc'],'light':layers(v['light']),'dark':layers(v['dark'])} for k,v in SH.items()},open('semantic-shadow.json','w'),indent=1,ensure_ascii=False)
    for mode in ('light','dark'):
        out={}
        parents={p for p in M for q in M if q!=p and q.startswith(p+'.')}  # token that is also a group -> DTCG 2025.10 $root
        for path,v in M.items():
            node=out
            for p in path.split('.')[:-1]: node=node.setdefault(p,{})
            tok={"$type":"color","$value":ref(v[mode]),**({"$description":v['desc']} if v['desc'] else {})}
            if path in parents: node.setdefault(path.split('.')[-1],{})['$root']=tok
            else: node[path.split('.')[-1]]=tok
        out['elevation']['shadow']={"$description":"4 段。surface の階層とは独立に、部品側で強さを選ぶ",**{k:{"$type":"shadow","$value":layers(v[mode]),"$description":v['desc']} for k,v in SH.items()}}
        json.dump(out,open(f'../../tokens/semantic/color.{mode}.json','w'),indent=2,ensure_ascii=False)
    # checks
    checks=[]
    def chk(mode,label,fg,bg,need):
        f=M[fg][mode] if fg in M else fg; b=M[bg][mode] if bg in M else bg; c=cr(hx(f),hx(b)); checks.append(dict(mode=mode,label=label,fg=f,bg=b,ratio=round(c,2),need=need,ok=c>=need))
    for mode in ('light','dark'):
        W='neutral.0' if mode=='light' else 'neutral.1000'
        for t in ['color.text.default','color.text.subtle','color.text.subtlest','color.text.brand']:
            for s in ['elevation.surface.default','elevation.surface.raised','elevation.surface.overlay']: chk(mode,f'{t.split(".")[-1]} on {s.split(".")[-1]}',t,s,4.5)
        for t in ['color.text.default','color.text.subtle']: chk(mode,f'{t.split(".")[-1]} on sunken',t,'elevation.surface.sunken',4.5)
        chk(mode,'border.bold on default','color.border.bold','elevation.surface.default',3.0); chk(mode,'border.focused on default','color.border.focused','elevation.surface.default',3.0)
        chk(mode,'text.inverse on neutral.boldest','color.text.inverse','color.background.neutral.boldest',4.5)
        chk(mode,'text.default on neutral.subtle','color.text.default','color.background.neutral.subtle',4.5); chk(mode,'text.default on neutral.default','color.text.default','color.background.neutral.default',4.5)
        chk(mode,'inverse-ish on neutral.bold',W,'color.background.neutral.bold',4.5)
        groups=[('brand','color.background.brand','color.text.brand',PRIMARY)]+[(r,f'color.background.status.{r}',f'color.text.status.{r}',h) for r,h in STATUS.items()]+[(f'accent.{h}',f'color.background.accent.{h}',f'color.text.accent.{h}',h) for h in HUES]
        for name,base,tr,h in groups:
            fg='color.text.static.black' if h in ('amber','lime') else 'color.text.static.white'
            chk(mode,f'{name}.bold + static.{"black" if h in ("amber","lime") else "white"}',fg,f'{base}.bold',4.5)
            if f'{base}.bold.hovered' in M: chk(mode,f'{name}.bold.hovered + text',fg,f'{base}.bold.hovered',4.5)
            chk(mode,f'{name}.boldest + {"white" if mode=="light" else "black"}',W,f'{base}.boldest',4.5)
            chk(mode,f'text.{name} on surface.default',tr,'elevation.surface.default',4.5)
            chk(mode,f'text.{name} on {name}.subtlest',tr,f'{base}.subtlest',4.5)
            chk(mode,f'text.{name}.bold on {name}.subtle',tr+'.bold',f'{base}.subtle',4.5)
            chk(mode,f'text.default on {name}.default','color.text.default',f'{base}.default',4.5)
        chk(mode,'text.selected on background.selected','color.text.selected','color.background.selected',4.5)
        chk(mode,'text.default on background.selected','color.text.default','color.background.selected',4.5)
        chk(mode,'text.default on background.input','color.text.default','color.background.input',4.5)
        chk(mode,'link.default on surface.default','color.link.default','elevation.surface.default',4.5)
        chk(mode,'link.hovered on surface.default','color.link.hovered','elevation.surface.default',4.5)
        chk(mode,'link.visited on surface.default','color.link.visited','elevation.surface.default',4.5)
        chk(mode,'border.selected on surface.default','color.border.selected','elevation.surface.default',3.0)
        for role in STATUS: chk(mode,f'icon.status.{role} on surface.default',f'color.icon.status.{role}','elevation.surface.default',3.0)
    json.dump(checks,open('semantic-color-checks.json','w'),indent=1,ensure_ascii=False)
    fails=[c for c in checks if not c['ok']]
    print('color tokens',len(M),'shadow',len(SH),'checks',len(checks),'fails',len(fails))
    for c in fails: print('  FAIL',c['mode'],c['label'],c['fg'],c['bg'],c['ratio'])
