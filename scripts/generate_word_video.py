#!/usr/bin/env python3
"""
Generate animated videos that illustrate Chinese vocabulary word meanings.

This script creates 4-second animated videos with:
- Visual representation of the word's meaning
- Sparkle/particle effects
- Counting audio (1, 2, 3!)
- Final frame with word label

Usage:
    python generate_word_video.py --word "绿豆" --english "mung bean" --output output.mp4
    python generate_word_video.py --from-json path/to/vocabulary.json --row 78 --index 0
"""

import argparse
import json
import math
import os
import random
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Optional

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# Video settings
WIDTH = 1920
HEIGHT = 1080
FPS = 30
DURATION = 4  # seconds
TOTAL_FRAMES = FPS * DURATION


@dataclass
class WordAnimation:
    """Configuration for a word's animation."""
    word: str
    english: str
    pinyin: str
    audio_path: str  # Path to the word's audio file
    primary_color: tuple  # RGB
    secondary_color: tuple  # RGB
    background_color: tuple  # RGB
    animation_type: str  # 'grow', 'shrink', 'follow', 'transform', 'bounce', etc.
    objects: list  # List of object descriptions for each stage
    final_label: str  # Text shown at the end


def get_animation_config(english: str, word: str, pinyin: str, audio_path: str = '') -> WordAnimation:
    """
    Generate animation configuration based on word meaning.
    This is the semantic mapping that determines how each word is visualized.
    """
    english_lower = english.lower()

    # Define animation mappings based on word meanings
    if 'mung bean' in english_lower or 'bean' in english_lower or '绿豆' in word:
        return WordAnimation(
            word=word,
            english=english,
            pinyin=pinyin,
            audio_path=audio_path,
            primary_color=(76, 175, 80),  # Green
            secondary_color=(139, 195, 74),  # Light green
            background_color=(245, 245, 220),  # Beige
            animation_type='grow',
            objects=['seed', 'sprout', 'small_plant', 'bean_plant'],
            final_label='绿豆发芽了！'  # Mung bean sprouted!
        )

    elif 'short' in english_lower or '短' in word:
        return WordAnimation(
            word=word,
            english=english,
            pinyin=pinyin,
            audio_path=audio_path,
            primary_color=(33, 150, 243),  # Blue
            secondary_color=(100, 181, 246),  # Light blue
            background_color=(232, 245, 253),  # Light blue bg
            animation_type='shrink',
            objects=['tall_bar', 'medium_bar', 'short_bar', 'tiny_bar'],
            final_label='越来越短！'
        )

    elif 'follow' in english_lower or '跟' in word:
        return WordAnimation(
            word=word,
            english=english,
            pinyin=pinyin,
            audio_path=audio_path,
            primary_color=(255, 152, 0),  # Orange
            secondary_color=(255, 193, 7),  # Amber
            background_color=(255, 248, 225),  # Light amber bg
            animation_type='follow',
            objects=['leader', 'follower1', 'follower2', 'follower3'],
            final_label='跟着走！'
        )

    elif 'change' in english_lower or 'transform' in english_lower or '变' in word:
        return WordAnimation(
            word=word,
            english=english,
            pinyin=pinyin,
            audio_path=audio_path,
            primary_color=(156, 39, 176),  # Purple
            secondary_color=(186, 104, 200),  # Light purple
            background_color=(243, 229, 245),  # Light purple bg
            animation_type='transform',
            objects=['circle', 'square', 'triangle', 'star'],
            final_label='变化多端！'
        )

    elif 'tail' in english_lower or '尾' in word:
        return WordAnimation(
            word=word,
            english=english,
            pinyin=pinyin,
            audio_path=audio_path,
            primary_color=(121, 85, 72),  # Brown
            secondary_color=(161, 136, 127),  # Light brown
            background_color=(239, 235, 233),  # Light brown bg
            animation_type='wag',
            objects=['dog_body', 'tail_left', 'tail_center', 'tail_right'],
            final_label='摇尾巴！'
        )

    elif 'where' in english_lower or '哪' in word:
        return WordAnimation(
            word=word,
            english=english,
            pinyin=pinyin,
            audio_path=audio_path,
            primary_color=(0, 150, 136),  # Teal
            secondary_color=(77, 182, 172),  # Light teal
            background_color=(224, 242, 241),  # Light teal bg
            animation_type='search',
            objects=['question_mark', 'eye_left', 'eye_right', 'found'],
            final_label='在哪里？'
        )

    elif 'belly' in english_lower or 'tummy' in english_lower or '肚' in word:
        return WordAnimation(
            word=word,
            english=english,
            pinyin=pinyin,
            audio_path=audio_path,
            primary_color=(255, 183, 150),  # Peach/skin tone
            secondary_color=(255, 218, 185),  # Light peach
            background_color=(255, 245, 238),  # Seashell bg
            animation_type='belly',
            objects=['body', 'belly_small', 'belly_medium', 'belly_big'],
            final_label='圆圆的肚皮！'
        )

    elif 'thin' in english_lower or 'slender' in english_lower or '细' in word:
        return WordAnimation(
            word=word,
            english=english,
            pinyin=pinyin,
            audio_path=audio_path,
            primary_color=(100, 149, 237),  # Cornflower blue
            secondary_color=(135, 206, 250),  # Light sky blue
            background_color=(240, 248, 255),  # Alice blue bg
            animation_type='thin',
            objects=['thick_line', 'medium_line', 'thin_line', 'very_thin'],
            final_label='细细的！'
        )

    elif 'clothes' in english_lower or '衣' in word:
        return WordAnimation(
            word=word,
            english=english,
            pinyin=pinyin,
            audio_path=audio_path,
            primary_color=(255, 105, 180),  # Hot pink
            secondary_color=(255, 182, 193),  # Light pink
            background_color=(255, 240, 245),  # Lavender blush bg
            animation_type='clothes',
            objects=['shirt', 'pants', 'dress', 'outfit'],
            final_label='漂亮的衣服！'
        )

    elif 'oh' in english_lower or 'exclamation' in english_lower or word == '哦':
        return WordAnimation(
            word=word,
            english=english,
            pinyin=pinyin,
            audio_path=audio_path,
            primary_color=(255, 215, 0),  # Gold
            secondary_color=(255, 255, 100),  # Light yellow
            background_color=(255, 250, 205),  # Lemon chiffon bg
            animation_type='exclaim',
            objects=['small_oh', 'medium_oh', 'big_oh', 'huge_oh'],
            final_label='哦！'
        )

    elif 'mouth' in english_lower or '嘴' in word:
        return WordAnimation(
            word=word,
            english=english,
            pinyin=pinyin,
            audio_path=audio_path,
            primary_color=(220, 20, 60),  # Crimson (lips)
            secondary_color=(255, 105, 97),  # Light coral
            background_color=(255, 228, 225),  # Misty rose bg
            animation_type='mouth',
            objects=['closed', 'slightly_open', 'open', 'wide_open'],
            final_label='张开嘴巴！'
        )

    elif 'leg' in english_lower or '腿' in word:
        return WordAnimation(
            word=word,
            english=english,
            pinyin=pinyin,
            audio_path=audio_path,
            primary_color=(210, 180, 140),  # Tan (skin)
            secondary_color=(244, 164, 96),  # Sandy brown
            background_color=(253, 245, 230),  # Old lace bg
            animation_type='leg',
            objects=['standing', 'step1', 'step2', 'walking'],
            final_label='走路的腿！'
        )

    elif 'aunt' in english_lower or '阿姨' in word:
        return WordAnimation(
            word=word,
            english=english,
            pinyin=pinyin,
            audio_path=audio_path,
            primary_color=(199, 21, 133),  # Medium violet red
            secondary_color=(255, 105, 180),  # Hot pink
            background_color=(255, 240, 245),  # Lavender blush bg
            animation_type='person',
            objects=['face', 'hair', 'body', 'waving'],
            final_label='阿姨好！'
        )

    elif 'depth' in english_lower or 'deep' in english_lower or 'shallow' in english_lower or '深' in word or '浅' in word:
        return WordAnimation(
            word=word,
            english=english,
            pinyin=pinyin,
            audio_path=audio_path,
            primary_color=(0, 105, 148),  # Deep blue (water)
            secondary_color=(135, 206, 235),  # Sky blue (shallow)
            background_color=(240, 248, 255),  # Alice blue bg
            animation_type='depth',
            objects=['shallow', 'medium', 'deep', 'very_deep'],
            final_label='深深浅浅！'
        )

    elif 'wide' in english_lower or '宽' in word:
        return WordAnimation(
            word=word,
            english=english,
            pinyin=pinyin,
            audio_path=audio_path,
            primary_color=(50, 205, 50),  # Lime green
            secondary_color=(144, 238, 144),  # Light green
            background_color=(240, 255, 240),  # Honeydew bg
            animation_type='wide',
            objects=['narrow_road', 'medium_road', 'wide_road', 'very_wide'],
            final_label='宽宽的！'
        )

    elif 'narrow' in english_lower or '窄' in word:
        return WordAnimation(
            word=word,
            english=english,
            pinyin=pinyin,
            audio_path=audio_path,
            primary_color=(139, 69, 19),  # Saddle brown
            secondary_color=(210, 180, 140),  # Tan
            background_color=(245, 245, 220),  # Beige bg
            animation_type='narrow',
            objects=['wide_path', 'medium_path', 'narrow_path', 'very_narrow'],
            final_label='窄窄的！'
        )

    elif 'sway' in english_lower or 'swing' in english_lower or '摆' in word:
        return WordAnimation(
            word=word,
            english=english,
            pinyin=pinyin,
            audio_path=audio_path,
            primary_color=(34, 139, 34),  # Forest green
            secondary_color=(144, 238, 144),  # Light green
            background_color=(240, 255, 240),  # Honeydew bg
            animation_type='sway',
            objects=['tree', 'left', 'center', 'right'],
            final_label='摆来摆去！'
        )

    elif 'reveal' in english_lower or 'show' in english_lower or '露' in word:
        return WordAnimation(
            word=word,
            english=english,
            pinyin=pinyin,
            audio_path=audio_path,
            primary_color=(255, 215, 0),  # Gold
            secondary_color=(255, 255, 100),  # Light yellow
            background_color=(255, 250, 240),  # Floral white bg
            animation_type='reveal',
            objects=['hidden', 'peek', 'half', 'revealed'],
            final_label='露出来了！'
        )

    else:
        # Default animation - bouncing characters
        return WordAnimation(
            word=word,
            english=english,
            pinyin=pinyin,
            audio_path=audio_path,
            primary_color=(102, 126, 234),  # Default purple-blue
            secondary_color=(118, 75, 162),  # Secondary purple
            background_color=(240, 240, 255),  # Light purple bg
            animation_type='bounce',
            objects=['char1', 'char2', 'char3', 'char4'],
            final_label=f'{word}！'
        )


class Particle:
    """Sparkle particle for effects."""
    def __init__(self, x: float, y: float):
        self.x = x
        self.y = y
        self.vx = random.uniform(-2, 2)
        self.vy = random.uniform(-3, -1)
        self.life = random.uniform(0.5, 1.0)
        self.max_life = self.life
        self.size = random.uniform(2, 6)
        self.color = random.choice([
            (255, 255, 255),  # White
            (255, 215, 0),    # Gold
            (255, 255, 200),  # Light yellow
        ])

    def update(self, dt: float):
        self.x += self.vx
        self.y += self.vy
        self.vy += 0.1  # Gravity
        self.life -= dt

    def is_alive(self) -> bool:
        return self.life > 0

    def get_alpha(self) -> int:
        return int(255 * (self.life / self.max_life))


class VideoGenerator:
    """Generates animated videos for vocabulary words."""

    def __init__(self, config: WordAnimation):
        self.config = config
        self.particles: list[Particle] = []

        # Try to load Chinese font
        self.font_large = self._load_font(120)
        self.font_medium = self._load_font(72)
        self.font_small = self._load_font(48)

    def _load_font(self, size: int) -> ImageFont.FreeTypeFont:
        """Load a font that supports Chinese characters."""
        font_paths = [
            '/System/Library/Fonts/PingFang.ttc',
            '/System/Library/Fonts/STHeiti Light.ttc',
            '/System/Library/Fonts/Hiragino Sans GB.ttc',
            '/Library/Fonts/Arial Unicode.ttf',
            '/System/Library/Fonts/Supplemental/Arial Unicode.ttf',
        ]

        for path in font_paths:
            if os.path.exists(path):
                try:
                    return ImageFont.truetype(path, size)
                except:
                    continue

        # Fallback to default
        return ImageFont.load_default()

    def spawn_particles(self, x: float, y: float, count: int = 10):
        """Spawn sparkle particles at a position."""
        for _ in range(count):
            self.particles.append(Particle(
                x + random.uniform(-20, 20),
                y + random.uniform(-20, 20)
            ))

    def update_particles(self, dt: float):
        """Update all particles."""
        for p in self.particles:
            p.update(dt)
        self.particles = [p for p in self.particles if p.is_alive()]

    def draw_particles(self, draw: ImageDraw.ImageDraw, img: Image.Image):
        """Draw all particles with glow effect."""
        for p in self.particles:
            alpha = p.get_alpha()
            if alpha > 0:
                # Draw glow
                for r in range(int(p.size * 2), 0, -1):
                    glow_alpha = int(alpha * (r / (p.size * 2)) * 0.3)
                    color = (*p.color, glow_alpha)
                    draw.ellipse(
                        [p.x - r, p.y - r, p.x + r, p.y + r],
                        fill=color[:3]
                    )
                # Draw core
                draw.ellipse(
                    [p.x - p.size/2, p.y - p.size/2,
                     p.x + p.size/2, p.y + p.size/2],
                    fill=p.color
                )

    def draw_mung_bean_grow(self, draw: ImageDraw.ImageDraw, img: Image.Image,
                            progress: float, stage: int):
        """Draw mung bean growing animation."""
        cx, cy = WIDTH // 2, HEIGHT // 2 + 50

        # Soil/pot at bottom
        pot_y = cy + 150
        draw.rectangle([cx - 150, pot_y, cx + 150, pot_y + 100],
                      fill=(139, 90, 43))  # Brown pot
        draw.ellipse([cx - 160, pot_y - 20, cx + 160, pot_y + 20],
                    fill=(101, 67, 33))  # Soil

        # Calculate growth based on stage and progress within stage
        stage_progress = progress % 1.0 if stage < 3 else progress

        if stage == 0:
            # Seed stage - small bean in soil
            bean_size = 20 + stage_progress * 10
            bean_y = pot_y - 10 - stage_progress * 20
            self._draw_bean(draw, cx, bean_y, bean_size, self.config.primary_color)

        elif stage == 1:
            # Sprout stage - small stem emerging
            stem_height = 30 + stage_progress * 50
            self._draw_stem(draw, cx, pot_y - 10, stem_height, 8)
            # Small leaves
            if stage_progress > 0.3:
                leaf_size = (stage_progress - 0.3) * 40
                self._draw_leaves(draw, cx, pot_y - 10 - stem_height, leaf_size, 2)
            # Bean still visible
            self._draw_bean(draw, cx, pot_y - 5, 25, self.config.primary_color)

        elif stage == 2:
            # Small plant - taller with more leaves
            stem_height = 80 + stage_progress * 60
            self._draw_stem(draw, cx, pot_y - 10, stem_height, 10)
            # Multiple leaf pairs
            leaf_size = 30 + stage_progress * 20
            self._draw_leaves(draw, cx, pot_y - 10 - stem_height, leaf_size, 4)
            self._draw_leaves(draw, cx, pot_y - 10 - stem_height * 0.6, leaf_size * 0.8, 3)

        else:
            # Full bean plant with bean pods
            stem_height = 180
            self._draw_stem(draw, cx, pot_y - 10, stem_height, 12)
            # Many leaves
            self._draw_leaves(draw, cx, pot_y - 10 - stem_height, 50, 5)
            self._draw_leaves(draw, cx, pot_y - 10 - stem_height * 0.7, 45, 4)
            self._draw_leaves(draw, cx, pot_y - 10 - stem_height * 0.4, 40, 3)
            # Bean pods
            self._draw_bean_pods(draw, cx, pot_y - 10 - stem_height * 0.5, stage_progress)

    def _draw_bean(self, draw: ImageDraw.ImageDraw, x: float, y: float,
                   size: float, color: tuple):
        """Draw a mung bean."""
        draw.ellipse([x - size, y - size * 0.7, x + size, y + size * 0.7],
                    fill=color)
        # Highlight
        draw.ellipse([x - size * 0.3, y - size * 0.4, x + size * 0.2, y],
                    fill=(min(255, color[0] + 40), min(255, color[1] + 40), min(255, color[2] + 40)))

    def _draw_stem(self, draw: ImageDraw.ImageDraw, x: float, base_y: float,
                   height: float, width: float):
        """Draw a plant stem."""
        # Main stem with slight curve
        points = []
        for i in range(int(height)):
            curve = math.sin(i * 0.05) * 5
            points.append((x + curve, base_y - i))

        for i in range(len(points) - 1):
            draw.line([points[i], points[i+1]], fill=(76, 175, 80), width=int(width))

    def _draw_leaves(self, draw: ImageDraw.ImageDraw, x: float, y: float,
                     size: float, count: int):
        """Draw leaves at a position."""
        for i in range(count):
            angle = (i - count / 2) * 0.4
            lx = x + math.cos(angle + math.pi/2) * size * 1.5
            ly = y + math.sin(angle + math.pi/2) * size * 0.5

            # Leaf shape (ellipse rotated)
            leaf_color = (random.randint(60, 90), random.randint(160, 190), random.randint(60, 90))
            draw.ellipse([lx - size/2, ly - size/4, lx + size/2, ly + size/4],
                        fill=leaf_color)

    def _draw_bean_pods(self, draw: ImageDraw.ImageDraw, x: float, y: float,
                        progress: float):
        """Draw bean pods hanging from plant."""
        pod_count = int(2 + progress * 3)
        for i in range(pod_count):
            px = x + (i - pod_count/2) * 40 + random.randint(-10, 10)
            py = y + random.randint(0, 30)
            # Pod shape
            draw.ellipse([px - 8, py - 25, px + 8, py + 25],
                        fill=(144, 238, 144))  # Light green pod
            # Beans inside (bumps)
            for j in range(3):
                by = py - 15 + j * 12
                draw.ellipse([px - 6, by - 5, px + 6, by + 5],
                            fill=(124, 218, 124))

    def draw_shrinking(self, draw: ImageDraw.ImageDraw, img: Image.Image,
                       progress: float, stage: int):
        """Draw shrinking bars animation."""
        heights = [300, 220, 140, 60]
        bar_width = 80

        # Calculate positions for final frame (all bars visible)
        if stage == 3 and progress > 0.7:
            # Final frame - show all bars lined up
            final_progress = (progress - 0.7) / 0.3
            spacing = 120
            start_x = WIDTH // 2 - (spacing * 1.5)

            for i, h in enumerate(heights):
                x = start_x + i * spacing
                y = HEIGHT // 2 + 150 - h
                alpha = min(1.0, final_progress * 2)
                color = tuple(int(c * alpha + self.config.background_color[idx] * (1 - alpha))
                             for idx, c in enumerate(self.config.primary_color))
                draw.rectangle([x - bar_width//2, y, x + bar_width//2, HEIGHT//2 + 150],
                              fill=color)
        else:
            # Animated shrinking
            current_height = heights[stage]
            if stage < 3:
                next_height = heights[stage + 1]
                t = progress % 1.0
                # Ease in-out
                t = t * t * (3 - 2 * t)
                current_height = current_height + (next_height - current_height) * t

            x = WIDTH // 2
            y = HEIGHT // 2 + 150 - current_height
            draw.rectangle([x - bar_width//2, y, x + bar_width//2, HEIGHT//2 + 150],
                          fill=self.config.primary_color)

    def draw_following(self, draw: ImageDraw.ImageDraw, img: Image.Image,
                       progress: float, stage: int):
        """Draw following animation - circles following a leader."""
        circle_radius = 40

        # Leader position moves in a path
        t = progress + stage * 0.25
        leader_x = WIDTH // 2 + math.sin(t * math.pi * 2) * 200
        leader_y = HEIGHT // 2 + math.cos(t * math.pi * 2) * 100

        # Draw followers (they follow with delay)
        follower_count = min(stage + 1, 4)
        positions = [(leader_x, leader_y)]

        for i in range(follower_count):
            delay = (i + 1) * 0.15
            ft = max(0, t - delay)
            fx = WIDTH // 2 + math.sin(ft * math.pi * 2) * 200
            fy = HEIGHT // 2 + math.cos(ft * math.pi * 2) * 100
            positions.append((fx, fy))

        # Draw from back to front
        for i, (x, y) in enumerate(reversed(positions)):
            idx = len(positions) - 1 - i
            if idx == 0:
                color = self.config.primary_color
            else:
                # Followers get progressively lighter
                factor = 0.5 + (idx / len(positions)) * 0.5
                color = tuple(int(c * factor + 255 * (1 - factor))
                             for c in self.config.secondary_color)

            draw.ellipse([x - circle_radius, y - circle_radius,
                         x + circle_radius, y + circle_radius],
                        fill=color)

            # Eyes
            if idx == 0:
                # Leader has different eyes (looking forward)
                eye_offset = 12
                draw.ellipse([x - eye_offset - 5, y - 10, x - eye_offset + 5, y],
                            fill='white')
                draw.ellipse([x + eye_offset - 5, y - 10, x + eye_offset + 5, y],
                            fill='white')
                draw.ellipse([x - eye_offset - 2, y - 8, x - eye_offset + 2, y - 4],
                            fill='black')
                draw.ellipse([x + eye_offset - 2, y - 8, x + eye_offset + 2, y - 4],
                            fill='black')

    def draw_transform(self, draw: ImageDraw.ImageDraw, img: Image.Image,
                       progress: float, stage: int):
        """Draw transformation animation - shape morphing."""
        cx, cy = WIDTH // 2, HEIGHT // 2
        size = 120

        shapes = ['circle', 'square', 'triangle', 'star']
        current_shape = shapes[stage]
        next_shape = shapes[(stage + 1) % 4] if stage < 3 else shapes[3]

        t = progress % 1.0 if stage < 3 else 0
        # Ease function
        t = t * t * (3 - 2 * t)

        # Morph between shapes
        color = self.config.primary_color

        if t < 0.5 or stage == 3:
            self._draw_shape(draw, current_shape, cx, cy, size, color)
        else:
            self._draw_shape(draw, next_shape, cx, cy, size, color)

        # Add rotation effect during transition
        if 0.3 < t < 0.7 and stage < 3:
            # Sparkle burst during morph
            if random.random() < 0.3:
                self.spawn_particles(cx, cy, 5)

    def _draw_shape(self, draw: ImageDraw.ImageDraw, shape: str,
                    x: float, y: float, size: float, color: tuple):
        """Draw a specific shape."""
        if shape == 'circle':
            draw.ellipse([x - size, y - size, x + size, y + size], fill=color)
        elif shape == 'square':
            draw.rectangle([x - size, y - size, x + size, y + size], fill=color)
        elif shape == 'triangle':
            points = [
                (x, y - size),
                (x - size, y + size),
                (x + size, y + size)
            ]
            draw.polygon(points, fill=color)
        elif shape == 'star':
            points = []
            for i in range(10):
                angle = i * math.pi / 5 - math.pi / 2
                r = size if i % 2 == 0 else size * 0.5
                points.append((x + r * math.cos(angle), y + r * math.sin(angle)))
            draw.polygon(points, fill=color)

    def draw_tail_wag(self, draw: ImageDraw.ImageDraw, img: Image.Image,
                      progress: float, stage: int):
        """Draw a dog wagging its tail."""
        cx, cy = WIDTH // 2, HEIGHT // 2

        # Dog body (simple)
        body_color = self.config.primary_color

        # Body
        draw.ellipse([cx - 100, cy - 50, cx + 80, cy + 50], fill=body_color)

        # Head
        draw.ellipse([cx + 50, cy - 70, cx + 150, cy + 10], fill=body_color)

        # Ears
        draw.ellipse([cx + 60, cy - 90, cx + 90, cy - 50], fill=(101, 67, 33))
        draw.ellipse([cx + 110, cy - 90, cx + 140, cy - 50], fill=(101, 67, 33))

        # Eyes
        draw.ellipse([cx + 80, cy - 50, cx + 95, cy - 35], fill='white')
        draw.ellipse([cx + 105, cy - 50, cx + 120, cy - 35], fill='white')
        draw.ellipse([cx + 85, cy - 47, cx + 92, cy - 40], fill='black')
        draw.ellipse([cx + 108, cy - 47, cx + 115, cy - 40], fill='black')

        # Nose
        draw.ellipse([cx + 130, cy - 35, cx + 145, cy - 20], fill='black')

        # Legs
        for lx in [cx - 60, cx - 20, cx + 20, cx + 50]:
            draw.rectangle([lx - 10, cy + 40, lx + 10, cy + 100], fill=body_color)

        # Animated tail
        tail_angle = math.sin(progress * math.pi * 8 + stage * math.pi / 2) * 0.5
        tail_length = 80
        tail_x = cx - 100 - tail_length * math.cos(tail_angle)
        tail_y = cy - 20 - tail_length * math.sin(tail_angle)

        # Draw tail as curved line
        draw.line([(cx - 100, cy - 20), (tail_x, tail_y)],
                 fill=body_color, width=20)
        draw.ellipse([tail_x - 15, tail_y - 15, tail_x + 15, tail_y + 15],
                    fill=body_color)

    def draw_search(self, draw: ImageDraw.ImageDraw, img: Image.Image,
                    progress: float, stage: int):
        """Draw searching animation with question marks."""
        cx, cy = WIDTH // 2, HEIGHT // 2

        # Moving question mark
        qx = cx + math.sin(progress * math.pi * 4) * 150
        qy = cy + math.cos(progress * math.pi * 2) * 80

        # Draw question mark
        self._draw_question_mark(draw, qx, qy, 80, self.config.primary_color)

        # Searching eyes that follow the question mark
        eye_x = cx
        eye_y = cy + 100

        # Calculate eye direction
        dx = qx - eye_x
        dy = qy - eye_y
        dist = math.sqrt(dx * dx + dy * dy)
        if dist > 0:
            dx /= dist
            dy /= dist

        # Draw eyes
        for ex in [eye_x - 60, eye_x + 60]:
            # Eye white
            draw.ellipse([ex - 35, eye_y - 25, ex + 35, eye_y + 25], fill='white')
            draw.ellipse([ex - 35, eye_y - 25, ex + 35, eye_y + 25], outline='black', width=3)
            # Pupil (follows question mark)
            px = ex + dx * 15
            py = eye_y + dy * 10
            draw.ellipse([px - 12, py - 12, px + 12, py + 12], fill='black')

    def _draw_question_mark(self, draw: ImageDraw.ImageDraw, x: float, y: float,
                            size: float, color: tuple):
        """Draw a question mark."""
        # Top curve
        draw.arc([x - size/2, y - size, x + size/2, y], 0, 180, fill=color, width=int(size/4))
        # Stem
        draw.line([(x + size/4, y - size/2), (x, y + size/4)], fill=color, width=int(size/4))
        # Dot
        draw.ellipse([x - size/8, y + size/3, x + size/8, y + size/2], fill=color)

    def draw_belly(self, draw: ImageDraw.ImageDraw, img: Image.Image,
                   progress: float, stage: int):
        """Draw belly/tummy animation - expanding belly."""
        cx, cy = WIDTH // 2, HEIGHT // 2

        # Body outline
        body_color = self.config.primary_color

        # Head
        draw.ellipse([cx - 50, cy - 200, cx + 50, cy - 100], fill=body_color)
        # Eyes
        draw.ellipse([cx - 30, cy - 170, cx - 15, cy - 150], fill='white')
        draw.ellipse([cx + 15, cy - 170, cx + 30, cy - 150], fill='white')
        draw.ellipse([cx - 25, cy - 165, cx - 20, cy - 155], fill='black')
        draw.ellipse([cx + 20, cy - 165, cx + 25, cy - 155], fill='black')
        # Smile
        draw.arc([cx - 20, cy - 140, cx + 20, cy - 120], 0, 180, fill='black', width=3)

        # Belly size based on stage
        belly_sizes = [60, 90, 120, 150]
        belly_size = belly_sizes[stage]
        if stage < 3:
            t = progress % 1.0
            next_size = belly_sizes[stage + 1]
            belly_size = belly_size + (next_size - belly_size) * t

        # Body with expanding belly
        draw.ellipse([cx - 70, cy - 110, cx + 70, cy + 50], fill=body_color)
        # Belly (lighter color, expanding)
        belly_color = self.config.secondary_color
        draw.ellipse([cx - belly_size, cy - 30, cx + belly_size, cy + belly_size],
                    fill=belly_color)
        # Belly button
        draw.ellipse([cx - 5, cy + belly_size//2 - 10, cx + 5, cy + belly_size//2],
                    fill=body_color)

        # Arms
        draw.ellipse([cx - 100, cy - 80, cx - 60, cy - 20], fill=body_color)
        draw.ellipse([cx + 60, cy - 80, cx + 100, cy - 20], fill=body_color)

        # Legs
        draw.rectangle([cx - 40, cy + 50 + belly_size//2, cx - 15, cy + 150 + belly_size//2], fill=body_color)
        draw.rectangle([cx + 15, cy + 50 + belly_size//2, cx + 40, cy + 150 + belly_size//2], fill=body_color)

    def draw_thin(self, draw: ImageDraw.ImageDraw, img: Image.Image,
                  progress: float, stage: int):
        """Draw thin/slender animation - lines getting thinner."""
        cx, cy = WIDTH // 2, HEIGHT // 2

        # Line widths for each stage
        widths = [80, 50, 25, 8]
        current_width = widths[stage]
        if stage < 3:
            t = progress % 1.0
            next_width = widths[stage + 1]
            current_width = current_width + (next_width - current_width) * t

        # Draw vertical line
        draw.rectangle([cx - current_width/2, cy - 150, cx + current_width/2, cy + 150],
                      fill=self.config.primary_color)

        # Add some decoration lines
        for i in range(3):
            offset = (i - 1) * 200
            line_width = max(2, current_width * 0.3)
            draw.rectangle([cx + offset - line_width/2, cy - 100,
                           cx + offset + line_width/2, cy + 100],
                          fill=self.config.secondary_color)

    def draw_clothes(self, draw: ImageDraw.ImageDraw, img: Image.Image,
                     progress: float, stage: int):
        """Draw clothes animation - different clothing items."""
        cx, cy = WIDTH // 2, HEIGHT // 2

        if stage == 0:
            # T-shirt
            color = self.config.primary_color
            # Body
            draw.rectangle([cx - 80, cy - 80, cx + 80, cy + 100], fill=color)
            # Sleeves
            draw.rectangle([cx - 140, cy - 80, cx - 80, cy], fill=color)
            draw.rectangle([cx + 80, cy - 80, cx + 140, cy], fill=color)
            # Neck hole
            draw.ellipse([cx - 30, cy - 100, cx + 30, cy - 60], fill=self.config.background_color)
        elif stage == 1:
            # Pants
            color = (0, 0, 139)  # Dark blue jeans
            draw.rectangle([cx - 70, cy - 100, cx + 70, cy - 50], fill=color)
            draw.rectangle([cx - 70, cy - 50, cx - 10, cy + 120], fill=color)
            draw.rectangle([cx + 10, cy - 50, cx + 70, cy + 120], fill=color)
        elif stage == 2:
            # Dress
            color = self.config.primary_color
            # Top
            draw.rectangle([cx - 60, cy - 100, cx + 60, cy - 20], fill=color)
            # Skirt (triangle)
            draw.polygon([(cx - 60, cy - 20), (cx + 60, cy - 20),
                         (cx + 120, cy + 120), (cx - 120, cy + 120)], fill=color)
            # Belt
            draw.rectangle([cx - 65, cy - 25, cx + 65, cy - 15], fill=(255, 215, 0))
        else:
            # Full outfit on mannequin
            # Head
            draw.ellipse([cx - 30, cy - 180, cx + 30, cy - 120], fill=(210, 180, 140))
            # Shirt
            draw.rectangle([cx - 50, cy - 120, cx + 50, cy - 20], fill=self.config.primary_color)
            draw.rectangle([cx - 80, cy - 120, cx - 50, cy - 60], fill=self.config.primary_color)
            draw.rectangle([cx + 50, cy - 120, cx + 80, cy - 60], fill=self.config.primary_color)
            # Pants
            draw.rectangle([cx - 45, cy - 20, cx - 5, cy + 100], fill=(0, 0, 139))
            draw.rectangle([cx + 5, cy - 20, cx + 45, cy + 100], fill=(0, 0, 139))

    def draw_exclaim(self, draw: ImageDraw.ImageDraw, img: Image.Image,
                     progress: float, stage: int):
        """Draw exclamation animation - growing 'oh!'."""
        cx, cy = WIDTH // 2, HEIGHT // 2

        # Size based on stage
        sizes = [40, 80, 130, 200]
        size = sizes[stage]
        if stage < 3:
            t = progress % 1.0
            next_size = sizes[stage + 1]
            size = size + (next_size - size) * t

        # Draw "O" shape (mouth saying "oh")
        draw.ellipse([cx - size, cy - size, cx + size, cy + size],
                    fill=self.config.primary_color)
        # Inner mouth (darker)
        inner = size * 0.6
        draw.ellipse([cx - inner, cy - inner, cx + inner, cy + inner],
                    fill=(50, 50, 50))

        # Exclamation effects around
        if stage >= 2:
            for angle in range(0, 360, 45):
                rad = math.radians(angle)
                ex = cx + math.cos(rad) * (size + 50)
                ey = cy + math.sin(rad) * (size + 50)
                draw.line([(cx + math.cos(rad) * size, cy + math.sin(rad) * size),
                          (ex, ey)], fill=self.config.secondary_color, width=8)

    def draw_mouth(self, draw: ImageDraw.ImageDraw, img: Image.Image,
                   progress: float, stage: int):
        """Draw mouth animation - opening mouth."""
        cx, cy = WIDTH // 2, HEIGHT // 2

        # Face
        face_color = (255, 218, 185)  # Peach
        draw.ellipse([cx - 150, cy - 150, cx + 150, cy + 150], fill=face_color)

        # Eyes
        draw.ellipse([cx - 80, cy - 80, cx - 40, cy - 40], fill='white')
        draw.ellipse([cx + 40, cy - 80, cx + 80, cy - 40], fill='white')
        draw.ellipse([cx - 70, cy - 70, cx - 50, cy - 50], fill='black')
        draw.ellipse([cx + 50, cy - 70, cx + 70, cy - 50], fill='black')

        # Mouth opening based on stage
        mouth_heights = [10, 30, 60, 100]
        mouth_height = mouth_heights[stage]
        if stage < 3:
            t = progress % 1.0
            next_h = mouth_heights[stage + 1]
            mouth_height = mouth_height + (next_h - mouth_height) * t

        # Lips
        lip_color = self.config.primary_color
        draw.ellipse([cx - 50, cy + 20, cx + 50, cy + 20 + mouth_height], fill=lip_color)
        # Inner mouth (dark)
        if mouth_height > 20:
            draw.ellipse([cx - 40, cy + 30, cx + 40, cy + 10 + mouth_height], fill=(50, 20, 20))
            # Tongue
            if mouth_height > 40:
                draw.ellipse([cx - 25, cy + mouth_height - 20, cx + 25, cy + mouth_height + 10],
                            fill=(255, 100, 100))

    def draw_leg(self, draw: ImageDraw.ImageDraw, img: Image.Image,
                 progress: float, stage: int):
        """Draw leg/walking animation."""
        cx, cy = WIDTH // 2, HEIGHT // 2 + 50

        leg_color = self.config.primary_color
        shoe_color = (50, 50, 50)

        # Walking cycle
        t = progress * 2 * math.pi

        if stage == 0:
            # Standing
            draw.rectangle([cx - 60, cy - 150, cx - 20, cy + 50], fill=leg_color)
            draw.rectangle([cx + 20, cy - 150, cx + 60, cy + 50], fill=leg_color)
            draw.ellipse([cx - 70, cy + 40, cx - 10, cy + 80], fill=shoe_color)
            draw.ellipse([cx + 10, cy + 40, cx + 70, cy + 80], fill=shoe_color)
        else:
            # Walking animation
            left_angle = math.sin(t + stage) * 30
            right_angle = math.sin(t + stage + math.pi) * 30

            # Left leg
            left_end_x = cx - 40 + math.sin(math.radians(left_angle)) * 150
            left_end_y = cy + 50 + math.cos(math.radians(left_angle)) * 50
            draw.line([(cx - 40, cy - 100), (left_end_x, left_end_y)],
                     fill=leg_color, width=40)
            draw.ellipse([left_end_x - 30, left_end_y - 10, left_end_x + 30, left_end_y + 20],
                        fill=shoe_color)

            # Right leg
            right_end_x = cx + 40 + math.sin(math.radians(right_angle)) * 150
            right_end_y = cy + 50 + math.cos(math.radians(right_angle)) * 50
            draw.line([(cx + 40, cy - 100), (right_end_x, right_end_y)],
                     fill=leg_color, width=40)
            draw.ellipse([right_end_x - 30, right_end_y - 10, right_end_x + 30, right_end_y + 20],
                        fill=shoe_color)

    def draw_person(self, draw: ImageDraw.ImageDraw, img: Image.Image,
                    progress: float, stage: int):
        """Draw a person (auntie) animation - waving."""
        cx, cy = WIDTH // 2, HEIGHT // 2

        # Colors
        skin = (255, 218, 185)
        hair = (50, 30, 20)
        dress = self.config.primary_color

        # Hair
        draw.ellipse([cx - 70, cy - 200, cx + 70, cy - 80], fill=hair)

        # Face
        draw.ellipse([cx - 55, cy - 170, cx + 55, cy - 60], fill=skin)

        # Eyes
        draw.ellipse([cx - 35, cy - 140, cx - 15, cy - 115], fill='white')
        draw.ellipse([cx + 15, cy - 140, cx + 35, cy - 115], fill='white')
        draw.ellipse([cx - 30, cy - 135, cx - 20, cy - 120], fill='black')
        draw.ellipse([cx + 20, cy - 135, cx + 30, cy - 120], fill='black')

        # Smile
        draw.arc([cx - 25, cy - 100, cx + 25, cy - 70], 0, 180, fill=(200, 100, 100), width=4)

        # Body/dress
        draw.polygon([(cx - 60, cy - 60), (cx + 60, cy - 60),
                     (cx + 100, cy + 150), (cx - 100, cy + 150)], fill=dress)

        # Arms - waving animation
        wave_angle = math.sin(progress * math.pi * 6) * 30

        # Left arm (stationary)
        draw.line([(cx - 60, cy - 40), (cx - 120, cy + 40)], fill=skin, width=25)

        # Right arm (waving)
        arm_end_x = cx + 60 + math.cos(math.radians(-45 + wave_angle)) * 100
        arm_end_y = cy - 40 + math.sin(math.radians(-45 + wave_angle)) * 100
        draw.line([(cx + 60, cy - 40), (arm_end_x, arm_end_y)], fill=skin, width=25)

        # Hand
        draw.ellipse([arm_end_x - 20, arm_end_y - 20, arm_end_x + 20, arm_end_y + 20], fill=skin)

    def draw_depth(self, draw: ImageDraw.ImageDraw, img: Image.Image,
                   progress: float, stage: int):
        """Draw depth animation - water getting deeper."""
        cx, cy = WIDTH // 2, HEIGHT // 2

        # Container/pool
        draw.rectangle([cx - 200, cy - 150, cx + 200, cy + 150], outline=(100, 100, 100), width=5)

        # Water depth based on stage
        depths = [50, 100, 200, 280]
        depth = depths[stage]
        if stage < 3:
            t = progress % 1.0
            next_depth = depths[stage + 1]
            depth = depth + (next_depth - depth) * t

        # Water (gradient from light to dark based on depth)
        water_top = cy + 150 - depth
        # Light water at top
        draw.rectangle([cx - 195, water_top, cx + 195, water_top + depth * 0.3],
                      fill=self.config.secondary_color)
        # Darker water below
        draw.rectangle([cx - 195, water_top + depth * 0.3, cx + 195, cy + 145],
                      fill=self.config.primary_color)

        # Waves on top
        for i in range(5):
            wave_x = cx - 180 + i * 90
            wave_y = water_top + math.sin(progress * math.pi * 4 + i) * 5
            draw.ellipse([wave_x - 20, wave_y - 5, wave_x + 20, wave_y + 5],
                        fill=(200, 230, 255))

    def draw_wide(self, draw: ImageDraw.ImageDraw, img: Image.Image,
                  progress: float, stage: int):
        """Draw wide animation - road getting wider."""
        cx, cy = WIDTH // 2, HEIGHT // 2

        # Road widths
        widths = [60, 120, 200, 350]
        width = widths[stage]
        if stage < 3:
            t = progress % 1.0
            next_width = widths[stage + 1]
            width = width + (next_width - width) * t

        # Road
        road_color = (80, 80, 80)
        draw.rectangle([cx - width/2, cy - 200, cx + width/2, cy + 200], fill=road_color)

        # Center line
        line_color = (255, 255, 0)
        for i in range(-3, 4):
            draw.rectangle([cx - 5, cy + i * 60 - 20, cx + 5, cy + i * 60 + 20], fill=line_color)

        # Side lines
        draw.rectangle([cx - width/2 + 10, cy - 200, cx - width/2 + 15, cy + 200], fill='white')
        draw.rectangle([cx + width/2 - 15, cy - 200, cx + width/2 - 10, cy + 200], fill='white')

    def draw_narrow(self, draw: ImageDraw.ImageDraw, img: Image.Image,
                    progress: float, stage: int):
        """Draw narrow animation - path getting narrower."""
        cx, cy = WIDTH // 2, HEIGHT // 2

        # Path widths (decreasing)
        widths = [300, 180, 100, 40]
        width = widths[stage]
        if stage < 3:
            t = progress % 1.0
            next_width = widths[stage + 1]
            width = width + (next_width - width) * t

        # Walls on sides
        wall_color = self.config.secondary_color
        draw.rectangle([cx - 400, cy - 200, cx - width/2, cy + 200], fill=wall_color)
        draw.rectangle([cx + width/2, cy - 200, cx + 400, cy + 200], fill=wall_color)

        # Path
        path_color = self.config.primary_color
        draw.rectangle([cx - width/2, cy - 200, cx + width/2, cy + 200], fill=path_color)

        # Person trying to fit through
        person_width = 50
        if width < person_width + 20:
            # Squeezed!
            draw.ellipse([cx - person_width/3, cy - 80, cx + person_width/3, cy + 80],
                        fill=(255, 200, 150))
        else:
            draw.ellipse([cx - person_width/2, cy - 60, cx + person_width/2, cy + 60],
                        fill=(255, 200, 150))

    def draw_sway(self, draw: ImageDraw.ImageDraw, img: Image.Image,
                  progress: float, stage: int):
        """Draw swaying animation - tree swaying in wind."""
        cx, cy = WIDTH // 2, HEIGHT // 2 + 100

        # Sway angle
        sway = math.sin(progress * math.pi * 4) * (15 + stage * 5)

        # Tree trunk
        trunk_color = (139, 90, 43)
        trunk_top_x = cx + math.sin(math.radians(sway)) * 50
        draw.polygon([(cx - 30, cy + 100), (cx + 30, cy + 100),
                     (trunk_top_x + 15, cy - 50), (trunk_top_x - 15, cy - 50)],
                    fill=trunk_color)

        # Leaves/crown
        leaf_color = self.config.primary_color
        leaf_cx = trunk_top_x + math.sin(math.radians(sway)) * 30
        leaf_cy = cy - 120
        draw.ellipse([leaf_cx - 120, leaf_cy - 100, leaf_cx + 120, leaf_cy + 100],
                    fill=leaf_color)
        draw.ellipse([leaf_cx - 80, leaf_cy - 150, leaf_cx + 80, leaf_cy - 20],
                    fill=self.config.secondary_color)

        # Wind lines
        for i in range(3):
            wind_y = cy - 100 + i * 50
            wind_offset = math.sin(progress * math.pi * 6 + i) * 20
            draw.line([(cx + 200 + wind_offset, wind_y), (cx + 300 + wind_offset, wind_y)],
                     fill=(200, 200, 255), width=3)

    def draw_reveal(self, draw: ImageDraw.ImageDraw, img: Image.Image,
                    progress: float, stage: int):
        """Draw reveal animation - something being uncovered."""
        cx, cy = WIDTH // 2, HEIGHT // 2

        # The hidden treasure (star)
        star_color = self.config.primary_color
        star_size = 80
        points = []
        for i in range(10):
            angle = i * math.pi / 5 - math.pi / 2
            r = star_size if i % 2 == 0 else star_size * 0.5
            points.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))
        draw.polygon(points, fill=star_color)

        # Cover (curtain) - opens based on stage
        cover_color = (100, 50, 50)
        reveal_amounts = [0.1, 0.4, 0.7, 1.0]
        reveal = reveal_amounts[stage]
        if stage < 3:
            t = progress % 1.0
            next_reveal = reveal_amounts[stage + 1]
            reveal = reveal + (next_reveal - reveal) * t

        # Left curtain
        left_edge = cx - 200 * reveal
        if left_edge > cx - 200:
            draw.rectangle([cx - 200, cy - 150, left_edge, cy + 150], fill=cover_color)

        # Right curtain
        right_edge = cx + 200 * reveal
        if right_edge < cx + 200:
            draw.rectangle([right_edge, cy - 150, cx + 200, cy + 150], fill=cover_color)

        # Sparkles when fully revealed
        if reveal > 0.9:
            for _ in range(3):
                sx = cx + random.randint(-100, 100)
                sy = cy + random.randint(-100, 100)
                self.spawn_particles(sx, sy, 2)

    def draw_bounce(self, draw: ImageDraw.ImageDraw, img: Image.Image,
                    progress: float, stage: int):
        """Default animation - bouncing Chinese characters."""
        chars = list(self.config.word)
        if len(chars) == 0:
            chars = ['字']

        char_count = len(chars)
        spacing = min(200, WIDTH // (char_count + 1))
        start_x = WIDTH // 2 - (char_count - 1) * spacing // 2

        for i, char in enumerate(chars):
            # Each character bounces with a phase offset
            phase = progress * math.pi * 4 + i * math.pi / 2
            bounce = abs(math.sin(phase)) * 100

            x = start_x + i * spacing
            y = HEIGHT // 2 + 50 - bounce

            # Draw character
            try:
                draw.text((x, y), char, font=self.font_large, fill=self.config.primary_color,
                         anchor='mm')
            except:
                draw.text((x - 60, y - 60), char, font=self.font_large,
                         fill=self.config.primary_color)

            # Spawn particles at peak of bounce
            if abs(math.sin(phase)) > 0.95 and random.random() < 0.3:
                self.spawn_particles(x, y - 60, 3)

    def generate_frame(self, frame_num: int) -> Image.Image:
        """Generate a single frame of the animation."""
        progress = frame_num / TOTAL_FRAMES
        stage = min(3, int(progress * 4))
        stage_progress = (progress * 4) % 1.0

        # Create image
        img = Image.new('RGB', (WIDTH, HEIGHT), self.config.background_color)
        draw = ImageDraw.Draw(img)

        # Draw main animation based on type
        anim_type = self.config.animation_type
        if anim_type == 'grow':
            self.draw_mung_bean_grow(draw, img, stage_progress, stage)
        elif anim_type == 'shrink':
            self.draw_shrinking(draw, img, stage_progress, stage)
        elif anim_type == 'follow':
            self.draw_following(draw, img, stage_progress, stage)
        elif anim_type == 'transform':
            self.draw_transform(draw, img, stage_progress, stage)
        elif anim_type == 'wag':
            self.draw_tail_wag(draw, img, stage_progress, stage)
        elif anim_type == 'search':
            self.draw_search(draw, img, stage_progress, stage)
        elif anim_type == 'belly':
            self.draw_belly(draw, img, stage_progress, stage)
        elif anim_type == 'thin':
            self.draw_thin(draw, img, stage_progress, stage)
        elif anim_type == 'clothes':
            self.draw_clothes(draw, img, stage_progress, stage)
        elif anim_type == 'exclaim':
            self.draw_exclaim(draw, img, stage_progress, stage)
        elif anim_type == 'mouth':
            self.draw_mouth(draw, img, stage_progress, stage)
        elif anim_type == 'leg':
            self.draw_leg(draw, img, stage_progress, stage)
        elif anim_type == 'person':
            self.draw_person(draw, img, stage_progress, stage)
        elif anim_type == 'depth':
            self.draw_depth(draw, img, stage_progress, stage)
        elif anim_type == 'wide':
            self.draw_wide(draw, img, stage_progress, stage)
        elif anim_type == 'narrow':
            self.draw_narrow(draw, img, stage_progress, stage)
        elif anim_type == 'sway':
            self.draw_sway(draw, img, stage_progress, stage)
        elif anim_type == 'reveal':
            self.draw_reveal(draw, img, stage_progress, stage)
        else:
            self.draw_bounce(draw, img, stage_progress, stage)

        # Spawn particles at stage transitions
        if frame_num % (TOTAL_FRAMES // 4) == 0 and frame_num > 0:
            self.spawn_particles(WIDTH // 2, HEIGHT // 2, 20)

        # Update and draw particles
        self.update_particles(1.0 / FPS)
        self.draw_particles(draw, img)

        # Draw word and pinyin at top
        try:
            draw.text((WIDTH // 2, 60), self.config.word, font=self.font_medium,
                     fill=self.config.primary_color, anchor='mm')
            draw.text((WIDTH // 2, 130), self.config.pinyin, font=self.font_small,
                     fill=(128, 128, 128), anchor='mm')
        except:
            draw.text((WIDTH // 2 - 100, 30), self.config.word, font=self.font_medium,
                     fill=self.config.primary_color)
            draw.text((WIDTH // 2 - 100, 110), self.config.pinyin, font=self.font_small,
                     fill=(128, 128, 128))

        # Final frame - show label
        if progress > 0.85:
            alpha = min(1.0, (progress - 0.85) / 0.1)
            try:
                # Semi-transparent background for text
                label_y = HEIGHT - 120
                draw.rectangle([0, label_y - 40, WIDTH, label_y + 60],
                              fill=(*self.config.background_color[:3],))
                draw.text((WIDTH // 2, label_y), self.config.final_label,
                         font=self.font_medium, fill=self.config.primary_color, anchor='mm')
                draw.text((WIDTH // 2, label_y + 50), f"({self.config.english})",
                         font=self.font_small, fill=(100, 100, 100), anchor='mm')
            except:
                draw.text((WIDTH // 2 - 150, HEIGHT - 150), self.config.final_label,
                         font=self.font_medium, fill=self.config.primary_color)

        return img

    def generate_audio(self, output_path: str, base_path: str = '') -> str:
        """Generate audio track using the word's audio file, played at the end."""
        audio_path = output_path.replace('.mp4', '_audio.wav')

        try:
            import subprocess

            # Find the word's audio file
            word_audio = self.config.audio_path
            if not word_audio:
                print("Warning: No audio path configured for this word")
                return None

            # Resolve relative path
            if base_path and not os.path.isabs(word_audio):
                word_audio = os.path.join(base_path, word_audio)

            if not os.path.exists(word_audio):
                print(f"Warning: Audio file not found: {word_audio}")
                return None

            # Get duration of the word audio
            result = subprocess.run([
                'ffprobe', '-v', 'error',
                '-show_entries', 'format=duration',
                '-of', 'default=noprint_wrappers=1:nokey=1',
                word_audio
            ], capture_output=True, text=True)
            word_duration = float(result.stdout.strip()) if result.stdout.strip() else 1.0

            # Calculate silence duration (word plays at ~3.5 seconds, near end of video)
            silence_before = max(0, DURATION - 0.5 - word_duration)

            # Create silence before the word
            silence_file = '/tmp/silence_before.wav'
            subprocess.run([
                'ffmpeg', '-y', '-f', 'lavfi',
                '-i', 'anullsrc=r=44100:cl=stereo',
                '-t', str(silence_before),
                silence_file
            ], check=True, capture_output=True)

            # Convert word audio to wav for concatenation
            word_wav = '/tmp/word_audio.wav'
            subprocess.run([
                'ffmpeg', '-y',
                '-i', word_audio,
                '-ar', '44100',
                '-ac', '2',
                word_wav
            ], check=True, capture_output=True)

            # Concatenate silence + word
            concat_file = '/tmp/audio_concat.txt'
            with open(concat_file, 'w') as f:
                f.write(f"file '{silence_file}'\n")
                f.write(f"file '{word_wav}'\n")

            subprocess.run([
                'ffmpeg', '-y',
                '-f', 'concat', '-safe', '0',
                '-i', concat_file,
                '-c:a', 'pcm_s16le',
                '-ar', '44100',
                audio_path
            ], check=True, capture_output=True)

            # Cleanup temp files
            for f in [word_wav, silence_file, concat_file]:
                if os.path.exists(f):
                    os.remove(f)

            return audio_path

        except Exception as e:
            print(f"Warning: Could not generate audio: {e}")
            return None

    def generate_video(self, output_path: str, with_audio: bool = True, base_path: str = ''):
        """Generate the complete video."""
        print(f"Generating video for: {self.config.word} ({self.config.english})")
        print(f"Animation type: {self.config.animation_type}")

        # Create temp directory for frames
        with tempfile.TemporaryDirectory() as temp_dir:
            frame_pattern = os.path.join(temp_dir, 'frame_%04d.png')

            # Generate all frames
            print(f"Generating {TOTAL_FRAMES} frames...")
            for i in range(TOTAL_FRAMES):
                frame = self.generate_frame(i)
                frame.save(frame_pattern % i)
                if (i + 1) % 30 == 0:
                    print(f"  Frame {i + 1}/{TOTAL_FRAMES}")

            # Generate audio if requested
            audio_path = None
            if with_audio:
                print("Generating audio...")
                audio_path = self.generate_audio(output_path, base_path)

            # Combine frames into video using ffmpeg
            print("Encoding video...")
            cmd = [
                'ffmpeg', '-y',
                '-framerate', str(FPS),
                '-i', frame_pattern,
            ]

            if audio_path and os.path.exists(audio_path):
                cmd.extend(['-i', audio_path])
                cmd.extend(['-map', '0:v', '-map', '1:a'])
                cmd.extend(['-shortest'])  # Match shortest stream duration

            cmd.extend([
                '-c:v', 'libx264',
                '-pix_fmt', 'yuv420p',
                '-crf', '18',
                '-preset', 'medium',
                '-t', str(DURATION),  # Force exact duration
                output_path
            ])

            subprocess.run(cmd, check=True, capture_output=True)

            # Cleanup audio
            if audio_path and os.path.exists(audio_path):
                os.remove(audio_path)

            print(f"Video saved to: {output_path}")


def load_word_from_json(json_path: str, row: int, index: int) -> tuple[dict, str]:
    """Load a specific word from vocabulary JSON. Returns (word_data, base_path)."""
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Base path is 'public' directory (audio paths are like "audio/绿豆.mp3")
    # json_path is like "public/data/tingxie/tingxie_vocabulary.json"
    # We need to go up to "public"
    json_dir = os.path.dirname(json_path)  # public/data/tingxie
    base_path = os.path.dirname(os.path.dirname(json_dir))  # public

    for vocab_row in data['vocabulary']:
        if vocab_row['row'] == row:
            if index < len(vocab_row['words']):
                return vocab_row['words'][index], base_path
            else:
                raise ValueError(f"Index {index} out of range for row {row}")

    raise ValueError(f"Row {row} not found in vocabulary")


def main():
    parser = argparse.ArgumentParser(
        description='Generate animated vocabulary videos'
    )

    # Word input options
    word_group = parser.add_mutually_exclusive_group(required=True)
    word_group.add_argument('--word', type=str, help='Chinese word to animate')
    word_group.add_argument('--from-json', type=str,
                           help='Path to vocabulary JSON file')

    parser.add_argument('--english', type=str, default='',
                       help='English meaning (required if using --word)')
    parser.add_argument('--pinyin', type=str, default='',
                       help='Pinyin pronunciation')
    parser.add_argument('--row', type=int, default=78,
                       help='Row number in vocabulary JSON')
    parser.add_argument('--index', type=int, default=0,
                       help='Word index within row')
    parser.add_argument('--output', '-o', type=str, default='output.mp4',
                       help='Output video path')
    parser.add_argument('--no-audio', action='store_true',
                       help='Skip audio generation')

    args = parser.parse_args()

    # Get word data
    base_path = ''
    audio_path = ''

    if args.from_json:
        word_data, base_path = load_word_from_json(args.from_json, args.row, args.index)
        word = word_data['simplified']
        english = word_data['english']
        pinyin = word_data['pinyin']
        audio_path = word_data.get('audio', '')
    else:
        word = args.word
        english = args.english
        pinyin = args.pinyin
        if not english:
            print("Warning: No English meaning provided. Animation may be generic.")

    # Generate animation config
    config = get_animation_config(english, word, pinyin, audio_path)

    # Generate video
    generator = VideoGenerator(config)
    generator.generate_video(args.output, with_audio=not args.no_audio, base_path=base_path)


if __name__ == '__main__':
    main()
