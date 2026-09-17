# 活动本 answer-key pages (`/keben/<lesson>`)

The school 华文 activity book (活动本) has one workbook unit per 课. This
page turns one unit's marked homework into a study page the child can use on
a phone: every exercise with its answer hidden behind a 看答案 button, and
every Chinese word tappable for pinyin, meaning and sound.

Live example: <https://tingxie.rr-startech-innovation.workers.dev/keben/15>
(from `16092026_hw.pdf`, 第十五课 华文真有趣, 华文 3A 活动本 pp. 61-72).

This is the sibling of `/zonghe/<week>` (see `ZONGHE_ANSWER_KEYS.md`), which
covers the tuition centre's weekly 综合练习 booklet instead. The two use the
same word-bank and TTS machinery but different section shapes, because the
activity book's exercises (match-the-pinyin, honeycomb word search, spot-the-
wrong-character, colour-the-pinyin) have no equivalent in a 综合练习.

## Files

```text
src/routes/keben.$lesson.tsx              the route, a thin wrapper
src/components/keben/KebenPage.tsx        data loading, tabs, 字词表
src/components/keben/ExerciseTab.tsx      sections 一二三四六八 (one component each)
src/components/keben/ReadingTab.tsx       section 五 阅读放大镜
src/components/keben/SongTab.tsx          section 七 阅读加油站 (儿歌)
src/lib/keben/types.ts                    data types
public/data/p3hcl/keben_<lesson>.json     the answers
public/data/p3hcl/keben_<lesson>_words.json   tappable-word bank (generated)
scripts/build_keben_words.py              builds the word bank
scripts/generate_tts.py                   makes the MP3 clips (zonghe + keben)
```

Nav entry: add `{ href: '/keben/<lesson>', label: '第X课：<题目>（答案）' }`
to `NAV_ITEMS` in `src/lib/constants.ts`.

## Tabs

| Tab | Sections |
|---|---|
| 练习 | `pinyin`, `riddle`, `error`, `order`, `colour`, `table` |
| 阅读 | `reading` — passage, the two readings, and the questions |
| 儿歌 | `song` — verses, word patterns, comprehension question |
| 字词表 | the `revise` list at the top level of the JSON |

## Section kinds

| kind | Exercise | Shape |
|---|---|---|
| `pinyin` | 连一连，写一写 | `word`, `full`, `given`, `answer`, `picture` |
| `riddle` | 找词语 | `clue`, `hint`, `answer`, `py`, `why` + `grid` |
| `error` | 错字小侦探 | `sentence`, `wrong`, `right`, `correct`, `why` |
| `order` | 写一写，排一排 | `order`, `text`, `blanks[{py,zi}]`, `given` |
| `reading` | 阅读放大镜 | `passage`, `key`, `questions` (`open`/`tf`/`flow`) |
| `colour` | 找一找，涂一涂 | `items`, `distractors`, `result` |
| `song` | 阅读加油站 | `verses`, `patterns`, `question` |
| `table` | 倒过来的词语 | `rows[{a,aMean,aPy,b,bMean,bPy,same}]`, `more` |

`given: true` marks what the book already printed (so the child sees what was
hers to fill); `mine: true` on a table row marks an answer she had to invent
because the book left the row blank.

Pictures are described in words (`picture`) rather than reproduced — the
workbook art is copyrighted, and the description is enough to find the row.

## Adding a lesson

1. Render the PDF and read it:
   `pdftoppm -r 110 -png <hw>.pdf p`, then open the PNGs.
2. Write `public/data/p3hcl/keben_<lesson>.json` in the shape above. Put an
   explanation a P3 child can follow in `why` and an English gloss in `en`.
3. Add the nav entry in `src/lib/constants.ts`.
4. Build the word bank, then the audio (the only Python here with `edge_tts`
   and `jieba` is the mise one; system `python3` has no pip):

   ```bash
   ~/.local/share/mise/installs/python/3.14.6/bin/python scripts/build_keben_words.py
   ~/.local/share/mise/installs/python/3.14.6/bin/python scripts/generate_tts.py
   ```

   `generate_tts.py` covers both `/zonghe` and `/keben` and rewrites
   `manifest.json` for both, so always run it from the repo root and let it
   see every data file. It only renders strings that have no clip yet.
5. `npm run typecheck && npm run build`, then
   `node ~/bin/mobile-test.js http://localhost:<port>/keben/<lesson>`.
6. `npx wrangler deploy` (needs the StarTech Cloudflare credentials from the
   repo's direnv `.envrc`).

Hand-written glosses for the lesson's own words go in `OVERRIDES` in
`scripts/build_keben_words.py`; words jieba splits wrongly go in
`EXTRA_WORDS`. The dictionary machinery itself (CC-CEDICT, gloss cleaning) is
imported from `build_zonghe_words.py` so there is only one copy of it.

## Lesson 15 notes (for reference)

The homework was handed in blank apart from the name, so nothing is recorded
as the child's answers — the page is a pure answer key and study aid. Two
answers are not the book's but ours, because the book leaves them open:
table rows 5-6 (蜜蜂/蜂蜜 and 牛奶/奶牛), marked `mine: true`. The 涂一涂
puzzle's coloured blocks form 田. 听写 words for this unit are in `revise`.
