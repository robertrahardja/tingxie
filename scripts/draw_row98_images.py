#!/usr/bin/env python3
"""
Draw the in-house illustrations for tingxie row 98 as flat SVG scenes and
render them to public/images/<word>.png (800x600).

Deliberately contains NO text: the pictures are memory cues for a dictation
test, so the word being tested must never appear in the picture.

Usage:
    python3 scripts/draw_row98_images.py
"""

import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "images"
W, H = 800, 600
BG = "#f5f7fb"

HEAD = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">'
TAIL = "</svg>"

SKIN = "#f7c9a6"
HAIR = "#3b2a20"


def svg(body: str, bg: str = BG) -> str:
    return f'{HEAD}<rect width="{W}" height="{H}" fill="{bg}"/>{body}{TAIL}'


def head(cx: int, cy: int, r: int = 52, skin: str = SKIN) -> str:
    """Round head with hair cap; caller adds the face."""
    return (
        f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{skin}"/>'
        f'<path d="M{cx-r} {cy-6} A{r} {r} 0 0 1 {cx+r} {cy-6} Z" fill="{HAIR}"/>'
    )


def eyes_open(cx: int, cy: int, dx: int = 18, r: int = 6) -> str:
    return (
        f'<circle cx="{cx-dx}" cy="{cy}" r="{r}" fill="#1f2937"/>'
        f'<circle cx="{cx+dx}" cy="{cy}" r="{r}" fill="#1f2937"/>'
    )


def eyes_wide(cx: int, cy: int, dx: int = 19) -> str:
    """Big frightened/startled eyes: white ball, small pupil."""
    return (
        f'<ellipse cx="{cx-dx}" cy="{cy}" rx="12" ry="14" fill="#ffffff" stroke="#1f2937" stroke-width="3"/>'
        f'<ellipse cx="{cx+dx}" cy="{cy}" rx="12" ry="14" fill="#ffffff" stroke="#1f2937" stroke-width="3"/>'
        f'<circle cx="{cx-dx}" cy="{cy+2}" r="5" fill="#1f2937"/>'
        f'<circle cx="{cx+dx}" cy="{cy+2}" r="5" fill="#1f2937"/>'
    )


def sweat(x: int, y: int, s: float = 1.0) -> str:
    """A single teardrop-shaped sweat bead pointing up."""
    w, h = 11 * s, 18 * s
    return (
        f'<path d="M{x} {y-h} C{x+w} {y-h*0.25} {x+w*0.85} {y+h*0.42} {x} {y+h*0.42} '
        f'C{x-w*0.85} {y+h*0.42} {x-w} {y-h*0.25} {x} {y-h} Z" '
        'fill="#7ec8f2" stroke="#3aa0d8" stroke-width="2"/>'
    )


# ---------------------------------------------------------------- 漫画
def manhua() -> str:
    """An open comic book: gutter down the middle, panels with wordless art."""

    def panel(x, y, w, h, inner):
        return (
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="4" '
            'fill="#ffffff" stroke="#1f2937" stroke-width="4"/>' + inner
        )

    # speech balloons stay EMPTY - no text anywhere in the picture
    def balloon(cx, cy, rx, ry, tipx, tipy):
        return (
            f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="#ffffff" '
            'stroke="#1f2937" stroke-width="3"/>'
            f'<path d="M{cx-8} {cy+ry-3} L{tipx} {tipy} L{cx+10} {cy+ry-2} Z" '
            'fill="#ffffff" stroke="#1f2937" stroke-width="3" stroke-linejoin="round"/>'
        )

    left = (
        panel(120, 130, 130, 120,
              '<circle cx="185" cy="205" r="26" fill="#ffd166" stroke="#1f2937" stroke-width="3"/>'
              '<circle cx="176" cy="200" r="4" fill="#1f2937"/>'
              '<circle cx="194" cy="200" r="4" fill="#1f2937"/>'
              '<path d="M172 214 Q185 224 198 214" stroke="#1f2937" stroke-width="3" fill="none"/>'
              + balloon(205, 158, 30, 17, 190, 186))
        + panel(120, 262, 130, 100,
                '<rect x="130" y="322" width="110" height="32" fill="#9ccc8c"/>'
                '<path d="M150 322 L178 284 L206 322 Z" fill="#5fb85a"/>'
                '<circle cx="222" cy="288" r="15" fill="#ffd166"/>')
        + panel(120, 374, 130, 110,
                '<path d="M150 460 L150 415 L178 396 L206 415 L206 460 Z" fill="#c9d6ea" stroke="#1f2937" stroke-width="3"/>'
                '<rect x="168" y="428" width="22" height="32" fill="#8b5e3c"/>')
    )
    right = (
        panel(430, 130, 250, 150,
              '<rect x="440" y="238" width="230" height="32" fill="#a8d19f"/>'
              '<circle cx="520" cy="205" r="30" fill="#f7c9a6" stroke="#1f2937" stroke-width="3"/>'
              '<circle cx="511" cy="200" r="4" fill="#1f2937"/>'
              '<circle cx="529" cy="200" r="4" fill="#1f2937"/>'
              '<path d="M508 214 Q520 223 532 214" stroke="#1f2937" stroke-width="3" fill="none"/>'
              '<circle cx="622" cy="176" r="20" fill="#ffd166"/>'
              + balloon(600, 226, 44, 22, 566, 252))
        + panel(430, 292, 118, 96,
                '<path d="M448 372 Q489 318 530 372 Z" fill="#7ec8f2"/>'
                '<circle cx="489" cy="330" r="12" fill="#ff8c42"/>')
        + panel(562, 292, 118, 96,
                '<polygon points="621,312 634,346 670,346 641,366 652,380 621,362 590,380 601,366 572,346 608,346" fill="#ffd166" stroke="#1f2937" stroke-width="3" stroke-linejoin="round"/>')
        + panel(430, 400, 250, 84,
                '<circle cx="480" cy="442" r="22" fill="#ff8c42" stroke="#1f2937" stroke-width="3"/>'
                '<path d="M520 442 H600" stroke="#1f2937" stroke-width="5" stroke-linecap="round"/>'
                '<path d="M580 424 L602 442 L580 460" stroke="#1f2937" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>')
    )
    return svg(
        '<ellipse cx="400" cy="536" rx="290" ry="22" fill="#dfe4ee"/>'
        # book covers fanned open
        '<path d="M400 108 Q250 82 96 118 L96 500 Q250 464 400 496 Z" fill="#ef6f6c" stroke="#1f2937" stroke-width="5" stroke-linejoin="round"/>'
        '<path d="M400 108 Q550 82 704 118 L704 500 Q550 464 400 496 Z" fill="#ef6f6c" stroke="#1f2937" stroke-width="5" stroke-linejoin="round"/>'
        # pages
        '<path d="M400 120 Q262 96 112 130 L112 488 Q262 456 400 486 Z" fill="#fffdf6" stroke="#1f2937" stroke-width="4" stroke-linejoin="round"/>'
        '<path d="M400 120 Q538 96 688 130 L688 488 Q538 456 400 486 Z" fill="#fffdf6" stroke="#1f2937" stroke-width="4" stroke-linejoin="round"/>'
        + left + right +
        '<path d="M400 120 V486" stroke="#1f2937" stroke-width="4"/>'
    )


# ---------------------------------------------------------------- 吓得逃走
def xiadetaozou() -> str:
    """A boy sprinting away in terror from a barking dog, motion lines behind."""
    return svg(
        '<rect x="0" y="0" width="800" height="430" fill="#dbe7ff"/>'
        '<circle cx="700" cy="96" r="42" fill="#ffd166"/>'
        '<ellipse cx="140" cy="430" rx="220" ry="58" fill="#b9dcb0"/>'
        '<rect x="0" y="430" width="800" height="170" fill="#9ccc8c"/>'
        # dust puffs at the runner's heels
        '<circle cx="330" cy="470" r="26" fill="#ffffff" opacity="0.85"/>'
        '<circle cx="366" cy="486" r="18" fill="#ffffff" opacity="0.75"/>'
        '<circle cx="300" cy="492" r="15" fill="#ffffff" opacity="0.7"/>'
        # speed lines trailing behind
        '<path d="M300 250 H200 M300 296 H180 M312 342 H214" stroke="#ffffff" '
        'stroke-width="9" stroke-linecap="round" opacity="0.95"/>'
        # --- the dog, chasing from the right
        '<ellipse cx="620" cy="416" rx="70" ry="42" fill="#b07d4f"/>'
        '<path d="M676 392 Q724 356 716 320 Q700 350 672 366 Z" fill="#b07d4f"/>'
        '<circle cx="556" cy="382" r="40" fill="#c08a58"/>'
        '<path d="M528 352 Q512 306 546 318 Z" fill="#8a5f38"/>'
        '<path d="M586 352 Q604 308 570 318 Z" fill="#8a5f38"/>'
        '<circle cx="544" cy="376" r="5" fill="#1f2937"/>'
        '<circle cx="570" cy="376" r="5" fill="#1f2937"/>'
        '<ellipse cx="530" cy="400" rx="16" ry="13" fill="#6b4a2c"/>'
        '<circle cx="524" cy="396" r="5" fill="#1f2937"/>'
        # open barking mouth + teeth
        '<path d="M518 408 Q536 438 566 424 Q544 414 518 408 Z" fill="#8c2f39"/>'
        '<path d="M524 410 L530 420 L536 411 Z" fill="#ffffff"/>'
        '<path d="M546 416 L552 426 L557 416 Z" fill="#ffffff"/>'
        '<path d="M586 440 L586 468 M620 458 L620 486 M660 440 L660 470" '
        'stroke="#b07d4f" stroke-width="18" stroke-linecap="round"/>'
        # --- the boy, running left, looking back in fright
        '<path d="M352 300 L300 352 L322 372 L372 322 Z" fill="#4f7fff"/>'   # trailing arm
        '<path d="M398 470 L336 506 L352 530 L420 494 Z" fill="#3a63cc"/>'   # trailing leg
        '<path d="M348 262 H452 L470 470 H332 Z" fill="#4f7fff"/>'           # torso
        '<path d="M452 300 L520 268 L534 294 L462 332 Z" fill="#4f7fff"/>'   # forward arm
        '<circle cx="534" cy="282" r="17" fill="#f7c9a6"/>'
        '<path d="M430 470 L472 540 L444 556 L400 486 Z" fill="#3a63cc"/>'   # forward leg
        '<ellipse cx="462" cy="556" rx="30" ry="14" fill="#2f3b52"/>'
        '<ellipse cx="342" cy="532" rx="30" ry="14" fill="#2f3b52"/>'
        + head(400, 202, 54)
        + eyes_wide(408, 200, 20) +
        # eyebrows up, screaming mouth
        '<path d="M378 172 L400 164 M418 164 L440 172" stroke="#1f2937" stroke-width="4" stroke-linecap="round"/>'
        '<ellipse cx="408" cy="236" rx="15" ry="19" fill="#8c2f39"/>'
        + sweat(338, 186, 1.15) + sweat(360, 152, 0.95)
    )


# ---------------------------------------------------------------- 冒出冷汗
def maochulenghan() -> str:
    """Close-up of an anxious face with big cold-sweat beads flying off."""
    return svg(
        '<ellipse cx="400" cy="566" rx="210" ry="20" fill="#dfe4ee"/>'
        # shoulders
        '<path d="M232 600 Q248 474 400 462 Q552 474 568 600 Z" fill="#4f7fff"/>'
        '<path d="M368 466 H432 L424 508 H376 Z" fill="#f7c9a6"/>'
        # neck + head
        '<circle cx="400" cy="300" r="150" fill="#f7c9a6"/>'
        '<path d="M250 292 A150 150 0 0 1 550 292 Q400 250 250 292 Z" fill="#3b2a20"/>'
        '<path d="M250 292 Q400 236 550 292 L550 262 Q400 196 250 262 Z" fill="#3b2a20"/>'
        # worried slanted eyebrows
        '<path d="M300 288 L360 306" stroke="#1f2937" stroke-width="10" stroke-linecap="round"/>'
        '<path d="M500 288 L440 306" stroke="#1f2937" stroke-width="10" stroke-linecap="round"/>'
        # wide anxious eyes
        '<ellipse cx="336" cy="342" rx="32" ry="36" fill="#ffffff" stroke="#1f2937" stroke-width="4"/>'
        '<ellipse cx="464" cy="342" rx="32" ry="36" fill="#ffffff" stroke="#1f2937" stroke-width="4"/>'
        '<circle cx="336" cy="348" r="13" fill="#1f2937"/>'
        '<circle cx="464" cy="348" r="13" fill="#1f2937"/>'
        # pale blue shading on the brow
        '<path d="M286 246 Q400 214 514 246 Q400 268 286 246 Z" fill="#bcd9f0" opacity="0.75"/>'
        # grimacing mouth, teeth clenched
        '<path d="M344 424 Q400 396 456 424 Q400 452 344 424 Z" fill="#8c2f39" stroke="#1f2937" stroke-width="4"/>'
        '<path d="M352 418 H448" stroke="#ffffff" stroke-width="9"/>'
        # cold sweat beads bursting off the forehead and cheeks
        + sweat(252, 214, 1.7) + sweat(330, 168, 2.0) + sweat(470, 170, 1.8)
        + sweat(552, 218, 1.7) + sweat(196, 320, 1.5) + sweat(606, 322, 1.5)
        + sweat(232, 414, 1.3) + sweat(572, 412, 1.3)
    )


# ---------------------------------------------------------------- 掉
def diao() -> str:
    """An ice-cream scoop falling out of its cone, mid-air, toward the ground."""
    return svg(
        '<rect x="0" y="0" width="800" height="452" fill="#dbe7ff"/>'
        '<circle cx="690" cy="98" r="40" fill="#ffd166"/>'
        '<rect x="0" y="452" width="800" height="148" fill="#c9b79c"/>'
        '<rect x="0" y="452" width="800" height="10" fill="#a89478"/>'
        # hand holding the cone, up top
        '<path d="M300 118 L300 200 Q300 234 340 234 L392 234 Q430 234 430 200 L430 118 Z" fill="#f7c9a6"/>'
        '<path d="M300 150 H430" stroke="#e0ab84" stroke-width="4"/>'
        '<path d="M300 182 H430" stroke="#e0ab84" stroke-width="4"/>'
        '<rect x="330" y="230" width="70" height="30" fill="#f7c9a6"/>'
        # the empty cone, tipped over
        '<path d="M322 258 H408 L365 392 Z" fill="#e0a45e" stroke="#b9803e" stroke-width="4" stroke-linejoin="round"/>'
        '<path d="M334 286 L392 286 M344 314 L382 314 M352 342 L374 342" stroke="#b9803e" stroke-width="3"/>'
        # motion lines showing the fall
        '<path d="M470 282 V342 M508 300 V372 M432 316 V366" stroke="#ffffff" '
        'stroke-width="9" stroke-linecap="round" opacity="0.95"/>'
        # the scoop, mid-air and falling
        '<circle cx="470" cy="418" r="56" fill="#f7a1b8" stroke="#d4708c" stroke-width="4"/>'
        '<circle cx="452" cy="400" r="12" fill="#ffffff" opacity="0.6"/>'
        # splat forming on the ground
        '<ellipse cx="470" cy="520" rx="108" ry="26" fill="#f7a1b8" opacity="0.55"/>'
        '<circle cx="380" cy="512" r="12" fill="#f7a1b8"/>'
        '<circle cx="562" cy="516" r="10" fill="#f7a1b8"/>'
        '<circle cx="596" cy="500" r="7" fill="#f7a1b8"/>'
        # downward arrow
        '<path d="M646 250 V400 M610 366 L646 404 L682 366" stroke="#ef6f6c" '
        'stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
    )


# ---------------------------------------------------------------- 数学简单
def shuxuejiandan() -> str:
    """A worksheet of easy sums, all ticked, with a smiling pencil alongside."""
    # digits are drawn as strokes, not <text>, so the rule "no text" holds -
    # but sums would still be "text-like", so we show ticks and counting dots.
    def tick(x, y, s=1.0):
        return (
            f'<path d="M{x} {y} l{14*s} {16*s} l{26*s} {-34*s}" stroke="#3fa34d" '
            f'stroke-width="{9*s}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
        )

    def dots(x, y, n, fill):
        return "".join(
            f'<circle cx="{x + i*26}" cy="{y}" r="9" fill="{fill}"/>' for i in range(n)
        )

    rows = ""
    specs = [(0, 2, 1, "#4f7fff"), (1, 1, 2, "#ff8c42"), (2, 3, 1, "#7bc96f"), (3, 2, 2, "#ef6f6c")]
    for i, (idx, a, b, colour) in enumerate(specs):
        y = 212 + idx * 74
        rows += dots(196, y, a, colour)
        rows += f'<path d="M{196+a*26+16} {y} h26 M{196+a*26+29} {y-13} v26" stroke="#8a97ad" stroke-width="6" stroke-linecap="round"/>'
        rows += dots(196 + a * 26 + 58, y, b, colour)
        rows += f'<path d="M420 {y-9} h34 M420 {y+9} h34" stroke="#8a97ad" stroke-width="6" stroke-linecap="round"/>'
        rows += dots(482, y, a + b, colour)
        rows += tick(600, y - 4, 1.0)

    return svg(
        '<ellipse cx="400" cy="560" rx="270" ry="22" fill="#dfe4ee"/>'
        # paper
        '<rect x="140" y="96" width="520" height="452" rx="10" fill="#ffffff" stroke="#c9d3e3" stroke-width="4"/>'
        '<rect x="140" y="96" width="520" height="54" rx="10" fill="#eef3fb"/>'
        '<circle cx="176" cy="123" r="9" fill="#c9d3e3"/>'
        '<circle cx="204" cy="123" r="9" fill="#c9d3e3"/>'
        + rows +
        # a big happy smiley where a grade would go
        '<circle cx="580" cy="480" r="44" fill="#ffd166" stroke="#e0ab3c" stroke-width="4"/>'
        '<circle cx="564" cy="468" r="6" fill="#1f2937"/>'
        '<circle cx="596" cy="468" r="6" fill="#1f2937"/>'
        '<path d="M556 492 Q580 514 604 492" stroke="#1f2937" stroke-width="5" fill="none" stroke-linecap="round"/>'
        # pencil resting on the page
        '<g transform="rotate(-24 250 486)">'
        '<rect x="180" y="470" width="150" height="30" fill="#ffd166" stroke="#e0ab3c" stroke-width="3"/>'
        '<polygon points="330,470 372,485 330,500" fill="#f2d5b3" stroke="#e0ab3c" stroke-width="3"/>'
        '<polygon points="360,481 372,485 360,489" fill="#1f2937"/>'
        '<rect x="156" y="470" width="24" height="30" fill="#ef6f6c" stroke="#c95552" stroke-width="3"/>'
        '</g>'
    )


# ---------------------------------------------------------------- 泡泡
def paopao() -> str:
    """A child blowing a stream of soap bubbles from a bubble wand."""
    def bubble(cx, cy, r, op=0.95):
        return (
            f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#bfe6fb" fill-opacity="0.45" '
            f'stroke="#7ec8f2" stroke-width="3" opacity="{op}"/>'
            f'<circle cx="{cx - r*0.35:.0f}" cy="{cy - r*0.38:.0f}" r="{max(3, r*0.2):.0f}" fill="#ffffff" opacity="{op}"/>'
            f'<path d="M{cx + r*0.1:.0f} {cy + r*0.62:.0f} a{r*0.6:.0f} {r*0.6:.0f} 0 0 0 {r*0.55:.0f} {-r*0.42:.0f}" '
            f'stroke="#ffffff" stroke-width="2.5" fill="none" opacity="{op*0.8:.2f}"/>'
        )

    bubbles = (
        bubble(468, 296, 26) + bubble(496, 208, 44) + bubble(566, 274, 24)
        + bubble(592, 160, 54) + bubble(660, 250, 34) + bubble(690, 118, 26)
        + bubble(476, 108, 32) + bubble(714, 330, 44) + bubble(628, 386, 22)
        + bubble(540, 350, 18) + bubble(392, 170, 20) + bubble(742, 210, 18)
    )
    return svg(
        '<rect x="0" y="0" width="800" height="470" fill="#dbe7ff"/>'
        '<circle cx="90" cy="92" r="38" fill="#ffd166"/>'
        '<ellipse cx="640" cy="470" rx="260" ry="54" fill="#b9dcb0"/>'
        '<rect x="0" y="470" width="800" height="130" fill="#9ccc8c"/>'
        # child, facing right
        '<path d="M150 322 H268 L286 560 H132 Z" fill="#ef6f6c"/>'          # torso
        '<path d="M150 560 H196 V596 H150 Z" fill="#3a63cc"/>'
        '<path d="M224 560 H270 V596 H224 Z" fill="#3a63cc"/>'
        '<ellipse cx="172" cy="596" rx="30" ry="13" fill="#2f3b52"/>'
        '<ellipse cx="248" cy="596" rx="30" ry="13" fill="#2f3b52"/>'
        # arm raised holding the wand
        '<path d="M262 356 L344 330 L354 360 L272 386 Z" fill="#ef6f6c"/>'
        '<circle cx="358" cy="346" r="18" fill="#f7c9a6"/>'
        # bubble wand: handle + ring, held out clear of the face
        '<path d="M364 338 L404 322" stroke="#8a97ad" stroke-width="10" stroke-linecap="round"/>'
        '<circle cx="424" cy="314" r="27" fill="#bfe6fb" fill-opacity="0.35" stroke="#8a97ad" stroke-width="7"/>'
        + head(200, 258, 56)
        + eyes_open(212, 252, 18, 6) +
        # cheeks puffed, lips pursed blowing
        '<circle cx="176" cy="288" r="14" fill="#f4a8a0" opacity="0.7"/>'
        '<circle cx="246" cy="286" r="12" fill="#f4a8a0" opacity="0.7"/>'
        '<circle cx="249" cy="294" r="8" fill="#8c2f39"/>'
        + bubbles
    )


# ---------------------------------------------------------------- 不敢挖
def buganwa() -> str:
    """A child holding a spade, hands back, hesitating over a hole in the sand."""
    return svg(
        '<rect x="0" y="0" width="800" height="392" fill="#dbe7ff"/>'
        '<circle cx="118" cy="92" r="40" fill="#ffd166"/>'
        '<ellipse cx="400" cy="392" rx="460" ry="54" fill="#efdcb8"/>'
        '<rect x="0" y="392" width="800" height="208" fill="#e6cf9f"/>'
        # the hole the child will not dig, with a mound of sand beside it
        '<ellipse cx="596" cy="484" rx="126" ry="46" fill="#b99a63"/>'
        '<ellipse cx="596" cy="492" rx="102" ry="34" fill="#6e5836"/>'
        '<ellipse cx="596" cy="500" rx="74" ry="22" fill="#4a3a22"/>'
        '<path d="M700 470 Q744 430 788 462 Q744 482 700 470 Z" fill="#d8bd86"/>'
        # something unsettling poking out - a pair of eyes in the dark
        '<circle cx="574" cy="498" r="7" fill="#ffd166"/>'
        '<circle cx="614" cy="498" r="7" fill="#ffd166"/>'
        # the child, leaning away, spade held out at arm's length
        '<path d="M196 328 H312 L330 552 H178 Z" fill="#7bc96f"/>'            # torso, leaning back
        '<path d="M204 552 H250 V594 H204 Z" fill="#3a63cc"/>'
        '<path d="M276 552 H322 V594 H276 Z" fill="#3a63cc"/>'
        '<ellipse cx="226" cy="594" rx="31" ry="13" fill="#2f3b52"/>'
        '<ellipse cx="300" cy="594" rx="31" ry="13" fill="#2f3b52"/>'
        # arm extended forward, holding spade away from the body
        '<path d="M302 352 L400 372 L396 402 L298 384 Z" fill="#7bc96f"/>'
        '<circle cx="408" cy="388" r="19" fill="#f7c9a6"/>'
        # spade, held limply, pointing down but not touching
        '<path d="M414 380 L446 448" stroke="#b9803e" stroke-width="13" stroke-linecap="round"/>'
        '<path d="M424 444 L484 444 L470 496 L438 496 Z" fill="#b8c2cf" stroke="#8a97ad" stroke-width="4" stroke-linejoin="round"/>'
        # other arm raised in a "no" gesture
        '<path d="M198 342 L142 288 L118 312 L172 368 Z" fill="#7bc96f"/>'
        '<circle cx="128" cy="298" r="19" fill="#f7c9a6"/>'
        + head(252, 264, 56)
        + eyes_wide(258, 258, 20) +
        # worried brows + flat, hesitant mouth
        '<path d="M224 224 L256 214 M286 216 L314 228" stroke="#1f2937" stroke-width="5" stroke-linecap="round"/>'
        '<path d="M232 302 Q258 288 286 302" stroke="#1f2937" stroke-width="5" fill="none" stroke-linecap="round"/>'
        + sweat(196, 236, 1.2) + sweat(318, 244, 1.1)
    )


# ---------------------------------------------------------------- 痛
def tong() -> str:
    """A child standing with a bandaged, throbbing knee, wincing and pointing at it."""
    return svg(
        '<rect x="0" y="0" width="800" height="424" fill="#dbe7ff"/>'
        '<circle cx="694" cy="96" r="40" fill="#ffd166"/>'
        '<ellipse cx="400" cy="424" rx="440" ry="52" fill="#b9dcb0"/>'
        '<rect x="0" y="424" width="800" height="176" fill="#9ccc8c"/>'
        # gravel where they tripped
        '<circle cx="656" cy="524" r="7" fill="#b0b8c4"/>'
        '<circle cx="692" cy="552" r="5" fill="#b0b8c4"/>'
        '<circle cx="140" cy="544" r="6" fill="#b0b8c4"/>'
        '<circle cx="176" cy="520" r="4" fill="#b0b8c4"/>'
        # --- two straight legs, side by side; shorts end above the knees
        '<path d="M330 400 H386 V470 H330 Z" fill="#f7c9a6"/>'
        '<path d="M414 400 H470 V470 H414 Z" fill="#f7c9a6"/>'
        '<path d="M334 470 H386 V548 H334 Z" fill="#f7c9a6"/>'
        '<path d="M414 470 H466 V548 H414 Z" fill="#f7c9a6"/>'
        '<ellipse cx="360" cy="556" rx="33" ry="15" fill="#2f3b52"/>'
        '<ellipse cx="440" cy="556" rx="33" ry="15" fill="#2f3b52"/>'
        # shorts
        '<path d="M320 336 H480 L476 406 H414 V396 H386 V406 H324 Z" fill="#3a63cc"/>'
        # --- torso
        '<path d="M330 214 H470 L482 344 H318 Z" fill="#4f7fff"/>'
        # --- the hurt knee: bandaged plaster cross on the left knee
        '<circle cx="358" cy="470" r="30" fill="#f2b48c"/>'
        '<rect x="330" y="458" width="56" height="24" rx="6" fill="#ffe8d2" stroke="#e0ab84" stroke-width="3"/>'
        '<rect x="346" y="442" width="24" height="56" rx="6" fill="#ffe8d2" stroke="#e0ab84" stroke-width="3"/>'
        '<rect x="346" y="458" width="24" height="24" fill="#ef6f6c"/>'
        # pain radiating from that knee only
        '<path d="M300 436 L266 412 M292 470 L250 470 M300 506 L266 530" '
        'stroke="#ef6f6c" stroke-width="10" stroke-linecap="round"/>'
        '<path d="M406 440 L436 418" stroke="#ef6f6c" stroke-width="10" stroke-linecap="round"/>'
        # --- arms: one pointing down at the sore knee, one clenched at the side
        '<path d="M330 244 L286 352 L322 368 L360 262 Z" fill="#4f7fff"/>'
        '<circle cx="312" cy="382" r="20" fill="#f7c9a6"/>'
        '<path d="M470 244 L506 340 L470 354 L436 258 Z" fill="#4f7fff"/>'
        '<circle cx="486" cy="362" r="20" fill="#f7c9a6"/>'
        # --- head, wincing
        + head(400, 146, 58)
        + '<path d="M362 140 Q378 158 394 140" stroke="#1f2937" stroke-width="6" fill="none" stroke-linecap="round"/>'
        '<path d="M408 140 Q424 158 440 140" stroke="#1f2937" stroke-width="6" fill="none" stroke-linecap="round"/>'
        '<path d="M354 110 L390 120 M412 120 L448 110" stroke="#1f2937" stroke-width="5" stroke-linecap="round"/>'
        '<ellipse cx="401" cy="186" rx="19" ry="15" fill="#8c2f39"/>'
        '<path d="M386 182 Q401 174 416 182" stroke="#ffffff" stroke-width="6" fill="none"/>'
        + sweat(346, 176, 1.1)
    )


# ---------------------------------------------------------------- 结果
def jieguo() -> str:
    """Cause and effect: a watered seedling becomes a tree bearing fruit."""
    def arrow(x, y, w=64):
        return (
            f'<path d="M{x} {y} h{w}" stroke="#8a97ad" stroke-width="12" stroke-linecap="round"/>'
            f'<path d="M{x+w-22} {y-22} L{x+w+10} {y} L{x+w-22} {y+22}" stroke="#8a97ad" '
            'stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
        )

    return svg(
        '<rect x="0" y="0" width="800" height="430" fill="#dbe7ff"/>'
        '<circle cx="716" cy="84" r="38" fill="#ffd166"/>'
        '<rect x="0" y="430" width="800" height="170" fill="#c9a97a"/>'
        '<rect x="0" y="430" width="800" height="12" fill="#9ccc8c"/>'
        # --- stage 1: a seed in the soil being watered
        '<ellipse cx="128" cy="470" rx="82" ry="20" fill="#a98a5f"/>'
        '<ellipse cx="128" cy="430" rx="14" ry="19" fill="#8b5e3c"/>'
        '<path d="M128 412 V374" stroke="#5fb85a" stroke-width="7" stroke-linecap="round"/>'
        '<path d="M128 386 Q102 366 96 342 Q126 346 128 382 Z" fill="#7bc96f"/>'
        '<path d="M128 392 Q156 374 164 350 Q132 352 128 390 Z" fill="#5fb85a"/>'
        # watering can tipped over it
        '<rect x="38" y="222" width="96" height="70" rx="10" fill="#7ec8f2" stroke="#3aa0d8" stroke-width="4"/>'
        '<path d="M134 240 L196 214 L206 236 L140 266 Z" fill="#7ec8f2" stroke="#3aa0d8" stroke-width="4" stroke-linejoin="round"/>'
        '<path d="M52 222 Q86 176 126 222" fill="none" stroke="#3aa0d8" stroke-width="10" stroke-linecap="round"/>'
        '<path d="M176 250 L156 300 M196 244 L188 296 M158 258 L130 302" '
        'stroke="#7ec8f2" stroke-width="7" stroke-linecap="round"/>'
        + arrow(238, 360, 70) +
        # --- stage 2: the grown tree, heavy with fruit (the RESULT)
        '<ellipse cx="546" cy="476" rx="180" ry="26" fill="#a98a5f"/>'
        '<rect x="522" y="330" width="48" height="146" rx="8" fill="#8b5e3c"/>'
        '<path d="M546 400 L494 358 M546 372 L600 334" stroke="#8b5e3c" stroke-width="14" stroke-linecap="round"/>'
        '<circle cx="546" cy="248" r="104" fill="#5fb85a"/>'
        '<circle cx="452" cy="296" r="70" fill="#7bc96f"/>'
        '<circle cx="642" cy="296" r="70" fill="#7bc96f"/>'
        '<circle cx="546" cy="322" r="66" fill="#5fb85a"/>'
        # the fruit
        '<circle cx="486" cy="262" r="21" fill="#ef6f6c" stroke="#c9403d" stroke-width="3"/>'
        '<circle cx="596" cy="236" r="21" fill="#ef6f6c" stroke="#c9403d" stroke-width="3"/>'
        '<circle cx="540" cy="184" r="19" fill="#ef6f6c" stroke="#c9403d" stroke-width="3"/>'
        '<circle cx="452" cy="330" r="19" fill="#ef6f6c" stroke="#c9403d" stroke-width="3"/>'
        '<circle cx="648" cy="322" r="19" fill="#ef6f6c" stroke="#c9403d" stroke-width="3"/>'
        '<circle cx="562" cy="300" r="18" fill="#ef6f6c" stroke="#c9403d" stroke-width="3"/>'
        # one fallen fruit on the ground
        '<circle cx="676" cy="462" r="18" fill="#ef6f6c" stroke="#c9403d" stroke-width="3"/>'
        '<path d="M676 444 V434" stroke="#5a3d22" stroke-width="5" stroke-linecap="round"/>'
    )


IMAGES = {
    "漫画": manhua,
    "吓得逃走": xiadetaozou,
    "冒出冷汗": maochulenghan,
    "掉": diao,
    "数学简单": shuxuejiandan,
    "泡泡": paopao,
    "不敢挖": buganwa,
    "痛": tong,
    "结果": jieguo,
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
