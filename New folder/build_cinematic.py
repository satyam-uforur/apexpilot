#!/usr/bin/env python3
"""
APEXRANK — EPIC CINEMATIC GENERATOR
Procedurally renders a hand-crafted dramatic intro cinematic and encodes to MP4.

Beats (epic ~26s @ 30fps):
  0.0 - 2.0   Black void, faint security HUD boots up
  2.0 - 5.0   Emergency red flicker -> tower silhouette rises from fog
  5.0 - 9.0   Camera ascends the concrete tower, amber windows flicker
  9.0 -13.0   "STATUS: LOCKDOWN ACTIVE" + live extraction timer types in
 13.0 -18.0   Continue ascent to rooftop, green extraction beacon pulses
 18.0 -22.0   Helicopter silhouette + helipad ring revealed at summit
 22.0 -26.0   "APEX TOWER / THE ASCENT" title slam + green flare, fade
"""

import math, random, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops

random.seed(7)

W, H = 1280, 720
FPS = 30
DUR = 26.0
N = int(FPS * DUR)
OUT_DIR = "cine_frames"
os.makedirs(OUT_DIR, exist_ok=True)

# ---------- palette ----------
VOID   = (3, 3, 10)
TOWER1 = (10, 10, 20)
TOWER2 = (28, 28, 56)
GREEN  = (0, 255, 179)
GREEN2 = (0, 200, 138)
RED    = (255, 60, 90)
AMBER  = (239, 159, 39)
WHITE  = (232, 232, 240)
GHOST  = (90, 90, 130)

# ---------- fonts ----------
def find_font(names, size):
    paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSansNarrow-Bold.ttf",
    ]
    for p in paths:
        if os.path.exists(p):
            try: return ImageFont.truetype(p, size)
            except: pass
    return ImageFont.load_default()

F_TITLE = find_font(["bold"], 96)
F_SUB   = find_font(["mono"], 26)
F_MONO  = find_font(["mono"], 22)
F_SMALL = find_font(["mono"], 16)
F_TINY  = find_font(["mono"], 13)

def lerp(a, b, t): return a + (b - a) * t
def clamp(x, lo=0.0, hi=1.0): return max(lo, min(hi, x))
def smooth(t): return t * t * (3 - 2 * t)
def ease_out(t): return 1 - (1 - t) ** 3
def ease_in(t): return t ** 3

def mix(c1, c2, t):
    return tuple(int(lerp(c1[i], c2[i], t)) for i in range(3))

# ---------- pre-generate window grid (so it stays consistent across frames) ----------
TOWER_W = 360          # tower face width at base reference
WIN_COLS = 9
WIN_ROWS = 70          # very tall tower
windows = []           # list of (col,row,kind) kind: 0 dark,1 amber,2 blue
for r in range(WIN_ROWS):
    for c in range(WIN_COLS):
        k = random.random()
        kind = 1 if k > 0.94 else (2 if k > 0.85 else 0)
        windows.append((c, r, kind, random.random() * 6.28))

# stars / dust for upper sky
dust = [(random.uniform(0, W), random.uniform(0, H), random.uniform(0.3, 1.0)) for _ in range(160)]
rain = [(random.uniform(0, W), random.uniform(0, H), random.uniform(8, 22)) for _ in range(120)]


def draw_text_center(draw, cx, y, text, font, fill, spacing=0, alpha=255):
    # manual letter spacing + centered
    widths = []
    for ch in text:
        bb = draw.textbbox((0, 0), ch, font=font)
        widths.append(bb[2] - bb[0])
    total = sum(widths) + spacing * (len(text) - 1)
    x = cx - total / 2
    asc = font.getmetrics()[0] if hasattr(font, "getmetrics") else 0
    for i, ch in enumerate(text):
        draw.text((x, y), ch, font=font, fill=fill)
        x += widths[i] + spacing


def add_glow(base, mask_img, color, blur, strength):
    """Add colored glow from a luminance mask."""
    glow = Image.new("RGB", base.size, color)
    a = mask_img.filter(ImageFilter.GaussianBlur(blur)).point(lambda p: int(p * strength))
    base.paste(Image.composite(glow, base, a), (0, 0))


def render_frame(i):
    t = i / FPS
    img = Image.new("RGB", (W, H), VOID)
    dr = ImageDraw.Draw(img)

    # ---- vertical fog gradient base ----
    for y in range(0, H, 4):
        f = y / H
        col = mix((1, 1, 6), (8, 10, 26), 1 - f)
        dr.rectangle([0, y, W, y + 4], fill=col)

    # ---- global camera ascent parameter (how high up the tower we are) ----
    # camera climbs from base (0) to roof (1) between t=3 and t=20
    climb = ease_out(clamp((t - 3.0) / 17.0))
    # tower vertical scroll: top of tower descends into view as we climb
    # We'll model the tower as a tall rectangle and pan vertically.

    # ---- distant skyline silhouettes (parallax, only visible mid-high) ----
    sky_alpha = clamp((climb - 0.15) * 2.0)
    if sky_alpha > 0:
        random.seed(99)
        sil = Image.new("L", (W, H), 0)
        sd = ImageDraw.Draw(sil)
        for _ in range(16):
            bw = random.randint(40, 110)
            bx = random.randint(-50, W)
            bh = random.randint(120, 380)
            by = H - bh + int(60 * (1 - climb))
            sd.rectangle([bx, by, bx + bw, H], fill=int(60 * sky_alpha))
        silcol = Image.new("RGB", (W, H), (10, 12, 26))
        img.paste(Image.composite(silcol, img, sil), (0, 0))
        random.seed(7)

    # ---- THE TOWER ----
    # tower appears starting t=2.2 fading from fog
    tower_in = ease_out(clamp((t - 2.2) / 2.5))
    if tower_in > 0:
        cx = W // 2
        # tower width shrinks slightly with perspective as we rise
        tw = int(TOWER_W * (0.62 + 0.10 * (1 - climb)))
        # the visible window-row offset: as climb->1 we show higher rows
        # total tower pixel height if all rows shown:
        row_h = 26
        total_rows_h = WIN_ROWS * row_h
        # base of tower sits below screen at start; at full climb roof is centered
        # baseY = where row 0 (ground) is drawn
        baseY = int(lerp(H + 40, H + total_rows_h - H * 0.30, climb))

        tl = cx - tw // 2
        tr = tl + tw

        # tower body shading (left dark -> center lit -> right dark)
        body = Image.new("RGB", (tw, H), TOWER1)
        bd = ImageDraw.Draw(body)
        for x in range(tw):
            fx = x / tw
            shade = math.sin(fx * math.pi)  # bright in middle
            col = mix(TOWER1, TOWER2, 0.25 + 0.55 * shade)
            bd.line([(x, 0), (x, H)], fill=col)
        region = img.crop((tl, 0, tr, H))
        img.paste(Image.blend(region, body, tower_in), (tl, 0))

        # tower vertical edges
        edge_col = mix(VOID, (50, 50, 80), tower_in)
        dr.line([(tl, 0), (tl, H)], fill=edge_col, width=2)
        dr.line([(tr, 0), (tr, H)], fill=edge_col, width=2)

        # ---- windows ----
        col_w = tw / WIN_COLS
        win_mask = Image.new("L", (W, H), 0)
        wm = ImageDraw.Draw(win_mask)
        amber_mask = Image.new("L", (W, H), 0)
        am = ImageDraw.Draw(amber_mask)

        for (c, r, kind, ph) in windows:
            wy = baseY - r * row_h
            if wy < -row_h or wy > H + row_h:
                continue
            wx = tl + c * col_w + col_w * 0.18
            ww = col_w * 0.64
            wh = row_h * 0.55
            if kind == 0:
                wcol = (7, 7, 16)
                dr.rectangle([wx, wy, wx + ww, wy + wh], fill=wcol)
            elif kind == 1:  # amber, flickering life
                fl = 0.55 + 0.45 * math.sin(t * 1.4 + ph)
                wcol = mix((20, 14, 6), AMBER, fl)
                dr.rectangle([wx, wy, wx + ww, wy + wh], fill=wcol)
                am.rectangle([wx, wy, wx + ww, wy + wh], fill=int(180 * fl * tower_in))
            else:  # cold blue
                dr.rectangle([wx, wy, wx + ww, wy + wh], fill=(18, 26, 48))

        # ---- ROOFTOP elements (only when near top) ----
        roof_row = WIN_ROWS
        roofY = baseY - roof_row * row_h
        roof_vis = clamp((climb - 0.6) / 0.4)
        if roof_vis > 0 and -200 < roofY < H + 200:
            # roof slab
            dr.rectangle([tl - 8, roofY, tr + 8, roofY + 14], fill=mix(VOID, (40, 42, 60), roof_vis))
            # helipad ring (green)
            ring_cx, ring_cy = cx, roofY - 30
            pulse = 0.5 + 0.5 * math.sin(t * 3.0)
            rr = 46
            ring_col = mix((0, 60, 45), GREEN, 0.4 + 0.6 * pulse)
            for k in range(3):
                dr.ellipse([ring_cx - rr + k, ring_cy - rr * 0.4 + k,
                            ring_cx + rr - k, ring_cy + rr * 0.4 - k],
                           outline=ring_col)
            # "H" mark
            draw_text_center(dr, ring_cx, ring_cy - 12, "H", F_SUB, mix((0,80,60), GREEN, roof_vis))

            # ---- extraction beacon (green pulsing sphere on mast) ----
            mast_top = roofY - 90
            dr.line([(cx, roofY), (cx, mast_top)], fill=(40, 44, 64), width=3)
            beacon_glow = Image.new("L", (W, H), 0)
            bg = ImageDraw.Draw(beacon_glow)
            br = int(8 + 6 * pulse)
            bg.ellipse([cx - br, mast_top - br, cx + br, mast_top + br], fill=int(255 * roof_vis))
            add_glow(img, beacon_glow, GREEN, 26, 1.0 * roof_vis)
            dr = ImageDraw.Draw(img)
            dr.ellipse([cx - 6, mast_top - 6, cx + 6, mast_top + 6],
                       fill=mix(GREEN2, (200, 255, 230), pulse))

            # ---- HELICOPTER silhouette (reveal late) ----
            heli_in = ease_out(clamp((t - 18.0) / 3.0))
            if heli_in > 0:
                hx = cx + int(lerp(180, 70, heli_in))   # flies in from right
                hy = mast_top - 70 + int(8 * math.sin(t * 2))
                hcol = mix(VOID, (180, 200, 220), heli_in)
                # body
                dr.ellipse([hx - 26, hy - 9, hx + 22, hy + 9], outline=hcol, width=2)
                # tail
                dr.polygon([(hx + 20, hy - 3), (hx + 64, hy - 1), (hx + 62, hy + 5), (hx + 20, hy + 4)],
                           outline=hcol)
                # skids
                dr.line([(hx - 18, hy + 14), (hx + 14, hy + 14)], fill=hcol, width=2)
                # rotor (spinning blur -> draw as wide ellipse)
                rot_w = int(54 + 18 * math.sin(t * 30))
                dr.line([(hx - rot_w, hy - 16), (hx + rot_w, hy - 16)], fill=GREEN, width=2)
                dr.line([(hx, hy - 16), (hx, hy - 9)], fill=hcol, width=2)
                # spotlight down
                spot = Image.new("L", (W, H), 0)
                spd = ImageDraw.Draw(spot)
                spd.polygon([(hx - 4, hy + 8), (hx + 4, hy + 8),
                             (hx + 40, hy + 160), (hx - 40, hy + 160)],
                            fill=int(40 * heli_in))
                add_glow(img, spot, GREEN, 18, 0.6 * heli_in)
                dr = ImageDraw.Draw(img)

        # amber window glow bloom
        add_glow(img, amber_mask, AMBER, 10, 0.5 * tower_in)
        dr = ImageDraw.Draw(img)

    # ---- atmospheric rain / dust (upper part of climb) ----
    if climb > 0.05:
        ra = clamp(climb * 1.2) * 0.6
        for (rx, ry, rl) in rain:
            yy = (ry + (t * 320) % H)
            x2 = rx - rl * 0.4
            y2 = yy % H
            dr.line([(rx, y2), (x2, y2 + rl)], fill=mix(VOID, (80, 100, 170), ra), width=1)

    # ---- EMERGENCY RED FLICKER (t ~2.0-3.0) ----
    flick = 0.0
    if 1.9 < t < 2.05 or 2.25 < t < 2.32 or 2.45 < t < 2.52:
        flick = 0.30
    if flick > 0:
        red_layer = Image.new("RGB", (W, H), RED)
        img = Image.blend(img, red_layer, flick)
        dr = ImageDraw.Draw(img)

    # ---- SECURITY HUD (boots up early, stays) ----
    hud_in = ease_out(clamp(t / 1.5))
    if hud_in > 0:
        hcol = mix(VOID, GHOST, hud_in)
        # corner brackets
        m = 34; L = 46
        dr.line([(m, m), (m + L, m)], fill=hcol, width=2); dr.line([(m, m), (m, m + L)], fill=hcol, width=2)
        dr.line([(W - m, m), (W - m - L, m)], fill=hcol, width=2); dr.line([(W - m, m), (W - m, m + L)], fill=hcol, width=2)
        dr.line([(m, H - m), (m + L, H - m)], fill=hcol, width=2); dr.line([(m, H - m), (m, H - m - L)], fill=hcol, width=2)
        dr.line([(W - m, H - m), (W - m - L, H - m)], fill=hcol, width=2); dr.line([(W - m, H - m), (W - m, H - m - L)], fill=hcol, width=2)
        # top ops bar
        blink = 1.0 if (int(t * 1.5) % 2 == 0) else 0.3
        dr.ellipse([m + 4, m + 14, m + 12, m + 22], fill=mix(VOID, GREEN, blink * hud_in))
        dr.text((m + 22, m + 12), "APEX SECURITY NETWORK // SECTOR 7", font=F_TINY, fill=hcol)
        dr.text((W - 300, m + 12), "FEED // LIVE   N40 W74", font=F_TINY, fill=hcol)

    # ---- STATUS / TIMER text (t 9-22) ----
    status_in = ease_out(clamp((t - 8.5) / 1.0))
    if status_in > 0 and t < 22.2:
        fade = status_in
        if t > 21.0:
            fade *= clamp((22.2 - t) / 1.2)
        line1 = "STATUS: LOCKDOWN ACTIVE"
        # typewriter on line1
        chars1 = int(clamp((t - 8.6) / 1.4) * len(line1))
        s1 = line1[:chars1]
        col1 = mix(VOID, GREEN, fade)
        dr.text((60, H - 150), s1, font=F_MONO, fill=col1)
        if chars1 >= len(line1):
            # live countdown timer
            remaining = max(0, 3600 - int((t - 10) * 60))   # dramatized fast countdown
            mm, ss = remaining // 60, remaining % 60
            tx = f"EXTRACTION WINDOW: {mm:02d}:{ss:02d}"
            chars2 = int(clamp((t - 10.0) / 1.2) * len(tx))
            s2 = tx[:chars2]
            # color timer portion red
            base = "EXTRACTION WINDOW: "
            dr.text((60, H - 116), s2[:len(base)] if chars2 <= len(base) else base,
                    font=F_MONO, fill=mix(VOID, GHOST, fade))
            if chars2 > len(base):
                bb = dr.textbbox((60, H - 116), base, font=F_MONO)
                dr.text((bb[2], H - 116), s2[len(base):], font=F_MONO,
                        fill=mix(VOID, RED, fade))

    # ---- FINAL TITLE SLAM (t 22-26) ----
    title_t = clamp((t - 22.0) / 4.0)
    if title_t > 0:
        ti = ease_out(clamp((t - 22.0) / 0.6))
        # darken bg behind title
        ov = Image.new("RGB", (W, H), VOID)
        img = Image.blend(img, ov, 0.45 * ti)
        dr = ImageDraw.Draw(img)
        cx = W // 2
        # green flare sweep
        flare = Image.new("L", (W, H), 0)
        fd = ImageDraw.Draw(flare)
        fy = int(lerp(H * 0.55, H * 0.42, ti))
        fd.rectangle([0, fy - 2, W, fy + 2], fill=int(180 * ti))
        add_glow(img, flare, GREEN, 30, 0.8 * ti)
        dr = ImageDraw.Draw(img)
        # title
        ycol = mix(VOID, WHITE, ti)
        scale_pop = lerp(1.15, 1.0, ease_out(ti))
        draw_text_center(dr, cx, H * 0.36, "APEX TOWER", F_TITLE, ycol, spacing=10)
        sub_in = clamp((t - 23.0) / 1.0)
        if sub_in > 0:
            draw_text_center(dr, cx, H * 0.52, "T H E   A S C E N T", F_SUB,
                             mix(VOID, GREEN, ease_out(sub_in)), spacing=8)
        # CTA hint
        cta_in = clamp((t - 24.0) / 1.2)
        if cta_in > 0:
            draw_text_center(dr, cx, H * 0.66, "[ ENTER THE TOWER ]", F_SMALL,
                             mix(VOID, GHOST, ease_out(cta_in)), spacing=3)

    # ---- final fade out at very end ----
    if t > 25.2:
        fo = clamp((t - 25.2) / 0.8)
        img = Image.blend(img, Image.new("RGB", (W, H), VOID), fo * 0.0)  # keep last frame (loop-friendly)

    # ---- scanline ----
    scan = Image.new("RGB", (W, H), (0, 0, 0))
    sd = ImageDraw.Draw(scan)
    sy = int((t * 90) % H)
    sd.rectangle([0, sy, W, sy + 2], fill=(0, 40, 28))
    img = ImageChops.add(img, scan)

    # ---- film grain ----
    if i % 1 == 0:
        noise = Image.effect_noise((W // 2, H // 2), 26).convert("L").resize((W, H))
        noise_rgb = Image.merge("RGB", (noise, noise, noise))
        img = ImageChops.add(img, noise_rgb.point(lambda p: int(p * 0.06)))

    # ---- vignette ----
    vig = Image.new("L", (W, H), 0)
    vd = ImageDraw.Draw(vig)
    vd.ellipse([-W * 0.25, -H * 0.25, W * 1.25, H * 1.25], fill=255)
    vig = vig.filter(ImageFilter.GaussianBlur(120))
    dark = Image.new("RGB", (W, H), VOID)
    img = Image.composite(img, dark, vig)

    return img


if __name__ == "__main__":
    print(f"Rendering {N} frames ({DUR}s @ {FPS}fps) at {W}x{H} ...")
    for i in range(N):
        frame = render_frame(i)
        frame.save(f"{OUT_DIR}/f{i:04d}.png")
        if i % 30 == 0:
            print(f"  frame {i}/{N}  (t={i/FPS:.1f}s)")
    print("Frames done.")
