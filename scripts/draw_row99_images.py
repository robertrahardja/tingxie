#!/usr/bin/env python3
"""
Draw the in-house illustrations for tingxie row 99 as flat SVG scenes and
render them to public/images/<word>.png (800x600).

Deliberately contains NO text: the pictures are memory cues for a dictation
test, so the word being tested must never appear in the picture.

Usage:
    python3 scripts/draw_row99_images.py
"""

import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from draw_row98_images import HAIR, SKIN, ROOT, OUT, W, H, svg, head, eyes_open  # noqa: E402

INK = "#1f2937"


def smile(cx: int, cy: int, w: int = 14) -> str:
    return f'<path d="M{cx-w} {cy} Q{cx} {cy+w} {cx+w} {cy}" stroke="{INK}" stroke-width="3" fill="none" stroke-linecap="round"/>'


def kid(cx: int, cy: int, shirt: str, arm_up: bool = False) -> str:
    """Head + torso + legs; optional raised right arm (waving)."""
    arm = (
        f'<path d="M{cx+34} {cy+86} L{cx+78} {cy+30}" stroke="{SKIN}" stroke-width="16" stroke-linecap="round"/>'
        f'<circle cx="{cx+80}" cy="{cy+26}" r="12" fill="{SKIN}"/>'
        if arm_up else
        f'<path d="M{cx+34} {cy+86} L{cx+44} {cy+150}" stroke="{SKIN}" stroke-width="16" stroke-linecap="round"/>'
    )
    return (
        f'<rect x="{cx-30}" y="{cy+170}" width="22" height="80" rx="8" fill="#3b4a7a"/>'
        f'<rect x="{cx+8}" y="{cy+170}" width="22" height="80" rx="8" fill="#3b4a7a"/>'
        f'<rect x="{cx-40}" y="{cy+60}" width="80" height="120" rx="22" fill="{shirt}"/>'
        f'<path d="M{cx-34} {cy+86} L{cx-44} {cy+150}" stroke="{SKIN}" stroke-width="16" stroke-linecap="round"/>'
        + arm + head(cx, cy) + eyes_open(cx, cy + 6) + smile(cx, cy + 24)
    )


GROUND = '<rect x="0" y="470" width="800" height="130" fill="#b9dcb0"/>'
SKY = '<rect width="800" height="470" fill="#dbe7ff"/>'


# ---------------------------------------------------------------- 打招呼
def dazhaohu() -> str:
    return svg(
        SKY + GROUND
        + '<circle cx="680" cy="90" r="40" fill="#ffd166"/>'
        + kid(230, 150, "#ef6f6c", arm_up=True)
        # second child faces left, waving back
        + '<g transform="translate(800,0) scale(-1,1)">' + kid(230, 150, "#4aa3df", arm_up=True) + '</g>'
        # small motion arcs by the waving hands
        + '<path d="M318 160 Q336 142 318 124 M334 164 Q358 142 334 114" stroke="#1f2937" stroke-width="4" fill="none" stroke-linecap="round"/>'
        + '<path d="M482 160 Q464 142 482 124 M466 164 Q442 142 466 114" stroke="#1f2937" stroke-width="4" fill="none" stroke-linecap="round"/>'
    )


# ---------------------------------------------------------------- 缩手
def suoshou() -> str:
    """A hand snatching back from a hot kettle: steam, flame, motion lines."""
    return svg(
        '<rect x="0" y="440" width="800" height="160" fill="#e8dcc8"/>'
        # stove + kettle
        '<rect x="420" y="420" width="300" height="40" rx="8" fill="#6b7280"/>'
        '<path d="M450 420 Q440 300 540 290 Q640 300 630 420 Z" fill="#c0c7d1" stroke="#1f2937" stroke-width="5"/>'
        '<path d="M630 350 Q690 330 700 290" stroke="#1f2937" stroke-width="14" fill="none" stroke-linecap="round"/>'
        '<rect x="505" y="270" width="70" height="26" rx="10" fill="#9aa3b2" stroke="#1f2937" stroke-width="4"/>'
        # flame
        '<path d="M500 460 Q520 420 540 440 Q560 400 580 460 Z" fill="#ff8c42"/>'
        # steam
        '<path d="M520 250 Q500 220 520 190 Q540 160 520 130 M570 250 Q550 220 570 190 Q590 160 570 130" stroke="#ffffff" stroke-width="10" fill="none" stroke-linecap="round"/>'
        # arm recoiling to the left, with fingers
        f'<path d="M80 420 L270 330" stroke="{SKIN}" stroke-width="44" stroke-linecap="round"/>'
        f'<circle cx="300" cy="318" r="34" fill="{SKIN}"/>'
        f'<path d="M318 292 L352 270 M326 312 L366 300 M324 332 L360 336" stroke="{SKIN}" stroke-width="13" stroke-linecap="round"/>'
        '<path d="M60 420 L30 400 M60 400 L20 372 M60 440 L22 440" stroke="#1f2937" stroke-width="6" stroke-linecap="round"/>'
        # alarm sparks at the hand
        '<path d="M370 250 L388 224 M400 280 L430 270 M372 214 L360 190" stroke="#ef6f6c" stroke-width="7" stroke-linecap="round"/>'
    )


# ---------------------------------------------------------------- 人人有责
def renrenyouze() -> str:
    """Four people, every one picking up litter around a bin."""
    def helper(cx, shirt):
        return (
            f'<rect x="{cx-20}" y="400" width="14" height="58" rx="6" fill="#3b4a7a"/>'
            f'<rect x="{cx+6}" y="400" width="14" height="58" rx="6" fill="#3b4a7a"/>'
            f'<rect x="{cx-28}" y="330" width="56" height="84" rx="16" fill="{shirt}"/>'
            f'<path d="M{cx+20} 350 L{cx+46} 420" stroke="{SKIN}" stroke-width="12" stroke-linecap="round"/>'
            f'<rect x="{cx+36}" y="416" width="18" height="22" rx="3" fill="#8b5e3c"/>'
            + head(cx, 296, 36) + eyes_open(cx, 300, 13, 4) + smile(cx, 314, 10)
        )
    return svg(
        SKY + GROUND
        + '<circle cx="90" cy="90" r="40" fill="#ffd166"/>'
        # scattered litter
        + '<rect x="130" y="500" width="22" height="14" fill="#e5e7eb" transform="rotate(20 140 506)"/>'
        '<circle cx="660" cy="520" r="9" fill="#9aa3b2"/><rect x="470" y="510" width="26" height="12" fill="#f4d35e" transform="rotate(-15 483 516)"/>'
        # bin in the middle
        '<rect x="365" y="380" width="70" height="90" rx="8" fill="#2f9e5b" stroke="#1f2937" stroke-width="4"/>'
        '<rect x="355" y="366" width="90" height="18" rx="6" fill="#23864a" stroke="#1f2937" stroke-width="4"/>'
        '<path d="M385 400 V450 M415 400 V450" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>'
        + helper(170, "#ef6f6c") + helper(290, "#4aa3df") + helper(510, "#f4a261") + helper(630, "#8e6bbf")
    )


# ---------------------------------------------------------------- 其中
def qizhong() -> str:
    """A group of apples; one circled in gold ("among them")."""
    def apple(x, y, c):
        return (
            f'<circle cx="{x}" cy="{y}" r="44" fill="{c}" stroke="#1f2937" stroke-width="4"/>'
            f'<path d="M{x} {y-42} Q{x+6} {y-62} {x+18} {y-66}" stroke="#5b3a1c" stroke-width="6" fill="none" stroke-linecap="round"/>'
            f'<ellipse cx="{x+22}" cy="{y-58}" rx="14" ry="7" fill="#5fb85a" transform="rotate(-25 {x+22} {y-58})"/>'
        )
    pos = [(200, 220), (330, 220), (460, 220), (590, 220), (200, 360), (330, 360), (460, 360), (590, 360)]
    out = "".join(apple(x, y, "#ef6f6c") for x, y in pos[:5] + pos[6:])
    out += apple(*pos[5], "#ffd166")
    return svg(
        '<rect x="90" y="110" width="620" height="340" rx="40" fill="#fff6e0" stroke="#1f2937" stroke-width="5" stroke-dasharray="14 10"/>'
        + out
        + '<circle cx="330" cy="360" r="66" fill="none" stroke="#2f9e5b" stroke-width="8"/>'
        '<path d="M330 430 L330 500" stroke="#2f9e5b" stroke-width="8" stroke-linecap="round"/>'
        '<path d="M306 476 L330 504 L354 476" stroke="#2f9e5b" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
    )


# ---------------------------------------------------------------- 信封
def xinfeng() -> str:
    return svg(
        '<ellipse cx="400" cy="500" rx="260" ry="24" fill="#dfe4ee"/>'
        '<rect x="130" y="170" width="540" height="320" rx="14" fill="#fff4d6" stroke="#1f2937" stroke-width="6"/>'
        '<path d="M130 184 L400 360 L670 184" stroke="#1f2937" stroke-width="6" fill="#ffe8a8" stroke-linejoin="round"/>'
        '<path d="M130 486 L300 340 M670 486 L500 340" stroke="#1f2937" stroke-width="5" stroke-linecap="round"/>'
        # red seal heart
        '<path d="M400 372 C380 340 340 360 400 410 C460 360 420 340 400 372 Z" fill="#ef4444" stroke="#1f2937" stroke-width="4" stroke-linejoin="round"/>'
        # stamp
        '<rect x="568" y="196" width="76" height="92" fill="#ffffff" stroke="#1f2937" stroke-width="4" stroke-dasharray="6 4"/>'
        '<circle cx="606" cy="232" r="16" fill="#4aa3df"/><rect x="584" y="258" width="44" height="16" fill="#f4a261"/>'
    )


# ---------------------------------------------------------------- 必须
def bixu() -> str:
    """A bold blue "must do" sign: exclamation mark above a seat-belt-wearing child."""
    return svg(
        '<rect x="388" y="330" width="24" height="200" fill="#9aa3b2"/>'
        '<circle cx="400" cy="210" r="150" fill="#2563eb" stroke="#1f2937" stroke-width="8"/>'
        '<circle cx="400" cy="210" r="124" fill="none" stroke="#ffffff" stroke-width="8"/>'
        '<rect x="380" y="116" width="40" height="118" rx="14" fill="#ffffff"/>'
        '<circle cx="400" cy="272" r="22" fill="#ffffff"/>'
    )


# ---------------------------------------------------------------- 印度
def yindu() -> str:
    """Taj Mahal: central dome, four minarets, reflecting pool, saffron-white-green sky bands."""
    def minaret(x):
        return (
            f'<rect x="{x-12}" y="230" width="24" height="220" fill="#fffdf6" stroke="#1f2937" stroke-width="4"/>'
            f'<path d="M{x-16} 230 Q{x} 196 {x+16} 230 Z" fill="#fffdf6" stroke="#1f2937" stroke-width="4"/>'
        )
    return svg(
        '<rect width="800" height="200" fill="#ff9933"/><rect y="200" width="800" height="200" fill="#ffffff"/>'
        '<rect y="400" width="800" height="200" fill="#138808"/>'
        '<circle cx="720" cy="100" r="16" fill="#ffffff" opacity="0.0"/>'
        + minaret(190) + minaret(610) + minaret(260) + minaret(540)
        + '<rect x="290" y="300" width="220" height="150" fill="#fffdf6" stroke="#1f2937" stroke-width="5"/>'
        '<path d="M310 300 Q400 140 490 300 Z" fill="#fffdf6" stroke="#1f2937" stroke-width="5"/>'
        '<path d="M400 140 V108" stroke="#1f2937" stroke-width="5" stroke-linecap="round"/>'
        '<path d="M356 450 V380 Q400 330 444 380 V450 Z" fill="#3b4a7a"/>'
        '<rect x="150" y="450" width="500" height="26" fill="#fffdf6" stroke="#1f2937" stroke-width="4"/>'
        '<rect x="330" y="476" width="140" height="110" fill="#7ec8f2" stroke="#1f2937" stroke-width="4"/>'
        # Ashoka-wheel-style blue ring in the white band, wordless
        '<circle cx="90" cy="300" r="36" fill="none" stroke="#1d3a8a" stroke-width="6"/>'
        '<path d="M90 264 V336 M54 300 H126 M64 274 L116 326 M116 274 L64 326" stroke="#1d3a8a" stroke-width="3"/>'
    )


# ---------------------------------------------------------------- 任务
def renwu() -> str:
    """A clipboard checklist with ticks, plus a pencil: a task to complete."""
    rows = "".join(
        f'<rect x="228" y="{y}" width="34" height="34" rx="6" fill="#ffffff" stroke="#1f2937" stroke-width="4"/>'
        f'<path d="M234 {y+18} L244 {y+28} L260 {y+6}" stroke="{"#2f9e5b" if done else "none"}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
        f'<rect x="288" y="{y+10}" width="{w}" height="14" rx="7" fill="#cbd5e1"/>'
        for y, w, done in [(210, 230, True), (284, 190, True), (358, 250, False), (432, 170, False)]
    )
    return svg(
        '<ellipse cx="400" cy="560" rx="250" ry="20" fill="#dfe4ee"/>'
        '<rect x="170" y="90" width="400" height="470" rx="24" fill="#c08a58" stroke="#1f2937" stroke-width="6"/>'
        '<rect x="196" y="140" width="348" height="394" rx="10" fill="#fffdf6" stroke="#1f2937" stroke-width="4"/>'
        '<rect x="300" y="68" width="140" height="64" rx="16" fill="#9aa3b2" stroke="#1f2937" stroke-width="5"/>'
        '<circle cx="370" cy="100" r="12" fill="#ffffff" stroke="#1f2937" stroke-width="3"/>'
        + rows
        # pencil
        + '<g transform="rotate(35 640 420)"><rect x="610" y="260" width="44" height="240" fill="#ffd166" stroke="#1f2937" stroke-width="4"/>'
        '<path d="M610 500 L632 548 L654 500 Z" fill="#f7c9a6" stroke="#1f2937" stroke-width="4" stroke-linejoin="round"/>'
        '<path d="M624 530 L632 548 L640 530 Z" fill="#1f2937"/>'
        '<rect x="610" y="236" width="44" height="30" fill="#ef6f6c" stroke="#1f2937" stroke-width="4"/></g>'
    )


IMAGES = {
    "打招呼": dazhaohu,
    "缩手": suoshou,
    "人人有责": renrenyouze,
    "其中": qizhong,
    "信封": xinfeng,
    "必须": bixu,
    "印度": yindu,
    "任务": renwu,
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
