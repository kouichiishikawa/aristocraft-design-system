"""Contrast checks for the semantic color layer (WCAG 2.2 AA). Shared by the generator and the CI checker.

run_checks(M, hx) -> list of {mode,label,fg,bg,ratio,need,ok}
  M:  {token path: {'light': ref-or-hex, 'dark': ref-or-hex}}   ref = 'blue.700' | 'neutral.100a'
  hx: resolves a ref or '#RRGGBB(AA)' literal to a hex string
"""
from color import cr

HUES=['blue','violet','purple','pink','red','orange','amber','lime','green','teal','cyan','sky']
STATUS={'success':'green','warning':'amber','error':'red','info':'sky'}
PRIMARY='blue'

def run_checks(M,hx):
    checks=[]
    def chk(mode,label,fg,bg,need):
        f=M[fg][mode] if fg in M else fg; b=M[bg][mode] if bg in M else bg; c=cr(hx(f),hx(b))
        checks.append(dict(mode=mode,label=label,fg=f,bg=b,ratio=round(c,2),need=need,ok=c>=need))
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
    return checks
