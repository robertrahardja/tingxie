#!/usr/bin/env python3
"""
Draw the in-house illustrations for tingxie row 97 as flat SVG scenes and
render them to public/images/<word>.png (800x600).

Deliberately contains NO text: the pictures are memory cues for a dictation
test, so the word being tested must never appear in the picture.

Usage:
    python3 scripts/draw_row97_images.py
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


def kid(x, y, s=1.0, shirt="#4f7fff", skin="#ffd9b8", hair="#3a2b22"):
    """A simple standing child, feet at (x, y), scaled by s."""
    return (
        f'<g transform="translate({x},{y}) scale({s})">'
        f'<rect x="-22" y="-60" width="16" height="60" rx="8" fill="#3a4a6b"/>'
        f'<rect x="6" y="-60" width="16" height="60" rx="8" fill="#3a4a6b"/>'
        f'<path d="M-30 -140 H30 L36 -62 H-36 Z" fill="{shirt}"/>'
        f'<circle cx="0" cy="-172" r="32" fill="{skin}"/>'
        f'<path d="M-33 -180 A33 33 0 0 1 33 -180 L33 -190 A33 33 0 0 0 -33 -190 Z" fill="{hair}"/>'
        f'<path d="M-33 -182 A34 34 0 0 1 33 -182 Q20 -200 0 -206 Q-20 -200 -33 -182 Z" fill="{hair}"/>'
        f'<circle cx="-11" cy="-172" r="4" fill="#2b2b2b"/>'
        f'<circle cx="11" cy="-172" r="4" fill="#2b2b2b"/>'
        f'<path d="M-9 -158 Q0 -150 9 -158" stroke="#2b2b2b" stroke-width="3" fill="none" stroke-linecap="round"/>'
        f'</g>'
    )


# ---------------------------------------------------------------- 沿着
def yanzhe() -> str:
    """A child walking along a winding river bank, footprints hugging the curve."""
    prints = "".join(
        f'<ellipse cx="{cx}" cy="{cy}" rx="9" ry="14" fill="#b08968" opacity="0.75" transform="rotate({r} {cx} {cy})"/>'
        for cx, cy, r in [
            (96, 420, -16), (150, 406, -12), (208, 400, -8), (268, 404, -4),
            (330, 416, 2), (392, 432, 6), (452, 446, 10), (506, 458, 14),
        ]
    )
    return svg(
        '<rect x="0" y="0" width="800" height="230" fill="#cfe3ff"/>'
        '<circle cx="690" cy="86" r="40" fill="#ffd166"/>'
        '<rect x="0" y="230" width="800" height="370" fill="#96c97f"/>'
        # river curving across the scene
        '<path d="M-20 262 C160 214 300 312 440 292 C580 272 700 342 820 312 L820 392 '
        'C700 422 580 352 440 372 C300 392 160 294 -20 342 Z" fill="#5aa9e6"/>'
        '<path d="M-20 262 C160 214 300 312 440 292 C580 272 700 342 820 312" '
        'stroke="#3d8bcd" stroke-width="6" fill="none"/>'
        # sandy bank the child follows
        '<path d="M-20 342 C160 294 300 392 440 372 C580 352 700 422 820 392 L820 530 '
        'C700 560 580 490 440 510 C300 530 160 432 -20 480 Z" fill="#f3dcae"/>'
        + prints +
        kid(570, 476, 0.95, shirt="#ef6f6c")
        # a couple of reeds on the far bank
        + '<path d="M120 262 Q126 220 134 262 M140 268 Q148 224 156 268" stroke="#3f8f4f" stroke-width="6" fill="none" stroke-linecap="round"/>'
        '<path d="M680 282 Q688 238 696 282" stroke="#3f8f4f" stroke-width="6" fill="none" stroke-linecap="round"/>'
    )


# ---------------------------------------------------------------- 拍照片
def paizhaopian() -> str:
    """Hands holding a camera, shutter flash, and a printed photo beside it."""
    return svg(
        '<ellipse cx="400" cy="556" rx="250" ry="20" fill="#dfe4ee"/>'
        # flash burst behind the camera
        '<g opacity="0.85">'
        + "".join(
            f'<polygon points="250,150 {250 + 22 * dx},{150 + 22 * dy} {250 + 90 * dx},{150 + 90 * dy}" '
            f'fill="#ffd166"/>'
            for dx, dy in [(-1, 0), (-0.9, -0.6), (-0.5, -1), (0.1, -1.1), (0.7, -0.9), (1, -0.4)]
        )
        + '</g>'
        # camera body
        '<rect x="230" y="200" width="380" height="250" rx="28" fill="#3b4256"/>'
        '<rect x="230" y="200" width="380" height="54" rx="26" fill="#4d556e"/>'
        '<rect x="256" y="160" width="86" height="48" rx="12" fill="#3b4256"/>'
        '<rect x="268" y="172" width="62" height="24" rx="8" fill="#ffe9a8"/>'
        # shutter button
        '<rect x="520" y="176" width="52" height="30" rx="14" fill="#ef6f6c"/>'
        # lens
        '<circle cx="420" cy="330" r="104" fill="#232838"/>'
        '<circle cx="420" cy="330" r="80" fill="#2f5fa8"/>'
        '<circle cx="420" cy="330" r="52" fill="#173a6b"/>'
        '<circle cx="392" cy="300" r="20" fill="#ffffff" opacity="0.55"/>'
        # grip + strap
        '<rect x="242" y="300" width="60" height="120" rx="18" fill="#2c3244"/>'
        '<path d="M236 250 C150 300 140 420 210 470" stroke="#8a93a8" stroke-width="16" fill="none" stroke-linecap="round"/>'
        '<path d="M604 250 C690 300 700 420 630 470" stroke="#8a93a8" stroke-width="16" fill="none" stroke-linecap="round"/>'
        # a printed photo lying in front (a simple beach scene, no text)
        '<g transform="rotate(-8 640 500)">'
        '<rect x="556" y="428" width="176" height="146" rx="6" fill="#ffffff"/>'
        '<rect x="568" y="440" width="152" height="98" fill="#cfe3ff"/>'
        '<circle cx="694" cy="466" r="16" fill="#ffd166"/>'
        '<rect x="568" y="500" width="152" height="38" fill="#f3dcae"/>'
        '<path d="M568 500 h152" stroke="#5aa9e6" stroke-width="8"/>'
        '</g>'
    )


# ---------------------------------------------------------------- 讨论
def taolun() -> str:
    """Three children around a table, speech bubbles crossing between them."""
    return svg(
        '<rect x="0" y="0" width="800" height="600" fill="#f5f7fb"/>'
        # speech bubbles
        '<g>'
        '<path d="M120 108 H330 A24 24 0 0 1 354 132 V216 A24 24 0 0 1 330 240 H208 L176 282 L182 240 H120 '
        'A24 24 0 0 1 96 216 V132 A24 24 0 0 1 120 108 Z" fill="#4f7fff"/>'
        '<path d="M150 150 H300 M150 182 H280 M150 212 H240" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/>'
        '</g>'
        '<g>'
        '<path d="M470 76 H680 A24 24 0 0 1 704 100 V184 A24 24 0 0 1 680 208 H600 L560 250 L572 208 H470 '
        'A24 24 0 0 1 446 184 V100 A24 24 0 0 1 470 76 Z" fill="#ef6f6c"/>'
        '<path d="M496 118 H656 M496 150 H620 M496 180 H580" stroke="#ffffff" stroke-width="12" stroke-linecap="round"/>'
        '</g>'
        # round table
        '<ellipse cx="400" cy="470" rx="250" ry="70" fill="#c98a54"/>'
        '<ellipse cx="400" cy="454" rx="250" ry="70" fill="#e0a86b"/>'
        # a book and pencils on the table
        '<g transform="rotate(-6 400 442)">'
        '<rect x="330" y="418" width="140" height="48" rx="6" fill="#ffffff"/>'
        '<rect x="396" y="418" width="8" height="48" fill="#cbd3e1"/>'
        '</g>'
        '<rect x="500" y="430" width="96" height="12" rx="6" fill="#ffd166" transform="rotate(10 548 436)"/>'
        # three children
        + kid(190, 470, 0.92, shirt="#3fa34d")
        + kid(400, 440, 0.78, shirt="#ffd166", hair="#5c4033")
        + kid(610, 470, 0.92, shirt="#8e6cef")
    )


# ---------------------------------------------------------------- 检查
def jiancha() -> str:
    """A magnifying glass over a worksheet, ticks and one circled mistake."""
    ticks = "".join(
        f'<path d="M{x} {y} l16 18 l30 -40" stroke="#3fa34d" stroke-width="12" fill="none" '
        f'stroke-linecap="round" stroke-linejoin="round"/>'
        for x, y in [(212, 206), (212, 288), (212, 452)]
    )
    return svg(
        '<ellipse cx="400" cy="558" rx="240" ry="20" fill="#dfe4ee"/>'
        # paper
        '<rect x="170" y="110" width="420" height="420" rx="14" fill="#ffffff"/>'
        '<rect x="170" y="110" width="420" height="52" rx="14" fill="#e8edf7"/>'
        + "".join(
            f'<rect x="286" y="{y}" width="{w}" height="14" rx="7" fill="#cbd3e1"/>'
            for y, w in [(198, 240), (280, 210), (362, 250), (444, 190)]
        )
        + ticks
        # the wrong line: circled in red with a cross
        + '<ellipse cx="400" cy="369" rx="130" ry="36" fill="none" stroke="#ef6f6c" stroke-width="10"/>'
        '<path d="M214 350 l40 40 M254 350 l-40 40" stroke="#ef6f6c" stroke-width="12" stroke-linecap="round"/>'
        # magnifying glass over the circled line
        + '<g transform="rotate(-20 470 340)">'
        '<circle cx="470" cy="340" r="132" fill="#bcd9ff" opacity="0.45"/>'
        '<circle cx="470" cy="340" r="132" fill="none" stroke="#3b4256" stroke-width="20"/>'
        '<circle cx="428" cy="298" r="34" fill="#ffffff" opacity="0.6"/>'
        '<rect x="452" y="466" width="38" height="150" rx="19" fill="#6b7280"/>'
        '</g>'
    )


# ---------------------------------------------------------------- 仍然
def rengran() -> str:
    """Rain still falling on a child who keeps standing under an umbrella,
    with a clock showing time has passed (hands only, no numerals)."""
    drops = "".join(
        f'<path d="M{x} {y} q7 12 0 20 q-7 -8 0 -20 Z" fill="#5aa9e6"/>'
        for x, y in [
            (90, 120), (170, 210), (250, 140), (330, 260), (120, 330),
            (600, 150), (680, 240), (740, 130), (640, 340), (560, 260),
            (200, 400), (700, 420),
        ]
    )
    return svg(
        '<rect x="0" y="0" width="800" height="600" fill="#cfd8e8"/>'
        '<ellipse cx="180" cy="120" rx="120" ry="52" fill="#9aa8bf"/>'
        '<ellipse cx="620" cy="100" rx="140" ry="58" fill="#9aa8bf"/>'
        + drops
        + '<rect x="0" y="500" width="800" height="100" fill="#7e8aa0"/>'
        '<ellipse cx="400" cy="512" rx="120" ry="16" fill="#6b7789"/>'
        # umbrella
        '<path d="M250 300 A150 150 0 0 1 550 300 Z" fill="#ef6f6c"/>'
        '<path d="M250 300 q37 -34 75 0 q37 -34 75 0 q37 -34 75 0 q37 -34 75 0" fill="#d95550"/>'
        '<rect x="394" y="300" width="12" height="190" fill="#8b5e34"/>'
        '<path d="M406 490 q0 26 -26 26" stroke="#8b5e34" stroke-width="12" fill="none" stroke-linecap="round"/>'
        + kid(440, 500, 0.85, shirt="#ffd166")
        # clock, hands moved on — nothing else has changed
        + '<circle cx="110" cy="480" r="62" fill="#ffffff" stroke="#3b4256" stroke-width="10"/>'
        '<path d="M110 480 V436 M110 480 L146 494" stroke="#3b4256" stroke-width="10" stroke-linecap="round"/>'
        '<circle cx="110" cy="480" r="7" fill="#ef6f6c"/>'
    )


# ---------------------------------------------------------------- 急忙
def jimang() -> str:
    """A child running flat out, bag flying, speed lines and a late-running clock."""
    return svg(
        '<rect x="0" y="0" width="800" height="240" fill="#ffe9c9"/>'
        '<rect x="0" y="240" width="800" height="360" fill="#f3dcae"/>'
        '<rect x="0" y="470" width="800" height="130" fill="#d9c08f"/>'
        # speed lines
        + "".join(
            f'<rect x="{x}" y="{y}" width="{w}" height="12" rx="6" fill="#ff9f45" opacity="0.8"/>'
            for x, y, w in [(60, 250, 190), (40, 300, 150), (80, 352, 220), (50, 404, 130)]
        )
        # running child (custom pose)
        + '<g transform="translate(470,470)">'
        '<path d="M-10 -60 L-70 0" stroke="#3a4a6b" stroke-width="26" stroke-linecap="round"/>'
        '<path d="M6 -62 L62 -26 L58 4" stroke="#3a4a6b" stroke-width="26" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
        '<path d="M-34 -142 H30 L42 -58 H-40 Z" fill="#4f7fff" transform="rotate(8)"/>'
        '<path d="M-28 -124 L-96 -92" stroke="#ffd9b8" stroke-width="22" stroke-linecap="round"/>'
        '<path d="M26 -126 L86 -168" stroke="#ffd9b8" stroke-width="22" stroke-linecap="round"/>'
        '<circle cx="8" cy="-176" r="32" fill="#ffd9b8"/>'
        '<path d="M-25 -184 A33 33 0 0 1 41 -184 Q28 -206 8 -212 Q-12 -206 -25 -184 Z" fill="#3a2b22"/>'
        '<circle cx="18" cy="-178" r="4" fill="#2b2b2b"/>'
        '<circle cx="0" cy="-178" r="4" fill="#2b2b2b"/>'
        '<ellipse cx="10" cy="-160" rx="9" ry="7" fill="#8b3a3a"/>'
        '<path d="M-50 -200 q10 -18 26 -10 M-70 -172 q-18 6 -20 24" stroke="#5aa9e6" stroke-width="7" fill="none" stroke-linecap="round"/>'
        '</g>'
        # school bag flying behind
        '<g transform="rotate(-18 330 350)">'
        '<rect x="286" y="300" width="96" height="112" rx="20" fill="#ef6f6c"/>'
        '<rect x="286" y="330" width="96" height="26" fill="#d95550"/>'
        '<path d="M310 300 q24 -30 48 0" stroke="#d95550" stroke-width="10" fill="none"/>'
        '</g>'
        # clock showing it is nearly time
        '<circle cx="680" cy="130" r="70" fill="#ffffff" stroke="#3b4256" stroke-width="11"/>'
        '<path d="M680 130 V78 M680 130 L716 142" stroke="#ef6f6c" stroke-width="11" stroke-linecap="round"/>'
        '<circle cx="680" cy="130" r="8" fill="#3b4256"/>'
    )


# ---------------------------------------------------------------- 地图
def ditu() -> str:
    """An unfolded map with roads, a river, and a pin marking a spot."""
    return svg(
        '<ellipse cx="400" cy="548" rx="270" ry="22" fill="#dfe4ee"/>'
        # folded map sheet (three panels)
        '<path d="M110 140 L300 110 L500 150 L690 110 L690 470 L500 510 L300 470 L110 500 Z" fill="#fdf6e3"/>'
        '<path d="M300 110 V470 M500 150 V510" stroke="#e0d6bb" stroke-width="6"/>'
        # land tints
        '<path d="M110 140 L300 110 L300 300 L110 320 Z" fill="#e8f0d8"/>'
        '<path d="M500 150 L690 110 L690 280 L500 320 Z" fill="#e8f0d8"/>'
        # river
        '<path d="M120 420 C220 360 260 300 380 300 C480 300 520 220 680 200" '
        'stroke="#5aa9e6" stroke-width="16" fill="none" stroke-linecap="round"/>'
        # roads
        '<path d="M150 470 C260 430 300 250 430 210 C520 182 600 200 680 160" '
        'stroke="#ffb703" stroke-width="12" fill="none" stroke-linecap="round"/>'
        '<path d="M120 240 C240 250 330 380 470 400 C560 412 620 460 690 440" '
        'stroke="#ffffff" stroke-width="12" fill="none" stroke-linecap="round"/>'
        '<path d="M120 240 C240 250 330 380 470 400 C560 412 620 460 690 440" '
        'stroke="#c4cad6" stroke-width="12" fill="none" stroke-dasharray="18 16" stroke-linecap="round"/>'
        # little green blocks (parks) and grey blocks (buildings)
        + "".join(
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="5" fill="{c}"/>'
            for x, y, w, h, c in [
                (160, 170, 54, 40, "#a8d19f"), (238, 340, 44, 34, "#a8d19f"),
                (540, 380, 60, 40, "#a8d19f"), (352, 160, 46, 34, "#cbd3e1"),
                (600, 300, 52, 36, "#cbd3e1"), (196, 396, 50, 32, "#cbd3e1"),
            ]
        )
        # map pin
        + '<path d="M430 180 C474 180 508 214 508 258 C508 314 430 392 430 392 '
        'C430 392 352 314 352 258 C352 214 386 180 430 180 Z" fill="#ef6f6c"/>'
        '<circle cx="430" cy="256" r="30" fill="#ffffff"/>'
    )


# ---------------------------------------------------------------- 眼睛圆圆
def yanjingyuanyuan() -> str:
    """A round-eyed owl-ish face: two big perfectly round eyes, wide open."""
    def eye(cx):
        return (
            f'<circle cx="{cx}" cy="300" r="132" fill="#ffffff" stroke="#3b4256" stroke-width="12"/>'
            f'<circle cx="{cx}" cy="300" r="76" fill="#8b5e34"/>'
            f'<circle cx="{cx}" cy="300" r="40" fill="#1d1d1d"/>'
            f'<circle cx="{cx - 26}" cy="272" r="22" fill="#ffffff"/>'
            f'<circle cx="{cx + 22}" cy="330" r="10" fill="#ffffff" opacity="0.7"/>'
        )

    return svg(
        '<circle cx="400" cy="300" r="290" fill="#ffd166"/>'
        # soft rounded ears
        '<circle cx="150" cy="150" r="70" fill="#f0b429"/>'
        '<circle cx="650" cy="150" r="70" fill="#f0b429"/>'
        '<circle cx="400" cy="300" r="290" fill="#ffd166"/>'
        + eye(268) + eye(532)
        + '<path d="M400 372 L358 424 H442 Z" fill="#ef6f6c"/>'
        '<path d="M300 480 Q400 540 500 480" stroke="#b8860b" stroke-width="12" fill="none" stroke-linecap="round"/>'
    )


# ---------------------------------------------------------------- 咬断
def yaoduan() -> str:
    """A mouse on a table biting a carrot clean in two — the halves fall apart."""
    return svg(
        '<rect x="0" y="0" width="800" height="380" fill="#eef2f9"/>'
        '<rect x="0" y="380" width="800" height="220" fill="#e0a86b"/>'
        '<rect x="0" y="372" width="800" height="18" fill="#c98a54"/>'
        # left half of the bitten carrot, tipping away
        '<g transform="rotate(-18 200 320)">'
        '<path d="M110 268 L250 300 L250 340 L110 312 Z" fill="#ff8c42"/>'
        '<path d="M110 268 L70 256 L70 324 L110 312 Z" fill="#e8762f"/>'
        '<path d="M70 290 L24 250 M70 290 L18 290 M70 290 L26 332" stroke="#3fa34d" stroke-width="12" stroke-linecap="round"/>'
        '<path d="M250 300 l-16 12 l16 12 l-16 16" fill="none" stroke="#ffd7b0" stroke-width="7"/>'
        '</g>'
        # right half of the carrot, tipping the other way
        '<g transform="rotate(20 640 300)">'
        '<path d="M596 258 L742 232 L770 276 L596 298 Z" fill="#ff8c42"/>'
        '<path d="M596 258 l16 12 l-16 12 l16 16" fill="none" stroke="#ffd7b0" stroke-width="7"/>'
        '</g>'
        # snap flash at the bite point
        '<g opacity="0.9">'
        '<polygon points="400,168 424,236 400,220 376,236" fill="#ffd166"/>'
        '<polygon points="328,214 392,238 332,254" fill="#ffd166"/>'
        '<polygon points="472,214 408,238 468,254" fill="#ffd166"/>'
        '</g>'
        # mouse standing to the right of the break, head turned to the bitten end
        '<g transform="translate(470,400)">'
        '<ellipse cx="30" cy="-8" rx="150" ry="22" fill="#c98a54" opacity="0.5"/>'
        '<path d="M150 -50 q56 -10 74 -56 q-34 8 -52 -12" stroke="#9aa3b2" stroke-width="10" fill="none" stroke-linecap="round"/>'
        '<ellipse cx="60" cy="-70" rx="118" ry="66" fill="#b0b8c6"/>'
        '<circle cx="140" cy="-126" r="32" fill="#b0b8c6"/>'
        '<circle cx="140" cy="-126" r="17" fill="#e7b7c2"/>'
        '<circle cx="-42" cy="-108" r="56" fill="#c3cad6"/>'
        '<circle cx="-46" cy="-152" r="24" fill="#c3cad6"/>'
        '<circle cx="-46" cy="-152" r="12" fill="#e7b7c2"/>'
        '<circle cx="-62" cy="-116" r="8" fill="#1d1d1d"/>'
        '<path d="M-92 -96 q-22 4 -34 -2" stroke="#ffffff" stroke-width="5" fill="none" stroke-linecap="round"/>'
        '<path d="M-92 -84 q-22 12 -36 12" stroke="#ffffff" stroke-width="5" fill="none" stroke-linecap="round"/>'
        '<circle cx="-98" cy="-104" r="7" fill="#ef6f6c"/>'
        '<path d="M-86 -92 l-10 18 l14 10" fill="#ffffff"/>'
        '</g>'
    )


# ---------------------------------------------------------------- 吃饱
def chibao() -> str:
    """A happy child with a round full tummy, pushing away an empty bowl."""
    return svg(
        '<rect x="0" y="0" width="800" height="380" fill="#fff3d6"/>'
        '<rect x="0" y="380" width="800" height="220" fill="#e0a86b"/>'
        '<rect x="0" y="372" width="800" height="18" fill="#c98a54"/>'
        # empty bowl pushed aside, chopsticks resting on it
        '<g transform="translate(180,340)">'
        '<path d="M-92 0 H92 A92 92 0 0 1 -92 0 Z" fill="#ffffff"/>'
        '<path d="M-92 0 H92 A92 92 0 0 1 -92 0 Z" fill="#dfe6f2" opacity="0.6"/>'
        '<rect x="-100" y="-12" width="200" height="16" rx="8" fill="#4f7fff"/>'
        '<rect x="-112" y="-40" width="230" height="10" rx="5" fill="#c99a52" transform="rotate(-8)"/>'
        '<rect x="-112" y="-22" width="230" height="10" rx="5" fill="#c99a52" transform="rotate(-8)"/>'
        '</g>'
        # child with a round full belly
        '<g transform="translate(520,470)">'
        '<rect x="-56" y="-46" width="30" height="46" rx="14" fill="#3a4a6b"/>'
        '<rect x="26" y="-46" width="30" height="46" rx="14" fill="#3a4a6b"/>'
        '<ellipse cx="0" cy="-116" rx="100" ry="88" fill="#3fa34d"/>'
        '<ellipse cx="0" cy="-96" rx="62" ry="54" fill="#35903f"/>'
        '<path d="M-96 -140 q-58 26 -66 78" stroke="#ffd9b8" stroke-width="26" fill="none" stroke-linecap="round"/>'
        '<path d="M96 -140 q58 26 66 78" stroke="#ffd9b8" stroke-width="26" fill="none" stroke-linecap="round"/>'
        '<circle cx="0" cy="-246" r="56" fill="#ffd9b8"/>'
        '<path d="M-56 -258 A56 56 0 0 1 56 -258 Q34 -296 0 -304 Q-34 -296 -56 -258 Z" fill="#3a2b22"/>'
        '<path d="M-30 -256 q12 -12 24 0 M6 -256 q12 -12 24 0" stroke="#2b2b2b" stroke-width="6" fill="none" stroke-linecap="round"/>'
        '<path d="M-26 -226 q26 30 52 0 Z" fill="#8b3a3a"/>'
        '<circle cx="-46" cy="-224" r="13" fill="#ef9a9a" opacity="0.7"/>'
        '<circle cx="46" cy="-224" r="13" fill="#ef9a9a" opacity="0.7"/>'
        '</g>'
        # contentment marks
        '<path d="M636 150 q22 -34 0 -68 M690 176 q24 -36 0 -72" stroke="#c4cad6" stroke-width="11" fill="none" stroke-linecap="round"/>'
    )


# ---------------------------------------------------------------- 慢慢
def manman() -> str:
    """A tortoise inching forward, a snail behind it, and a trail showing how little ground was covered."""
    return svg(
        '<rect x="0" y="0" width="800" height="330" fill="#d7ecff"/>'
        '<circle cx="120" cy="100" r="44" fill="#ffd166"/>'
        '<ellipse cx="640" cy="330" rx="260" ry="70" fill="#a8d19f"/>'
        '<rect x="0" y="330" width="800" height="270" fill="#96c97f"/>'
        '<path d="M0 420 H800" stroke="#7fb96d" stroke-width="10" stroke-dasharray="4 30"/>'
        # slow trail dots behind
        + "".join(
            f'<circle cx="{x}" cy="474" r="{r}" fill="#7fb96d" opacity="0.7"/>'
            for x, r in [(70, 7), (118, 8), (168, 9), (220, 10)]
        )
        # snail, far behind
        + '<g transform="translate(170,486) scale(1.5)">'
        '<path d="M-60 0 q-8 -24 16 -28 h80 q10 0 10 10 t-10 10 h-70" fill="#e6c79c"/>'
        '<path d="M48 -16 q-6 -20 -18 -26" stroke="#e6c79c" stroke-width="7" fill="none" stroke-linecap="round"/>'
        '<circle cx="30" cy="-46" r="5" fill="#3b4256"/>'
        '<circle cx="-16" cy="-40" r="40" fill="#c98a54"/>'
        '<path d="M-16 -40 m0 -28 a28 28 0 1 1 -20 48 a18 18 0 1 0 20 -32" fill="#a97c3b"/>'
        '</g>'
        # tortoise
        '<g transform="translate(480,462)">'
        '<ellipse cx="0" cy="26" rx="150" ry="20" fill="#7fb96d" opacity="0.6"/>'
        '<rect x="-96" y="-4" width="34" height="34" rx="14" fill="#8fbf6a"/>'
        '<rect x="-30" y="-4" width="34" height="34" rx="14" fill="#8fbf6a"/>'
        '<rect x="54" y="-4" width="34" height="34" rx="14" fill="#8fbf6a"/>'
        '<path d="M-130 4 A130 90 0 0 1 130 4 Z" fill="#a0761f"/>'
        '<path d="M-130 4 A130 90 0 0 1 130 4 Z" fill="none" stroke="#7a5714" stroke-width="8"/>'
        + "".join(
            f'<path d="M{x} 4 L{x2} {y2}" stroke="#7a5714" stroke-width="7"/>'
            for x, x2, y2 in [(-78, -62, -50), (-26, -20, -72), (26, 20, -72), (78, 62, -50)]
        )
        + '<path d="M-96 -22 A96 60 0 0 1 96 -22" stroke="#7a5714" stroke-width="7" fill="none"/>'
        '<path d="M126 -6 q56 -16 62 -50 q2 -18 -16 -16 q-16 2 -18 20 q-4 22 -34 26 Z" fill="#8fbf6a"/>'
        '<circle cx="168" cy="-58" r="6" fill="#1d1d1d"/>'
        '<path d="M-130 8 q-36 6 -40 -16" stroke="#8fbf6a" stroke-width="14" fill="none" stroke-linecap="round"/>'
        '</g>'
    )


# ---------------------------------------------------------------- 软软
def ruanruan() -> str:
    """A hand pressing deep into a squishy cushion/marshmallow, dimpling it."""
    return svg(
        '<ellipse cx="400" cy="540" rx="280" ry="26" fill="#dfe4ee"/>'
        # soft cushion, squashed in the middle by a finger
        '<path d="M150 470 C120 330 190 250 400 250 C610 250 680 330 650 470 '
        'C620 530 180 530 150 470 Z" fill="#ffc2d1"/>'
        '<path d="M150 470 C120 330 190 250 400 250 C610 250 680 330 650 470 '
        'C620 530 180 530 150 470 Z" fill="none" stroke="#f2a2b6" stroke-width="10"/>'
        # dimple where the finger presses
        '<path d="M300 268 C340 350 460 350 500 268" fill="none" stroke="#f2a2b6" stroke-width="12" stroke-linecap="round"/>'
        '<ellipse cx="400" cy="300" rx="86" ry="34" fill="#f7b0c4"/>'
        # highlights and soft corners
        '<ellipse cx="238" cy="330" rx="48" ry="26" fill="#ffffff" opacity="0.5"/>'
        '<ellipse cx="562" cy="330" rx="48" ry="26" fill="#ffffff" opacity="0.5"/>'
        # a flat open palm pressing down from above
        '<g transform="translate(400,120)">'
        '<rect x="-108" y="-20" width="216" height="118" rx="52" fill="#ffd9b8"/>'
        '<rect x="-96" y="60" width="44" height="120" rx="22" fill="#ffd9b8"/>'
        '<rect x="-44" y="60" width="44" height="132" rx="22" fill="#ffd9b8"/>'
        '<rect x="8" y="60" width="44" height="128" rx="22" fill="#ffd9b8"/>'
        '<rect x="60" y="60" width="42" height="112" rx="21" fill="#ffd9b8"/>'
        '<path d="M-108 30 q-56 10 -54 62 q2 44 54 40 Z" fill="#ffd9b8"/>'
        '<rect x="-112" y="-70" width="224" height="62" rx="26" fill="#4f7fff"/>'
        '</g>'
        # squish lines
        '<path d="M120 300 q-28 -10 -34 -36 M680 300 q28 -10 34 -36" stroke="#c4cad6" stroke-width="10" fill="none" stroke-linecap="round"/>'
    )


# ---------------------------------------------------------------- 笨重
def benzhong() -> str:
    """A child straining to shift an enormous stone block; weight lines and sweat."""
    return svg(
        '<rect x="0" y="0" width="800" height="430" fill="#eef2f9"/>'
        '<rect x="0" y="430" width="800" height="170" fill="#c9b99a"/>'
        '<ellipse cx="420" cy="440" rx="260" ry="26" fill="#b3a288"/>'
        # giant stone block
        '<path d="M250 150 L620 150 L700 210 L700 430 L250 430 Z" fill="#8d97a8"/>'
        '<path d="M250 150 L620 150 L700 210 L330 210 Z" fill="#a4aebd"/>'
        '<path d="M250 150 L330 210 L330 430 L250 430 Z" fill="#767f8f"/>'
        '<path d="M360 250 h120 M360 300 h230 M380 360 h180" stroke="#7a8494" stroke-width="10" stroke-linecap="round"/>'
        # crushing/weight arrows
        '<path d="M300 110 V60 M300 110 l-18 -22 M300 110 l18 -22" stroke="#ef6f6c" stroke-width="10" fill="none" stroke-linecap="round"/>'
        '<path d="M470 110 V50 M470 110 l-18 -22 M470 110 l18 -22" stroke="#ef6f6c" stroke-width="10" fill="none" stroke-linecap="round"/>'
        '<path d="M640 130 V80 M640 130 l-18 -22 M640 130 l18 -22" stroke="#ef6f6c" stroke-width="10" fill="none" stroke-linecap="round"/>'
        # straining child pushing from the left
        '<g transform="translate(180,430)">'
        '<path d="M-6 -54 L-70 -6" stroke="#3a4a6b" stroke-width="26" stroke-linecap="round"/>'
        '<path d="M10 -56 L70 -6" stroke="#3a4a6b" stroke-width="26" stroke-linecap="round"/>'
        '<path d="M-32 -136 H26 L40 -54 H-40 Z" fill="#ffd166"/>'
        '<path d="M16 -122 L76 -150" stroke="#ffd9b8" stroke-width="24" stroke-linecap="round"/>'
        '<path d="M16 -96 L76 -110" stroke="#ffd9b8" stroke-width="24" stroke-linecap="round"/>'
        '<circle cx="-4" cy="-170" r="32" fill="#ffd9b8"/>'
        '<path d="M-37 -178 A33 33 0 0 1 29 -178 Q16 -200 -4 -206 Q-24 -200 -37 -178 Z" fill="#3a2b22"/>'
        '<path d="M-20 -176 q10 -10 20 0 M4 -176 q10 -10 20 0" stroke="#2b2b2b" stroke-width="5" fill="none" stroke-linecap="round"/>'
        '<path d="M-14 -152 q12 -12 24 0" stroke="#8b3a3a" stroke-width="6" fill="none" stroke-linecap="round"/>'
        '<path d="M-44 -204 q8 -20 -6 -34 M-66 -188 q-20 -8 -24 -26" stroke="#5aa9e6" stroke-width="8" fill="none" stroke-linecap="round"/>'
        '</g>'
    )


# ---------------------------------------------------------------- 有趣
def youqu() -> str:
    """A child laughing at a funny pop-up book, with a jack-in-the-box springing out."""
    return svg(
        '<rect x="0" y="0" width="800" height="600" fill="#fff6e5"/>'
        + "".join(
            f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}" opacity="0.5"/>'
            for x, y, r, c in [
                (90, 110, 30, "#ffd166"), (720, 90, 40, "#8ad6a0"),
                (700, 470, 28, "#9ec6ff"), (110, 470, 22, "#ffb3c6"),
            ]
        )
        # table
        + '<rect x="90" y="430" width="620" height="26" rx="12" fill="#c98a54"/>'
        '<rect x="150" y="456" width="26" height="110" fill="#a97243"/>'
        '<rect x="624" y="456" width="26" height="110" fill="#a97243"/>'
        # open pop-up book
        '<path d="M200 430 L400 396 L600 430 L400 430 Z" fill="#ffffff"/>'
        '<path d="M200 430 L400 396 L400 430 Z" fill="#f2f5fb"/>'
        '<path d="M196 434 L400 398 L604 434 L400 442 Z" fill="none" stroke="#cbd3e1" stroke-width="5"/>'
        # jack-in-the-box springing out of the page
        '<path d="M400 396 q-40 -50 10 -80 q50 -30 6 -74" stroke="#ef6f6c" stroke-width="14" fill="none" stroke-linecap="round"/>'
        '<circle cx="416" cy="196" r="58" fill="#ffd166"/>'
        '<circle cx="396" cy="184" r="8" fill="#1d1d1d"/>'
        '<circle cx="436" cy="184" r="8" fill="#1d1d1d"/>'
        '<path d="M386 214 q30 34 60 0 Z" fill="#8b3a3a"/>'
        '<path d="M368 146 L416 110 L464 146 Z" fill="#8e6cef"/>'
        '<circle cx="416" cy="104" r="12" fill="#ef6f6c"/>'
        # laughing child
        + '<g transform="translate(600,430)">'
        '<path d="M-34 -142 H30 L42 -60 H-44 Z" fill="#4f7fff"/>'
        '<path d="M-30 -126 L-92 -170" stroke="#ffd9b8" stroke-width="24" stroke-linecap="round"/>'
        '<path d="M28 -126 L86 -168" stroke="#ffd9b8" stroke-width="24" stroke-linecap="round"/>'
        '<circle cx="-2" cy="-178" r="34" fill="#ffd9b8"/>'
        '<path d="M-36 -186 A34 34 0 0 1 32 -186 Q18 -210 -2 -216 Q-22 -210 -36 -186 Z" fill="#5c4033"/>'
        '<path d="M-22 -184 q10 -12 20 0 M4 -184 q10 -12 20 0" stroke="#2b2b2b" stroke-width="5" fill="none" stroke-linecap="round"/>'
        '<path d="M-20 -158 q18 26 36 0 Z" fill="#8b3a3a"/>'
        '<circle cx="-30" cy="-158" r="11" fill="#ef9a9a" opacity="0.7"/>'
        '<circle cx="28" cy="-158" r="11" fill="#ef9a9a" opacity="0.7"/>'
        '</g>'
    )


# ---------------------------------------------------------------- 打滚
def dagun() -> str:
    """A puppy rolling on its back in the grass, motion arcs showing the roll."""
    return svg(
        '<rect x="0" y="0" width="800" height="320" fill="#d7ecff"/>'
        '<circle cx="690" cy="100" r="44" fill="#ffd166"/>'
        '<ellipse cx="200" cy="320" rx="260" ry="64" fill="#a8d19f"/>'
        '<rect x="0" y="320" width="800" height="280" fill="#96c97f"/>'
        + "".join(
            f'<path d="M{x} 470 q6 -30 14 -34 q-2 26 6 34" stroke="#7fb96d" stroke-width="6" fill="none" stroke-linecap="round"/>'
            for x in range(40, 800, 96)
        )
        # roll motion arcs
        + '<path d="M180 340 A180 180 0 0 1 420 300" stroke="#ffb703" stroke-width="12" fill="none" '
        'stroke-linecap="round" stroke-dasharray="26 22"/>'
        '<path d="M404 292 l32 12 l-26 22" fill="#ffb703"/>'
        '<path d="M620 340 A180 180 0 0 0 480 292" stroke="#ffb703" stroke-width="12" fill="none" '
        'stroke-linecap="round" stroke-dasharray="26 22"/>'
        # puppy on its back, legs up
        + '<g transform="translate(400,470)">'
        '<ellipse cx="0" cy="34" rx="180" ry="24" fill="#7fb96d" opacity="0.6"/>'
        '<ellipse cx="0" cy="-10" rx="140" ry="80" fill="#e3b579"/>'
        '<ellipse cx="-20" cy="10" rx="100" ry="58" fill="#f6dfba"/>'
        # legs waving in the air
        '<path d="M-70 -70 q-16 -70 -54 -86" stroke="#e3b579" stroke-width="26" fill="none" stroke-linecap="round"/>'
        '<path d="M-20 -80 q-4 -74 26 -100" stroke="#e3b579" stroke-width="26" fill="none" stroke-linecap="round"/>'
        '<path d="M64 -66 q34 -60 78 -64" stroke="#e3b579" stroke-width="26" fill="none" stroke-linecap="round"/>'
        '<path d="M104 -40 q56 -32 96 -10" stroke="#e3b579" stroke-width="26" fill="none" stroke-linecap="round"/>'
        # upside-down head
        '<circle cx="-146" cy="-30" r="62" fill="#e3b579"/>'
        '<path d="M-196 -66 q-42 -34 -30 18 q6 34 36 26 Z" fill="#c9954f"/>'
        '<path d="M-116 -78 q40 -40 42 12 q2 30 -30 30 Z" fill="#c9954f"/>'
        '<circle cx="-166" cy="-16" r="7" fill="#1d1d1d"/>'
        '<circle cx="-126" cy="-16" r="7" fill="#1d1d1d"/>'
        '<ellipse cx="-146" cy="6" rx="14" ry="10" fill="#3b4256"/>'
        '<path d="M-146 16 q0 16 -16 18" stroke="#3b4256" stroke-width="6" fill="none" stroke-linecap="round"/>'
        '<path d="M-160 22 q-20 24 -44 18" stroke="#ef6f6c" stroke-width="14" fill="none" stroke-linecap="round"/>'
        # curled tail
        '<path d="M136 -20 q54 -8 44 -58 q-6 -26 -30 -14" stroke="#e3b579" stroke-width="22" fill="none" stroke-linecap="round"/>'
        '</g>'
    )


# ---------------------------------------------------------------- 小偷
def xiaotou() -> str:
    """A masked burglar tiptoeing away with a sack, through a jemmied window at night."""
    return svg(
        '<rect x="0" y="0" width="800" height="600" fill="#1f2740"/>'
        '<circle cx="668" cy="108" r="54" fill="#f5efd0"/>'
        '<circle cx="644" cy="96" r="46" fill="#1f2740"/>'
        + "".join(
            f'<circle cx="{x}" cy="{y}" r="{r}" fill="#ffffff" opacity="0.8"/>'
            for x, y, r in [(90, 80, 3), (200, 140, 2), (320, 70, 3), (430, 150, 2), (520, 60, 2), (760, 220, 3)]
        )
        # house wall with an open window
        + '<rect x="0" y="200" width="330" height="400" fill="#2c3552"/>'
        '<rect x="60" y="250" width="200" height="180" rx="8" fill="#141a2c" stroke="#4a577e" stroke-width="10"/>'
        '<rect x="60" y="250" width="200" height="60" rx="6" fill="#4a577e" opacity="0.5"/>'
        '<path d="M160 250 V430" stroke="#4a577e" stroke-width="8"/>'
        # floor
        '<rect x="0" y="520" width="800" height="80" fill="#151b2e"/>'
        # sneaking burglar
        '<g transform="translate(520,520)">'
        '<path d="M-10 -56 L-78 -10" stroke="#2b3550" stroke-width="26" stroke-linecap="round"/>'
        '<path d="M8 -58 L62 -14" stroke="#2b3550" stroke-width="26" stroke-linecap="round"/>'
        '<path d="M-34 -142 H30 L42 -56 H-46 Z" fill="#39435f"/>'
        '<path d="M-34 -142 H30 L34 -120 H-38 Z" fill="#2b3550"/>'
        '<path d="M28 -124 L96 -156" stroke="#39435f" stroke-width="24" stroke-linecap="round"/>'
        '<path d="M-30 -122 L-88 -152" stroke="#39435f" stroke-width="24" stroke-linecap="round"/>'
        '<circle cx="-2" cy="-176" r="32" fill="#ffd9b8"/>'
        '<path d="M-35 -184 A33 33 0 0 1 31 -184 Q18 -206 -2 -212 Q-22 -206 -35 -184 Z" fill="#232a42"/>'
        '<rect x="-36" y="-188" width="68" height="24" rx="10" fill="#151b2e"/>'
        '<circle cx="-16" cy="-176" r="5" fill="#ffffff"/>'
        '<circle cx="14" cy="-176" r="5" fill="#ffffff"/>'
        '<path d="M-12 -152 q12 8 24 0" stroke="#8b3a3a" stroke-width="5" fill="none" stroke-linecap="round"/>'
        '</g>'
        # swag sack over the shoulder
        '<g transform="translate(640,380)">'
        '<path d="M-60 40 q-24 -92 60 -110 q84 18 60 110 q-60 26 -120 0 Z" fill="#e8e3d3"/>'
        '<path d="M-24 -74 q24 -22 48 0 l16 -34 l-80 0 Z" fill="#cfc9b6"/>'
        '<rect x="-32" y="-78" width="64" height="16" rx="8" fill="#8b5e34"/>'
        '</g>'
        # tiptoe marks
        + "".join(
            f'<ellipse cx="{x}" cy="546" rx="12" ry="7" fill="#3a4566"/>'
            for x in (300, 350, 402, 452)
        )
    )


IMAGES = {
    "沿着": yanzhe,
    "拍照片": paizhaopian,
    "讨论": taolun,
    "检查": jiancha,
    "仍然": rengran,
    "急忙": jimang,
    "地图": ditu,
    "眼睛圆圆": yanjingyuanyuan,
    "咬断": yaoduan,
    "吃饱": chibao,
    "慢慢": manman,
    "软软": ruanruan,
    "笨重": benzhong,
    "有趣": youqu,
    "打滚": dagun,
    "小偷": xiaotou,
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
