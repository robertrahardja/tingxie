#!/usr/bin/env python3
"""
Draw the in-house illustrations for tingxie row 96 as flat SVG scenes and
render them to public/images/<word>.png (800x600).

Deliberately contains NO text: the pictures are memory cues for a dictation
test, so the word being tested must never appear in the picture.

Usage:
    python3 scripts/draw_row96_images.py
"""

import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "images"
W, H = 800, 600
BG = "#f5f7fb"

HEAD = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">'
TAIL = "</svg>"


def svg(body: str, bg: str = BG) -> str:
    return f'{HEAD}<rect width="{W}" height="{H}" fill="{bg}"/>{body}{TAIL}'


# ---------------------------------------------------------------- 一直
def yizhi() -> str:
    """A dead-straight road running to the horizon with a big arrow ahead."""
    dashes = "".join(
        f'<polygon points="{400-w},{y} {400+w},{y} {400+w2},{y2} {400-w2},{y2}" fill="#ffffff"/>'
        for (y, w, y2, w2) in [(300, 3, 330, 4), (350, 5, 395, 7), (420, 8, 480, 11), (510, 12, 590, 16)]
    )
    return svg(
        '<rect x="0" y="0" width="800" height="262" fill="#dbe7ff"/>'
        '<circle cx="660" cy="110" r="46" fill="#ffd166"/>'
        '<ellipse cx="180" cy="262" rx="260" ry="70" fill="#b9dcb0"/>'
        '<ellipse cx="640" cy="266" rx="280" ry="60" fill="#a8d19f"/>'
        '<rect x="0" y="262" width="800" height="338" fill="#9ccc8c"/>'
        '<polygon points="330,262 470,262 760,600 40,600" fill="#5a6478"/>'
        '<polygon points="336,262 344,262 70,600 52,600" fill="#ffffff" opacity="0.9"/>'
        '<polygon points="456,262 464,262 748,600 730,600" fill="#ffffff" opacity="0.9"/>'
        + dashes +
        '<path d="M400 90 L480 200 L432 200 L432 300 L368 300 L368 200 L320 200 Z" '
        'fill="#4f7fff" stroke="#ffffff" stroke-width="7" stroke-linejoin="round"/>'
    )


# ---------------------------------------------------------------- 环保袋
def huanbaodai() -> str:
    """A green reusable tote bag with a leaf emblem, groceries peeking out."""
    return svg(
        '<ellipse cx="400" cy="552" rx="230" ry="18" fill="#dfe4ee"/>'
        # handles
        '<path d="M300 215 C300 105 385 105 385 215" fill="none" stroke="#2e8b57" stroke-width="22" stroke-linecap="round"/>'
        '<path d="M415 215 C415 105 500 105 500 215" fill="none" stroke="#2e8b57" stroke-width="22" stroke-linecap="round"/>'
        # groceries: leafy greens, carrot, tomato
        '<ellipse cx="345" cy="200" rx="36" ry="32" fill="#7bc96f"/>'
        '<ellipse cx="380" cy="190" rx="30" ry="30" fill="#5fb85a"/>'
        '<polygon points="440,150 468,215 412,215" fill="#ff8c42"/>'
        '<path d="M440 152 L426 122 M440 152 L440 114 M440 152 L456 122" stroke="#5fb85a" stroke-width="8" stroke-linecap="round" fill="none"/>'
        '<circle cx="330" cy="205" r="0"/>'
        # bag body
        '<path d="M250 210 H550 L575 540 Q575 560 555 560 H245 Q225 560 225 540 Z" fill="#3fa34d"/>'
        '<rect x="250" y="210" width="300" height="34" fill="#2e8b57"/>'
        # leaf emblem
        '<path d="M320 480 C320 340 420 285 530 285 C530 405 455 480 320 480 Z" fill="#ffffff"/>'
        '<path d="M332 470 C400 420 460 365 515 302" stroke="#3fa34d" stroke-width="9" fill="none" stroke-linecap="round"/>'
        '<path d="M380 430 L410 440 M420 395 L455 400 M455 355 L490 352" stroke="#3fa34d" stroke-width="6" fill="none" stroke-linecap="round"/>'
    )


# ---------------------------------------------------------------- 停车场
def tingchechang() -> str:
    """Top-down car park: painted bays, parked cars, one free bay, barrier gate."""
    parts = ['<rect x="60" y="60" width="680" height="480" rx="18" fill="#6b7280"/>']
    # bay lines (top and bottom rows, six bays each)
    for i in range(7):
        x = 98 + i * 100
        parts.append(f'<rect x="{x}" y="80" width="6" height="180" fill="#ffffff"/>')
        parts.append(f'<rect x="{x}" y="340" width="6" height="180" fill="#ffffff"/>')
    # lane arrow
    parts.append(
        '<path d="M250 300 H540 M500 272 L545 300 L500 328" stroke="#fbbf24" stroke-width="9" '
        'fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
    )

    def car(x: int, y: int, color: str) -> str:
        return (
            f'<rect x="{x-6}" y="{y+18}" width="12" height="30" rx="4" fill="#1f2937"/>'
            f'<rect x="{x+70}" y="{y+18}" width="12" height="30" rx="4" fill="#1f2937"/>'
            f'<rect x="{x-6}" y="{y+108}" width="12" height="30" rx="4" fill="#1f2937"/>'
            f'<rect x="{x+70}" y="{y+108}" width="12" height="30" rx="4" fill="#1f2937"/>'
            f'<rect x="{x}" y="{y}" width="76" height="156" rx="22" fill="{color}"/>'
            f'<rect x="{x+10}" y="{y+30}" width="56" height="30" rx="8" fill="#dbe7ff"/>'
            f'<rect x="{x+10}" y="{y+104}" width="56" height="24" rx="8" fill="#dbe7ff"/>'
            f'<rect x="{x+10}" y="{y+64}" width="56" height="36" rx="6" fill="{color}" stroke="#ffffff" stroke-opacity="0.35" stroke-width="3"/>'
        )

    colors = {0: "#e63946", 1: "#4f7fff", 3: "#ffd166", 4: "#2ec4b6", 5: "#f4a261"}
    for i, c in colors.items():
        parts.append(car(112 + i * 100, 92, c))
    for i, c in {1: "#9b5de5", 2: "#ffffff", 4: "#ff8c42"}.items():
        parts.append(car(112 + i * 100, 352, c))
    # entrance barrier at bottom-right corner
    parts.append('<rect x="560" y="548" width="28" height="42" rx="6" fill="#374151"/>')
    parts.append('<rect x="588" y="556" width="150" height="14" rx="7" fill="#ffffff"/>')
    for i in range(4):
        parts.append(f'<rect x="{598 + i*36}" y="556" width="18" height="14" fill="#e63946"/>')
    return svg("".join(parts))


# ---------------------------------------------------------------- 弯弯
def wanwan() -> str:
    """A curved crescent moon over rolling hills with a winding path."""
    sky = "#1e2a5a"
    stars = "".join(
        f'<circle cx="{x}" cy="{y}" r="{r}" fill="#ffffff" opacity="0.9"/>'
        for x, y, r in [(90, 70, 4), (180, 140, 3), (260, 60, 3), (330, 190, 2), (700, 80, 4),
                        (740, 200, 3), (620, 300, 2), (120, 250, 3), (420, 110, 2), (760, 30, 2)]
    )
    return svg(
        stars
        + f'<circle cx="500" cy="200" r="125" fill="#ffd166"/>'
        + f'<circle cx="560" cy="165" r="110" fill="{sky}"/>'
        + '<ellipse cx="200" cy="480" rx="400" ry="150" fill="#2f6b4f"/>'
        + '<ellipse cx="660" cy="510" rx="380" ry="140" fill="#3a7d5c"/>'
        + '<rect x="0" y="480" width="800" height="120" fill="#3a7d5c"/>'
        + '<path d="M40 600 C160 530 60 450 200 430 C340 410 290 510 450 480 C610 450 560 390 780 400" '
          'stroke="#e9d8a6" stroke-width="36" fill="none" stroke-linecap="round"/>'
        + '<path d="M40 600 C160 530 60 450 200 430 C340 410 290 510 450 480 C610 450 560 390 780 400" '
          'stroke="#c9b27e" stroke-width="4" stroke-dasharray="18 14" fill="none" stroke-linecap="round"/>',
        bg=sky,
    )


# ---------------------------------------------------------------- 养着
def yangzhe() -> str:
    """A child sprinkling food into a fishbowl with a goldfish; a potted plant beside it."""
    flakes = "".join(
        f'<circle cx="{x}" cy="{y}" r="{r}" fill="#d98c2b"/>'
        for x, y, r in [(486, 224, 5), (500, 246, 4), (476, 252, 4), (494, 270, 5), (510, 290, 4), (480, 300, 3)]
    )
    pebbles = "".join(
        f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}" clip-path="url(#bowl)"/>'
        for x, y, r, c in [(440, 425, 14, "#b8c2d4"), (470, 432, 11, "#9aa5b8"), (505, 428, 15, "#c9d2e0"),
                           (540, 430, 12, "#9aa5b8"), (565, 420, 10, "#b8c2d4")]
    )
    return svg(
        '<defs><clipPath id="bowl"><circle cx="500" cy="320" r="114"/></clipPath></defs>'
        # table
        '<rect x="80" y="432" width="640" height="26" rx="8" fill="#b08968"/>'
        '<rect x="120" y="458" width="26" height="120" fill="#8d6748"/>'
        '<rect x="654" y="458" width="26" height="120" fill="#8d6748"/>'
        # potted plant
        '<path d="M620 432 L700 432 L690 360 L630 360 Z" fill="#c9694a"/>'
        '<rect x="622" y="350" width="76" height="16" rx="4" fill="#a9563b"/>'
        '<ellipse cx="660" cy="320" rx="26" ry="42" fill="#3fa34d"/>'
        '<ellipse cx="630" cy="318" rx="20" ry="34" fill="#5fb85a" transform="rotate(-30 630 318)"/>'
        '<ellipse cx="690" cy="318" rx="20" ry="34" fill="#5fb85a" transform="rotate(30 690 318)"/>'
        # fish bowl
        '<circle cx="500" cy="320" r="120" fill="#e3f1ff" stroke="#8fb8e8" stroke-width="8"/>'
        '<rect x="380" y="270" width="240" height="180" fill="#8fc8ff" clip-path="url(#bowl)"/>'
        + pebbles +
        '<path d="M565 430 C555 400 575 380 560 350" stroke="#3fa34d" stroke-width="8" fill="none" stroke-linecap="round"/>'
        '<path d="M430 430 C440 405 425 385 438 360" stroke="#3fa34d" stroke-width="8" fill="none" stroke-linecap="round"/>'
        # goldfish
        '<ellipse cx="492" cy="345" rx="42" ry="26" fill="#ff8c42"/>'
        '<polygon points="530,345 566,318 566,372" fill="#ff8c42"/>'
        '<path d="M485 320 Q492 300 505 322" fill="#ff8c42"/>'
        '<circle cx="474" cy="339" r="5" fill="#1e2a5a"/>'
        # bowl rim
        '<rect x="438" y="192" width="124" height="16" rx="8" fill="#8fb8e8"/>'
        + flakes +
        # child on the left
        '<rect x="205" y="392" width="24" height="42" fill="#2b3a67"/>'
        '<rect x="243" y="392" width="24" height="42" fill="#2b3a67"/>'
        '<rect x="190" y="252" width="92" height="150" rx="34" fill="#4f7fff"/>'
        '<path d="M270 290 C330 250 380 230 428 226" stroke="#ffe0bd" stroke-width="24" fill="none" stroke-linecap="round"/>'
        '<g transform="rotate(-35 445 222)"><rect x="425" y="206" width="44" height="30" rx="6" fill="#ffd166"/>'
        '<rect x="425" y="206" width="44" height="8" rx="3" fill="#e6b84c"/></g>'
        '<circle cx="236" cy="200" r="50" fill="#ffe0bd"/>'
        '<path d="M186 196 C186 140 286 140 286 196 C270 175 250 168 236 168 C220 168 200 175 186 196 Z" fill="#5a3a22"/>'
        '<circle cx="220" cy="204" r="5" fill="#1e2a5a"/>'
        '<circle cx="254" cy="204" r="5" fill="#1e2a5a"/>'
        '<path d="M222 224 Q236 236 250 224" stroke="#1e2a5a" stroke-width="4" fill="none" stroke-linecap="round"/>'
    )


# ---------------------------------------------------------------- 尽力
def jinli() -> str:
    """Someone straining with all their might to push a boulder uphill."""
    return svg(
        '<circle cx="120" cy="110" r="48" fill="#ffd166"/>'
        '<polygon points="0,560 800,220 800,600 0,600" fill="#8fbf7f"/>'
        # boulder
        '<circle cx="560" cy="236" r="95" fill="#8d99ae"/>'
        '<circle cx="530" cy="205" r="18" fill="#7a869a"/>'
        '<circle cx="590" cy="260" r="24" fill="#7a869a"/>'
        '<circle cx="545" cy="280" r="10" fill="#7a869a"/>'
        # effort lines on the uphill side of the boulder
        '<path d="M672 190 L705 172 M680 236 L718 232 M672 282 L705 298" stroke="#e63946" stroke-width="8" fill="none" stroke-linecap="round"/>'
        # legs
        '<path d="M330 335 L296 428" stroke="#2b3a67" stroke-width="24" stroke-linecap="round"/>'
        '<path d="M336 335 L372 398" stroke="#2b3a67" stroke-width="24" stroke-linecap="round"/>'
        '<ellipse cx="288" cy="434" rx="22" ry="11" fill="#1f2937" transform="rotate(-23 288 434)"/>'
        '<ellipse cx="378" cy="404" rx="22" ry="11" fill="#1f2937" transform="rotate(-23 378 404)"/>'
        # torso leaning forward
        '<path d="M330 330 L440 270" stroke="#4f7fff" stroke-width="48" stroke-linecap="round"/>'
        # arms pushing the rock
        '<path d="M440 278 L474 240" stroke="#ffe0bd" stroke-width="20" stroke-linecap="round"/>'
        '<path d="M440 286 L480 292" stroke="#ffe0bd" stroke-width="20" stroke-linecap="round"/>'
        # head
        '<circle cx="472" cy="232" r="36" fill="#ffe0bd"/>'
        '<path d="M436 226 C440 186 500 182 508 222 C494 208 476 202 462 206 C450 210 442 218 436 226 Z" fill="#5a3a22"/>'
        '<path d="M486 228 L500 228" stroke="#1e2a5a" stroke-width="4" stroke-linecap="round"/>'
        '<path d="M482 244 Q492 240 500 246" stroke="#1e2a5a" stroke-width="4" fill="none" stroke-linecap="round"/>'
        # sweat drops
        '<path d="M430 190 C430 175 440 165 440 165 C440 165 450 175 450 190 A10 10 0 0 1 430 190 Z" fill="#4fa3e0"/>'
        '<path d="M505 170 C505 158 513 150 513 150 C513 150 521 158 521 170 A8 8 0 0 1 505 170 Z" fill="#4fa3e0"/>'
        '<path d="M395 260 C395 250 402 243 402 243 C402 243 409 250 409 260 A7 7 0 0 1 395 260 Z" fill="#4fa3e0"/>'
    )


# ---------------------------------------------------------------- 森林
def senlin() -> str:
    """A dense forest: layered rows of pine and round-canopy trees with a footpath."""
    parts = [
        '<rect x="0" y="0" width="800" height="330" fill="#dbe7ff"/>',
        '<circle cx="690" cy="90" r="44" fill="#ffd166"/>',
        '<rect x="0" y="330" width="800" height="270" fill="#6fae63"/>',
    ]

    def pine(x: int, base: int, h: int, c1: str, c2: str) -> str:
        w = h * 0.55
        return (
            f'<rect x="{x - h*0.05:.0f}" y="{base - h*0.18:.0f}" width="{h*0.1:.0f}" height="{h*0.2:.0f}" fill="#7a4e2d"/>'
            f'<polygon points="{x},{base-h} {x-w*0.55:.0f},{base-h*0.55:.0f} {x+w*0.55:.0f},{base-h*0.55:.0f}" fill="{c1}"/>'
            f'<polygon points="{x},{base-h*0.78:.0f} {x-w*0.78:.0f},{base-h*0.33:.0f} {x+w*0.78:.0f},{base-h*0.33:.0f}" fill="{c2}"/>'
            f'<polygon points="{x},{base-h*0.56:.0f} {x-w:.0f},{base-h*0.12:.0f} {x+w:.0f},{base-h*0.12:.0f}" fill="{c1}"/>'
        )

    def round_tree(x: int, base: int, h: int, c1: str, c2: str) -> str:
        r = h * 0.32
        return (
            f'<rect x="{x - h*0.06:.0f}" y="{base - h*0.45:.0f}" width="{h*0.12:.0f}" height="{h*0.47:.0f}" fill="#7a4e2d"/>'
            f'<circle cx="{x}" cy="{base - h*0.62:.0f}" r="{r:.0f}" fill="{c2}"/>'
            f'<circle cx="{x - r*0.7:.0f}" cy="{base - h*0.5:.0f}" r="{r*0.8:.0f}" fill="{c1}"/>'
            f'<circle cx="{x + r*0.7:.0f}" cy="{base - h*0.5:.0f}" r="{r*0.8:.0f}" fill="{c1}"/>'
            f'<circle cx="{x}" cy="{base - h*0.75:.0f}" r="{r*0.75:.0f}" fill="{c2}"/>'
        )

    # back row (lightest, smallest)
    for i, x in enumerate(range(30, 800, 80)):
        if i % 2 == 0:
            parts.append(pine(x, 365, 140, "#8ad088", "#7cc47a"))
        else:
            parts.append(round_tree(x, 365, 120, "#8ad088", "#9ad998"))
    # middle row
    for i, x in enumerate(range(60, 800, 110)):
        if i % 3 == 1:
            parts.append(round_tree(x, 455, 170, "#4f9a4c", "#5cab59"))
        else:
            parts.append(pine(x, 455, 185, "#3f8a3c", "#4f9a4c"))
    # footpath
    parts.append('<path d="M400 450 C380 500 440 530 400 600" stroke="#c9b27e" stroke-width="64" fill="none" stroke-linecap="round"/>')
    # front row (darkest, largest), leaving the path clear
    for x, kind in [(80, "p"), (180, "r"), (270, "p"), (540, "p"), (640, "r"), (730, "p")]:
        if kind == "p":
            parts.append(pine(x, 565, 240, "#2f6b2e", "#3b7f3a"))
        else:
            parts.append(round_tree(x, 565, 200, "#2f6b2e", "#3b7f3a"))
    # small bushes
    for x, y in [(150, 585), (670, 582), (330, 590), (480, 592)]:
        parts.append(f'<ellipse cx="{x}" cy="{y}" rx="30" ry="14" fill="#4f9a4c"/>')
    return svg("".join(parts))


# ---------------------------------------------------------------- 沙滩
def shatan() -> str:
    """A sandy beach: sea, sun, striped umbrella, towel, beach ball, starfish, shells."""
    waves = "".join(
        f'<path d="M{x} {y} q 20 -12 40 0 t 40 0 t 40 0" stroke="#ffffff" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8"/>'
        for x, y in [(60, 250), (300, 230), (560, 262), (180, 300), (440, 292), (660, 320)]
    )

    def star(cx: int, cy: int, r: int, color: str) -> str:
        import math
        pts = []
        for k in range(10):
            rr = r if k % 2 == 0 else r * 0.45
            a = -math.pi / 2 + k * math.pi / 5
            pts.append(f"{cx + rr*math.cos(a):.0f},{cy + rr*math.sin(a):.0f}")
        return f'<polygon points="{" ".join(pts)}" fill="{color}" stroke="#e07a2d" stroke-width="3" stroke-linejoin="round"/>'

    # white wedges at 150–120°, 90–60° and 30–0° of the red half-circle (centre 420,300 r=150)
    umbrella_stripes = "".join(
        f'<path d="M420 300 L{x1} {y1} A150 150 0 0 1 {x2} {y2} Z" fill="#ffffff"/>'
        for (x1, y1, x2, y2) in [(290, 225, 345, 170), (420, 150, 495, 170), (550, 225, 570, 300)]
    )
    return svg(
        '<rect x="0" y="0" width="800" height="360" fill="#cfe8ff"/>'
        '<circle cx="130" cy="100" r="52" fill="#ffd166"/>'
        '<rect x="0" y="200" width="800" height="160" fill="#4fa3e0"/>'
        + waves +
        '<path d="M0 350 Q200 330 400 352 T800 350 V600 H0 Z" fill="#f4d58d"/>'
        '<path d="M0 352 Q200 332 400 354 T800 352" stroke="#ffffff" stroke-width="10" fill="none" opacity="0.9"/>'
        # umbrella
        '<rect x="416" y="300" width="8" height="240" fill="#8d6748"/>'
        '<path d="M270 300 A150 150 0 0 1 570 300 Z" fill="#e63946"/>'
        + umbrella_stripes +
        '<circle cx="420" cy="150" r="9" fill="#8d6748"/>'
        # towel
        '<rect x="470" y="470" width="220" height="90" rx="10" fill="#4f7fff" transform="rotate(-8 580 515)"/>'
        '<rect x="470" y="498" width="220" height="18" fill="#ffffff" transform="rotate(-8 580 515)"/>'
        # beach ball
        '<circle cx="230" cy="500" r="56" fill="#ffffff"/>'
        '<path d="M230 444 A56 56 0 0 1 286 500 L230 500 Z" fill="#e63946"/>'
        '<path d="M286 500 A56 56 0 0 1 230 556 L230 500 Z" fill="#4f7fff"/>'
        '<path d="M230 556 A56 56 0 0 1 174 500 L230 500 Z" fill="#ffd166"/>'
        '<path d="M174 500 A56 56 0 0 1 230 444 L230 500 Z" fill="#2ec4b6"/>'
        '<circle cx="230" cy="500" r="56" fill="none" stroke="#1f2937" stroke-width="3"/>'
        # starfish and shells
        + star(660, 420, 40, "#ff8c42") +
        '<path d="M90 470 A28 28 0 0 1 146 470 Z" fill="#f7c8b3" stroke="#d98c7a" stroke-width="3"/>'
        '<path d="M118 470 L104 448 M118 470 L118 444 M118 470 L132 448" stroke="#d98c7a" stroke-width="3" stroke-linecap="round"/>'
        '<path d="M330 560 A20 20 0 0 1 370 560 Z" fill="#f7c8b3" stroke="#d98c7a" stroke-width="3"/>'
        # footprints
        '<ellipse cx="560" cy="580" rx="9" ry="14" fill="#e3c27a"/>'
        '<ellipse cx="590" cy="600" rx="9" ry="14" fill="#e3c27a"/>'
    )


IMAGES = {
    "一直": yizhi,
    "环保袋": huanbaodai,
    "停车场": tingchechang,
    "弯弯": wanwan,
    "养着": yangzhe,
    "尽力": jinli,
    "森林": senlin,
    "沙滩": shatan,
}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for word, fn in IMAGES.items():
        markup = fn()
        assert "<text" not in markup, f"{word}: illustrations must not contain text"
        png = OUT / f"{word}.png"
        subprocess.run(
            ["rsvg-convert", "-w", str(W), "-h", str(H), "-o", str(png)],
            input=markup.encode("utf-8"),
            check=True,
        )
        print(f"wrote {png.relative_to(ROOT)} ({png.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
