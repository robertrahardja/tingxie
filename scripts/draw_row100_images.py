#!/usr/bin/env python3
"""
Draw the in-house illustrations for tingxie row 100 as flat SVG scenes and
render them to public/images/<word>.png (800x600).

Deliberately contains NO text: the pictures are memory cues for a dictation
test, so the word being tested must never appear in the picture.

Usage:
    python3 scripts/draw_row100_images.py
"""

import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from draw_row98_images import SKIN, ROOT, OUT, W, H, svg  # noqa: E402
from draw_row99_images import kid, GROUND, SKY  # noqa: E402


def diaoyu() -> str:
    """A child on a pond bank holding a rod, fish on the line."""
    return svg(
        SKY + '<rect x="0" y="380" width="800" height="220" fill="#7ec8f2"/>'
        '<rect x="0" y="360" width="330" height="240" fill="#b9dcb0"/>'
        '<path d="M300 60 Q500 40 600 130" stroke="#6b4a2b" stroke-width="7" fill="none" stroke-linecap="round"/>'
        '<path d="M600 130 V380" stroke="#1f2937" stroke-width="3"/>'
        '<ellipse cx="600" cy="420" rx="46" ry="26" fill="#f4a261" stroke="#1f2937" stroke-width="4"/>'
        '<path d="M644 420 L682 396 L682 444 Z" fill="#f4a261" stroke="#1f2937" stroke-width="4" stroke-linejoin="round"/>'
        '<circle cx="574" cy="414" r="5" fill="#1f2937"/>'
        '<path d="M520 470 Q560 490 600 470 M630 500 Q670 520 710 500" stroke="#ffffff" stroke-width="5" fill="none" stroke-linecap="round"/>'
        + kid(190, 140, "#4aa3df", arm_up=False)
        + f'<path d="M224 226 L300 60" stroke="{SKIN}" stroke-width="14" stroke-linecap="round"/>'
    )


def wanshua() -> str:
    """Two children playing catch with a ball in a park."""
    return svg(
        SKY + GROUND + '<circle cx="690" cy="90" r="40" fill="#ffd166"/>'
        + kid(190, 170, "#ef6f6c", arm_up=True)
        + '<g transform="translate(800,0) scale(-1,1)">' + kid(190, 170, "#4aa3df", arm_up=True) + '</g>'
        + '<circle cx="400" cy="120" r="26" fill="#ffffff" stroke="#1f2937" stroke-width="4"/>'
        '<path d="M380 108 Q400 120 420 108 M382 134 Q400 120 418 134" stroke="#ef6f6c" stroke-width="4" fill="none"/>'
        '<path d="M300 150 Q350 90 372 108 M500 150 Q450 90 428 108" stroke="#1f2937" stroke-width="3" fill="none" stroke-dasharray="6 8"/>'
    )


def qiangruo() -> str:
    """A big strong figure lifting a barbell beside a small thin one."""
    return svg(
        SKY.replace('height="470"', 'height="500"') + GROUND.replace('y="470"', 'y="500"')
        # strong
        + '<rect x="190" y="300" width="130" height="190" rx="36" fill="#ef6f6c"/>'
        '<rect x="196" y="480" width="44" height="60" rx="10" fill="#3b4a7a"/><rect x="270" y="480" width="44" height="60" rx="10" fill="#3b4a7a"/>'
        f'<circle cx="255" cy="250" r="62" fill="{SKIN}"/>'
        '<path d="M193 244 A62 62 0 0 1 317 244 Z" fill="#3b2a20"/>'
        '<circle cx="236" cy="256" r="7" fill="#1f2937"/><circle cx="274" cy="256" r="7" fill="#1f2937"/>'
        '<path d="M236 284 Q255 298 274 284" stroke="#1f2937" stroke-width="4" fill="none" stroke-linecap="round"/>'
        f'<path d="M200 330 L140 220 M310 330 L370 220" stroke="{SKIN}" stroke-width="34" stroke-linecap="round"/>'
        '<rect x="90" y="196" width="320" height="14" rx="6" fill="#4b5563"/>'
        '<rect x="80" y="160" width="26" height="86" rx="6" fill="#1f2937"/><rect x="394" y="160" width="26" height="86" rx="6" fill="#1f2937"/>'
        # weak
        + '<rect x="560" y="400" width="44" height="100" rx="14" fill="#4aa3df"/>'
        '<rect x="562" y="490" width="14" height="50" rx="5" fill="#3b4a7a"/><rect x="588" y="490" width="14" height="50" rx="5" fill="#3b4a7a"/>'
        f'<circle cx="582" cy="364" r="34" fill="{SKIN}"/><path d="M548 360 A34 34 0 0 1 616 360 Z" fill="#3b2a20"/>'
        '<circle cx="570" cy="370" r="4" fill="#1f2937"/><circle cx="594" cy="370" r="4" fill="#1f2937"/>'
        '<path d="M570 388 Q582 380 594 388" stroke="#1f2937" stroke-width="3" fill="none" stroke-linecap="round"/>'
        f'<path d="M562 420 L540 470 M602 420 L624 470" stroke="{SKIN}" stroke-width="9" stroke-linecap="round"/>'
        '<path d="M630 330 Q650 350 640 372" stroke="#7ec8f2" stroke-width="5" fill="none" stroke-linecap="round"/>'
    )


def youshi() -> str:
    """Solid footsteps along a path that stop; the rest is only dashed outlines."""
    dots = "".join(
        f'<circle cx="{x}" cy="{y}" r="22" fill="#2f9e5b" stroke="#1f2937" stroke-width="3"/>'
        for x, y in [(130, 420), (230, 360), (330, 320)]
    )
    ghost = "".join(
        f'<circle cx="{x}" cy="{y}" r="22" fill="none" stroke="#9aa3b2" stroke-width="4" stroke-dasharray="6 7"/>'
        for x, y in [(430, 310), (530, 290), (630, 270)]
    )
    return svg(
        '<path d="M100 440 L700 240" stroke="#e5e7eb" stroke-width="70" stroke-linecap="round"/>'
        + dots + ghost
        + '<rect x="108" y="150" width="8" height="70" fill="#6b7280"/><path d="M116 150 L180 172 L116 194 Z" fill="#2f9e5b" stroke="#1f2937" stroke-width="3"/>'
        '<rect x="690" y="150" width="8" height="70" fill="#9aa3b2"/><path d="M698 150 L762 172 L698 194 Z" fill="none" stroke="#9aa3b2" stroke-width="4" stroke-dasharray="6 6"/>'
        f'<circle cx="330" cy="260" r="30" fill="{SKIN}"/><path d="M300 254 A30 30 0 0 1 360 254 Z" fill="#3b2a20"/>'
        '<path d="M318 272 Q330 264 342 272" stroke="#1f2937" stroke-width="3" fill="none" stroke-linecap="round"/>'
        '<circle cx="322" cy="262" r="3" fill="#1f2937"/><circle cx="340" cy="262" r="3" fill="#1f2937"/>'
    )


def bantu() -> str:
    """A hiker resting on a rock halfway up a mountain, summit flag far above."""
    return svg(
        SKY + '<path d="M60 560 L400 100 L740 560 Z" fill="#8b9a7b" stroke="#1f2937" stroke-width="5" stroke-linejoin="round"/>'
        '<path d="M345 175 L400 100 L455 175 Q430 190 400 170 Q370 190 345 175 Z" fill="#ffffff"/>'
        '<rect x="397" y="52" width="6" height="50" fill="#6b7280"/><path d="M403 52 L450 68 L403 84 Z" fill="#ef6f6c"/>'
        '<path d="M120 500 Q300 440 250 330" stroke="#e5e7eb" stroke-width="22" fill="none" stroke-linecap="round"/>'
        '<ellipse cx="270" cy="360" rx="60" ry="34" fill="#9aa3b2" stroke="#1f2937" stroke-width="4"/>'
        '<rect x="248" y="290" width="48" height="66" rx="14" fill="#4aa3df"/>'
        f'<circle cx="272" cy="262" r="30" fill="{SKIN}"/><path d="M242 258 A30 30 0 0 1 302 258 Z" fill="#3b2a20"/>'
        '<circle cx="262" cy="268" r="3" fill="#1f2937"/><circle cx="282" cy="268" r="3" fill="#1f2937"/>'
        '<path d="M262 284 Q272 278 282 284" stroke="#1f2937" stroke-width="3" fill="none" stroke-linecap="round"/>'
        '<path d="M300 232 Q310 244 304 258" stroke="#7ec8f2" stroke-width="5" fill="none" stroke-linecap="round"/>'
        '<rect x="226" y="350" width="22" height="50" rx="8" fill="#3b4a7a"/><rect x="290" y="350" width="22" height="50" rx="8" fill="#3b4a7a"/>'
    )


def nongfu() -> str:
    """Farmer in straw hat hoeing a field of green rows."""
    rows = "".join(f'<path d="M0 {y} Q400 {y-20} 800 {y}" stroke="#7a5230" stroke-width="12" fill="none"/>' for y in (470, 520, 570))
    sprouts = "".join(
        f'<path d="M{x} {y} V{y-26} M{x} {y-12} L{x-10} {y-26} M{x} {y-12} L{x+10} {y-26}" stroke="#2f9e5b" stroke-width="5" fill="none" stroke-linecap="round"/>'
        for x in range(60, 760, 90) for y in (462, 512, 562)
    )
    return svg(
        SKY + '<rect y="440" width="800" height="160" fill="#c49a6c"/>' + '<circle cx="680" cy="90" r="46" fill="#ffd166"/>'
        + rows + sprouts
        + '<rect x="330" y="340" width="26" height="100" rx="8" fill="#3b4a7a"/><rect x="376" y="340" width="26" height="100" rx="8" fill="#3b4a7a"/>'
        '<rect x="318" y="230" width="94" height="130" rx="26" fill="#f4a261"/>'
        f'<circle cx="365" cy="190" r="40" fill="{SKIN}"/>'
        '<path d="M300 186 Q365 110 430 186 Z" fill="#e9c46a" stroke="#1f2937" stroke-width="4" stroke-linejoin="round"/>'
        '<circle cx="352" cy="196" r="4" fill="#1f2937"/><circle cx="378" cy="196" r="4" fill="#1f2937"/>'
        '<path d="M352 212 Q365 222 378 212" stroke="#1f2937" stroke-width="3" fill="none" stroke-linecap="round"/>'
        f'<path d="M400 260 L480 330" stroke="{SKIN}" stroke-width="16" stroke-linecap="round"/>'
        '<path d="M470 190 L520 450" stroke="#6b4a2b" stroke-width="10" stroke-linecap="round"/>'
        '<path d="M498 440 L560 436 L548 470 L510 468 Z" fill="#6b7280" stroke="#1f2937" stroke-width="4" stroke-linejoin="round"/>'
    )


def nian() -> str:
    """A child reading an open book aloud, sound arcs from the mouth."""
    return svg(
        '<rect x="0" y="470" width="800" height="130" fill="#e8dcc8"/>'
        '<path d="M170 470 L400 420 L630 470 L630 500 L170 500 Z" fill="#c08a58" stroke="#1f2937" stroke-width="4"/>'
        '<path d="M200 400 L400 430 L400 340 L200 310 Z" fill="#ffffff" stroke="#1f2937" stroke-width="4" stroke-linejoin="round"/>'
        '<path d="M600 400 L400 430 L400 340 L600 310 Z" fill="#fff4d6" stroke="#1f2937" stroke-width="4" stroke-linejoin="round"/>'
        '<path d="M230 330 L370 352 M230 352 L370 374 M230 374 L370 396 M430 352 L570 330 M430 374 L570 352" stroke="#cbd5e1" stroke-width="6" stroke-linecap="round"/>'
        '<rect x="350" y="230" width="100" height="110" rx="26" fill="#ef6f6c"/>'
        f'<circle cx="400" cy="170" r="56" fill="{SKIN}"/><path d="M344 164 A56 56 0 0 1 456 164 Z" fill="#3b2a20"/>'
        '<circle cx="380" cy="182" r="6" fill="#1f2937"/><circle cx="420" cy="182" r="6" fill="#1f2937"/>'
        '<ellipse cx="400" cy="212" rx="12" ry="14" fill="#8b2c2c"/>'
        '<path d="M486 190 Q512 212 486 234 M510 176 Q552 212 510 248 M534 162 Q592 212 534 262" stroke="#4aa3df" stroke-width="6" fill="none" stroke-linecap="round"/>'
    )


def chuan() -> str:
    """Three kids passing a ball along a line (pass on)."""
    return svg(
        SKY + GROUND
        + kid(140, 200, "#ef6f6c", arm_up=True)
        + kid(400, 200, "#4aa3df", arm_up=False)
        + kid(660, 200, "#f4a261", arm_up=False)
        + '<circle cx="270" cy="150" r="26" fill="#ffffff" stroke="#1f2937" stroke-width="4"/>'
        '<path d="M250 138 Q270 150 290 138 M252 164 Q270 150 288 164" stroke="#ef6f6c" stroke-width="4" fill="none"/>'
        '<path d="M430 140 Q520 70 640 130" stroke="#1f2937" stroke-width="4" fill="none" stroke-dasharray="8 8"/>'
        '<path d="M628 108 L650 134 L618 142" stroke="#1f2937" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
    )


IMAGES = {
    "钓鱼": diaoyu,
    "玩耍": wanshua,
    "强弱": qiangruo,
    "有始无终": youshi,
    "半途而废": bantu,
    "农夫劳动": nongfu,
    "念": nian,
    "传": chuan,
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
