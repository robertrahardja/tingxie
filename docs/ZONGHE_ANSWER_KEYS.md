# 综合练习 answer-key pages (`/zonghe/<week>`)

Each week the tuition centre (HCL Education Centre) hands out a P3HCL
booklet: word lists for the coming weeks, a 综合练习 with 课堂练习,
课后练习, 口试练习 and 本周作业. This page turns one booklet into a
study page the child can use on a phone.

Live example: <https://tingxie.rr-startech-innovation.workers.dev/zonghe/34>
(from `34_31082026_P3HCL.pdf`, Week 34, 31/8–6/9/2026).

## Where each part of a booklet goes

| Booklet part | Goes to |
|---|---|
| 听写 word list (本周作业 一) | A new row in `tingxie_vocabulary.json`, see `ADDING_WORDS.md` |
| 口试练习 pages (看图说话 / 会话) | The koushi app (`~/Projects/Hannah/koushi`) |
| 课堂练习 (MCQ, 搭配, 填空, 完成句子, 阅读) | `zonghe_<week>.json` → 课堂练习 tab |
| 课后练习 (句子变变变 rewrites) | `zonghe_<week>.json` → 课后练习 tab |
| 复习口试 passages (本周作业 四) | `zonghe_<week>.json` → 口试复习 tab |
| 识写 / 识读 word lists | `words_w34_w40.json` → 字词表 tab |

## Files

```text
src/routes/zonghe.$week.tsx        the page (one route for every week)
src/lib/tts.ts                     sha256(text)[:16] → /audio/tts/<key>.mp3
public/data/p3hcl/zonghe_<week>.json   exercises, answers, explanations
public/data/p3hcl/words_w34_w40.json   word lists (one entry per week/kind)
public/audio/tts/*.mp3             pre-generated clips + manifest.json
scripts/generate_tts.py            makes the clips (edge-tts)
```

Nav entry: add `{ href: '/zonghe/<week>', label: '综合练习 <week>（答案）' }`
to `NAV_ITEMS` in `src/lib/constants.ts`.

## Adding a new week

1. Render the PDF and read it:
   `pdftoppm -r 110 -png <booklet>.pdf p` then open the PNGs.
2. Create `public/data/p3hcl/zonghe_<week>.json` in the shape below.
   Record the child's pencilled answers in `student` (`null` if blank) so
   the scoreboard and “要复习” list work. Put an explanation a P3 child can
   follow in `why` (Chinese, with the key English word in brackets) and an
   English gloss of the completed sentence in `en`.
3. Append any new word-list weeks to `words_w34_w40.json` (or start a new
   file and point the route at it).
4. Add the nav entry.
5. Generate audio (the only Python on this machine with `edge_tts` is the
   mise one; system `python3` has no pip):

   ```bash
   ~/.local/share/mise/installs/python/3.14.6/bin/python scripts/generate_tts.py
   ```

   It only renders strings that have no clip yet and rewrites
   `manifest.json`. Delete clips that are no longer in the manifest if you
   want to keep the folder tidy.
6. `npm run typecheck && npm run build`, then
   `node ~/bin/mobile-test.js http://localhost:3001/zonghe/<week>`.
7. `npx wrangler deploy` (needs the StarTech Cloudflare credentials from
   the repo's direnv `.envrc`).

## JSON shape (`zonghe_<week>.json`)

```jsonc
{
  "week": 34, "title": "P3HCL 综合练习 34", "dates": "31/8/2026 - 6/9/2026",
  "source": "…pdf", "student": "耶恩", "note": "shown under the scoreboard",
  "sections": [
    { "id": "mcq", "kind": "mcq", "title": "一、语文应用", "points": "30题30分",
      "instruction": "…",
      "groups": [{ "questions": [
        { "n": 1, "text": "我____妈妈…", "options": ["回答","叫喊","原谅","请求"],
          "answer": 4, "student": 4, "why": "…", "en": "…",
          "unsure": "先写 4，后改成 2",   // optional note about her marking
          "alt": 5 }                      // optional second accepted answer
      ]}]},
    // kinds "match" and "complete": groups carry a shared "bank" (8 or 6
    // strings) and "unused"; questions have "text" with ____ and no options.
    // kind "cloze": group also has "passage": lines with 【49】 markers.
    // kind "reading": group has "passage" lines, "passageEn", and questions
    // with "options" and no blank.
    { "id": "rewrite", "kind": "rewrite", "title": "课后练习 · 扩写句子",
      "items": [{ "n": 1, "original": ["A句", "B句"], "pattern": "虽然……但是……",
                  "answer": "…", "why": "…", "en": "…" }] },
    { "id": "oral", "kind": "oral", "title": "本周作业 · 复习口试",
      "items": [{ "title": "乐于助人",
                  "sentences": [{ "zh": "…", "en": "…" }],
                  "vocab": [{ "w": "称赞", "py": "chēng zàn", "en": "to praise" }] }] }
  ]
}
```

Answers are 1-based indexes into `options` (or the group's `bank`).
A paired connector answer such as `因为……所以……` fills two blanks.

Word list entries: `{ "n", "w", "py", "en", "c" }` where `c` is the
booklet's collocation; several are separated with ` / `.

## What the page speaks

Every tap plays a pre-generated MP3; nothing uses the browser's speech
synthesis (many phones have no Chinese voice). The generator mirrors the
page exactly: completed sentences, every option and bank word (practice
mode speaks the tapped option), passage lines with the answers filled in,
rewrite originals and answers, oral sentences and vocab, words and
collocations. If a button is silent, the clip is missing: the audio hook
now logs `Audio file not found (got HTML)` because the SPA fallback serves
`index.html` for unknown paths. Re-run the generator.

## Week 34 result (for reference)

课堂练习: 28 correct, 11 wrong, 30 not attempted out of 69. Wrong: Q7 认识,
Q8 实现, Q14 应该, Q16 讨论, Q20 果然, Q21 请求, Q22 碰到, Q23 清洗,
Q24 附近, Q26 按照, Q33 贴在. Sections 三, 四 and 五 were blank.
