#!/usr/bin/env python3
"""
APEXRANK — EPIC CINEMATIC v2
A more dramatic, polished procedural intro -> MP4.

Upgrades over v1:
  - smoother eased camera ascent with slight handheld sway
  - real bloom (multi-pass gaussian) on beacon, amber windows, title
  - searchlight cones + god-rays from helicopter
  - lens-flare streak across the green beacon
  - chromatic-aberration-ish edge fringe + stronger anamorphic letterbox
  - punchier title slam with kinetic underline + tracking animation
  - cleaner timing / pacing (28s epic)
"""

import math, os, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops

random.seed(11)

W, H = 1280, 720
FPS = 30
DUR = 28.0
N = int(FPS * DUR)
OUT_DIR = "cine2_frames"
os.makedirs(OUT_DIR, exist_ok=True)

VOID   = (3, 3, 10)
TOWER1 = (9, 9, 18)
TOWER2 = (30, 30, 60)
GREEN  = (0, 255, 179)
GREEN2 = (0, 200, 138)
RED    = (255, 60, 90)
AMBER  = (239, 159, 39)
WHITE  = (232, 232, 240)
GHOST  = (90, 90, 130)
STEEL  = (150, 175, 205)

def font(size, mono=False):
    paths = ([
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
    ] if mono else [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSansNarrow-Bold.ttf",
    ])
    for p in paths:
        if os.path.exists(p):
            try: return ImageFont.truetype(p, size)
            except: pass
    return ImageFont.load_default()

F_TITLE = font(108)
F_SUB   = font(30, mono=True)
F_MONO  = font(22, mono=True)
F_SMALL = font(16, mono=True)
F_TINY  = font(13, mono=True)

def lerp(a,b,t): return a+(b-a)*t
def clamp(x,lo=0.0,hi=1.0): return max(lo,min(hi,x))
def ease_out(t): return 1-(1-t)**3
def ease_in_out(t): return t*t*(3-2*t)
def mix(c1,c2,t): return tuple(int(lerp(c1[i],c2[i],t)) for i in range(3))

# consistent window grid
WIN_COLS, WIN_ROWS = 10, 78
windows = []
for r in range(WIN_ROWS):
    for c in range(WIN_COLS):
        k = random.random()
        kind = 1 if k > 0.93 else (2 if k > 0.83 else 0)
        windows.append((c, r, kind, random.random()*6.28, random.random()))

rain = [(random.uniform(0,W), random.uniform(0,H), random.uniform(10,26), random.uniform(0.3,1)) for _ in range(150)]
embers = [(random.uniform(0,W), random.uniform(0,H), random.uniform(0.4,1.2), random.uniform(0,6.28)) for _ in range(40)]


def draw_text_center(dr, cx, y, text, fnt, fill, spacing=0):
    widths=[]
    for ch in text:
        bb=dr.textbbox((0,0),ch,font=fnt); widths.append(bb[2]-bb[0])
    total=sum(widths)+spacing*(len(text)-1)
    x=cx-total/2
    for i,ch in enumerate(text):
        dr.text((x,y),ch,font=fnt,fill=fill); x+=widths[i]+spacing
    return total


def bloom(img, threshold=180, blur=22, strength=0.9):
    """Extract bright areas and add a soft glow back (real bloom)."""
    gray = img.convert("L")
    mask = gray.point(lambda p: max(0, p-threshold)*2)
    bright = Image.composite(img, Image.new("RGB", img.size, (0,0,0)), mask)
    b = bright.filter(ImageFilter.GaussianBlur(blur))
    b2 = bright.filter(ImageFilter.GaussianBlur(blur*2.2))
    glow = ImageChops.add(b, b2)
    glow = glow.point(lambda p: int(p*strength))
    return ImageChops.screen(img, glow)


def render(i):
    t = i/FPS
    img = Image.new("RGB", (W,H), VOID)
    dr = ImageDraw.Draw(img)

    # background sky gradient (cold)
    for y in range(0,H,3):
        f=y/H
        dr.rectangle([0,y,W,y+3], fill=mix((1,1,7),(10,12,28),1-f))

    # camera ascent 0->1 across t=3..21, eased; reaches roof, holds
    climb = ease_in_out(clamp((t-3.0)/18.0))
    sway = math.sin(t*0.6)*4 + math.sin(t*1.7)*2   # handheld
    cx = W//2 + sway*0.5

    # distant skyline appears as we rise
    sky_a = clamp((climb-0.1)*1.8)
    if sky_a>0:
        random.seed(42); sd=ImageDraw.Draw(img)
        sil=Image.new("L",(W,H),0); sm=ImageDraw.Draw(sil)
        for _ in range(20):
            bw=random.randint(40,120); bx=random.randint(-60,W)
            bh=random.randint(140,420); by=H-bh+int(80*(1-climb))
            sm.rectangle([bx,by,bx+bw,H], fill=int(70*sky_a))
        col=Image.new("RGB",(W,H),(9,11,24))
        img.paste(Image.composite(col,img,sil),(0,0)); random.seed(11)

    # ----- TOWER -----
    tower_in = ease_out(clamp((t-2.2)/2.4))
    row_h=26; total_h=WIN_ROWS*row_h
    if tower_in>0:
        tw=int(min(W*0.30,360)*(0.62+0.10*(1-climb)))
        tl=cx-tw/2; tr=tl+tw
        baseY=lerp(H+40, H+total_h-H*0.28, climb)

        body=Image.new("RGB",(tw,H),TOWER1); bd=ImageDraw.Draw(body)
        for x in range(tw):
            shade=math.sin(x/tw*math.pi)
            bd.line([(x,0),(x,H)], fill=mix(TOWER1,TOWER2,0.20+0.55*shade))
        region=img.crop((int(tl),0,int(tl)+tw,H))
        img.paste(Image.blend(region,body,tower_in),(int(tl),0))
        dr=ImageDraw.Draw(img)
        ec=mix(VOID,(55,55,90),tower_in)
        dr.line([(tl,0),(tl,H)],fill=ec,width=2); dr.line([(tr,0),(tr,H)],fill=ec,width=2)

        # windows
        cw=tw/WIN_COLS
        for (c,r,kind,ph,jit) in windows:
            wy=baseY-r*row_h
            if wy<-row_h or wy>H+row_h: continue
            wx=tl+c*cw+cw*0.16; ww=cw*0.66; wh=row_h*0.55
            if kind==1:
                fl=0.5+0.5*math.sin(t*1.3+ph)
                dr.rectangle([wx,wy,wx+ww,wy+wh], fill=mix((20,14,6),AMBER,fl))
            elif kind==2:
                dr.rectangle([wx,wy,wx+ww,wy+wh], fill=mix((10,14,28),(26,40,72),0.4+0.3*jit))
            else:
                dr.rectangle([wx,wy,wx+ww,wy+wh], fill=(6,6,14))

        # ----- ROOFTOP -----
        roofY=baseY-WIN_ROWS*row_h
        roof=clamp((climb-0.58)/0.42)
        if roof>0 and -260<roofY<H+260:
            pulse=0.5+0.5*math.sin(t*3.0)
            dr.rectangle([tl-10,roofY,tr+10,roofY+16], fill=mix(VOID,(46,48,68),roof))
            # helipad ring + H
            rcx,rcy=cx,roofY-30
            ring=mix((0,70,52),GREEN,0.4+0.6*pulse)
            for k in range(3):
                dr.ellipse([rcx-50+k,rcy-20+k,rcx+50-k,rcy+20-k], outline=ring)
            draw_text_center(dr,rcx,rcy-15,"H",F_SUB,mix((0,90,68),GREEN,roof))
            # mast + beacon
            mt=roofY-100
            dr.line([(cx,roofY),(cx,mt)], fill=(46,50,72), width=3)
            dr.ellipse([cx-7,mt-7,cx+7,mt+7], fill=mix(GREEN2,(210,255,235),pulse))
            # lens flare horizontal streak across beacon
            fa=int(120*roof*pulse)
            dr.line([(cx-260,mt),(cx+260,mt)], fill=mix(VOID,GREEN,0.4*pulse*roof), width=1)
            dr.ellipse([cx-22,mt-3,cx+22,mt+3], fill=mix(VOID,GREEN,0.5*roof))

            # ----- HELICOPTER approach -----
            hi=ease_out(clamp((t-18.5)/3.5))
            if hi>0:
                hx=cx+int(lerp(230,80,hi)); hy=mt-78+int(7*math.sin(t*2))
                hc=mix(VOID,STEEL,hi)
                # searchlight cone
                cone=Image.new("L",(W,H),0); cd=ImageDraw.Draw(cone)
                cd.polygon([(hx-5,hy+8),(hx+5,hy+8),(hx+55,hy+230),(hx-55,hy+230)], fill=int(55*hi))
                gl=Image.new("RGB",(W,H),GREEN)
                img.paste(Image.composite(gl,img,cone.filter(ImageFilter.GaussianBlur(20))),(0,0))
                dr=ImageDraw.Draw(img)
                # body
                dr.ellipse([hx-28,hy-10,hx+24,hy+10], outline=hc, width=2)
                dr.polygon([(hx+22,hy-3),(hx+70,hy-1),(hx+68,hy+5),(hx+22,hy+4)], outline=hc)
                dr.line([(hx-20,hy+15),(hx+16,hy+15)], fill=hc, width=2)
                dr.line([(hx-12,hy+10),(hx-16,hy+15)], fill=hc, width=2)
                dr.line([(hx+10,hy+10),(hx+14,hy+15)], fill=hc, width=2)
                # rotor blur
                rw=int(58+20*math.sin(t*34))
                dr.line([(hx-rw,hy-17),(hx+rw,hy-17)], fill=GREEN, width=2)
                dr.line([(hx,hy-17),(hx,hy-10)], fill=hc, width=2)
                # nav light
                dr.ellipse([hx+66,hy-3,hx+72,hy+3], fill=mix(VOID,RED,abs(math.sin(t*5))))

    # ----- rain & embers -----
    if climb>0.03:
        ra=clamp(climb*1.2)
        for (rx,ry,rl,rj) in rain:
            y=(ry+t*340)%H
            dr.line([(rx,y),(rx-rl*0.4,y+rl)], fill=mix(VOID,(80,100,170),ra*rj*0.7), width=1)
        for (ex,ey,es,eph) in embers:
            y=(ey-t*30)%H
            a=0.3+0.3*math.sin(t*2+eph)
            dr.ellipse([ex,y,ex+es,y+es], fill=mix(VOID,AMBER,a*ra))

    # ----- emergency red flicker -----
    if (1.85<t<2.0) or (2.2<t<2.28) or (2.4<t<2.48):
        img=Image.blend(img, Image.new("RGB",(W,H),RED), 0.30); dr=ImageDraw.Draw(img)

    # ----- HUD -----
    hud=ease_out(clamp(t/1.4))
    if hud>0:
        hc=mix(VOID,GHOST,hud); m=34; L=46
        for (ax,ay,dx,dy) in [(m,m,1,1),(W-m,m,-1,1),(m,H-m,1,-1),(W-m,H-m,-1,-1)]:
            dr.line([(ax,ay),(ax+dx*L,ay)],fill=hc,width=2)
            dr.line([(ax,ay),(ax,ay+dy*L)],fill=hc,width=2)
        blink=1.0 if int(t*1.5)%2==0 else 0.3
        dr.ellipse([m+4,m+14,m+12,m+22], fill=mix(VOID,GREEN,blink*hud))
        dr.text((m+22,m+12),"APEX SECURITY NETWORK // SECTOR 7",font=F_TINY,fill=hc)
        dr.text((W-300,m+12),"FEED // LIVE   N40 W74",font=F_TINY,fill=hc)

    # ----- status + timer -----
    s_in=ease_out(clamp((t-8.5)/1.0))
    if s_in>0 and t<23.0:
        fade=s_in
        if t>22.0: fade*=clamp((23.0-t)/1.0)
        l1="STATUS: LOCKDOWN ACTIVE"
        ch1=int(clamp((t-8.6)/1.4)*len(l1))
        dr.text((60,H-150), l1[:ch1], font=F_MONO, fill=mix(VOID,GREEN,fade))
        if ch1>=len(l1):
            rem=max(0,3600-int((t-10)*72))
            base="EXTRACTION WINDOW: "
            tx=base+f"{rem//60:02d}:{rem%60:02d}"
            ch2=int(clamp((t-10.0)/1.2)*len(tx)); s2=tx[:ch2]
            dr.text((60,H-116), s2[:len(base)] if ch2<=len(base) else base,
                    font=F_MONO, fill=mix(VOID,GHOST,fade))
            if ch2>len(base):
                bb=dr.textbbox((60,H-116),base,font=F_MONO)
                dr.text((bb[2],H-116), s2[len(base):], font=F_MONO, fill=mix(VOID,RED,fade))

    # apply BLOOM before title (so neon glows)
    img = bloom(img, threshold=150, blur=18, strength=0.85)
    dr = ImageDraw.Draw(img)

    # ----- TITLE SLAM -----
    tt=clamp((t-23.2)/4.8)
    if tt>0:
        ti=ease_out(clamp((t-23.2)/0.5))
        img=Image.blend(img, Image.new("RGB",(W,H),VOID), 0.5*ti); dr=ImageDraw.Draw(img)
        # animated tracking: letters spread out as it pops
        track=lerp(28,12,ease_out(ti))
        draw_text_center(dr, W//2, H*0.34, "APEX TOWER", F_TITLE, mix(VOID,WHITE,ti), spacing=track)
        # kinetic underline grows
        uw=int(lerp(0,420,ease_out(clamp((t-23.6)/0.6))))
        dr.rectangle([W//2-uw, H*0.50, W//2+uw, H*0.50+3], fill=mix(VOID,GREEN,ti))
        si=clamp((t-24.0)/0.9)
        if si>0:
            draw_text_center(dr, W//2, H*0.54, "T H E   A S C E N T", F_SUB,
                             mix(VOID,GREEN,ease_out(si)), spacing=10)
        ci=clamp((t-25.0)/1.0)
        if ci>0:
            blink2=0.6+0.4*math.sin(t*4)
            draw_text_center(dr, W//2, H*0.68, "[ ENTER THE TOWER ]", F_SMALL,
                             mix(VOID,GREEN,ease_out(ci)*blink2), spacing=3)
        img=bloom(img, threshold=170, blur=20, strength=0.7); dr=ImageDraw.Draw(img)

    # ----- scanline -----
    sy=int((t*95)%H)
    dr.rectangle([0,sy,W,sy+2], fill=(0,0,0))
    scan=Image.new("RGB",(W,H),(0,0,0)); ImageDraw.Draw(scan).rectangle([0,sy,W,sy+2],fill=(0,38,26))
    img=ImageChops.add(img,scan)

    # ----- film grain -----
    noise=Image.effect_noise((W//2,H//2),28).convert("L").resize((W,H))
    img=ImageChops.add(img, Image.merge("RGB",(noise,noise,noise)).point(lambda p:int(p*0.06)))

    # ----- vignette -----
    vig=Image.new("L",(W,H),0); ImageDraw.Draw(vig).ellipse([-W*0.22,-H*0.22,W*1.22,H*1.22],fill=255)
    vig=vig.filter(ImageFilter.GaussianBlur(130))
    img=Image.composite(img, Image.new("RGB",(W,H),VOID), vig)

    # ----- anamorphic letterbox -----
    bar=int(H*0.07)
    d2=ImageDraw.Draw(img)
    d2.rectangle([0,0,W,bar],fill=(0,0,0)); d2.rectangle([0,H-bar,W,H],fill=(0,0,0))

    return img


if __name__=="__main__":
    print(f"Rendering {N} frames ({DUR}s @ {FPS}fps) {W}x{H}")
    for i in range(N):
        render(i).save(f"{OUT_DIR}/f{i:04d}.png")
        if i%30==0: print(f"  {i}/{N}  t={i/FPS:.1f}s")
    print("done")
