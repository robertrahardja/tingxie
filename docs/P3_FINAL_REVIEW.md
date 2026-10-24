# P3 HCL year-end revision page (`/p3-final`)

One page for the P3 Higher Chinese end-of-year exam (Oct 2026), built from
the school's own handouts in `~/Documents/P3/`:

- 三年级随堂笔记, lessons 1–17 (`SD*.pdf`, `qizi1.pdf`; lessons 13–17 in
  `latest.pdf`) → `public/data/p3hcl/final/vocab.json`
- 句子变变变（一览表） (`latest.pdf` pp. 21–24, `SD1.pdf` with her
  answers) → `sentences.json`
- 高级华文补充练习 (二)(四)(六)(八)(十) and 华文总复习 (一)(二) →
  `questions.json`

The shapes are the interfaces in `src/lib/final/types.ts`. Components are
in `src/components/final/`.

## Tabs

- **复习计划**: one-day schedule checklist (`PlanTab.tsx`; ticks kept in
  localStorage `p3final_plan`).
- **词语**: browse / 自测 / 听写 for each lesson. 不会 marks are kept in
  localStorage `p3final_unknown` and have their own filter.
- **句子变变变**: patterns, with the model answer behind 看答案.
- **练习**: MCQs with the sheet's 解释; open items show a model answer.

## Audio

`scripts/generate_tts.py` collects the page's strings via `add_final()`
(word, 例句, pattern models, quiz stems with the answer filled in). Run it
with the mise python after editing any of the JSON files:

```bash
~/.local/share/mise/installs/python/3.14.6/bin/python scripts/generate_tts.py
```

## Pictures

`public/data/p3hcl/final/pics.json` maps an item id to an image path under
`public/images/p3final/`, shown as a tile by `Pic.tsx` (words in 看/自测/听写;
句子变变变 and 练习 items are supported by id but have none yet). Ids:
`v-<lesson>-<index in lesson>` (`wordPicId`), `s-<pattern>-<item>`,
`q-<set>-<section>-<n>`. Items without an entry show no tile.

The 100 photos are from Pixabay (API search, picked by eye, no Chinese text;
sources in `public/images/p3final/ATTRIBUTION.md`). Only concrete nouns and
actions have one. Google (CAPTCHA) and Bing (junk results) block automated
image search from this network; the Pixabay key lives in
`~/.config/tingxie/keys.env` (`PIXABAY_KEY`). The tile sits above the answer on
听写 cards, so never add an image that shows the word.

An emoji version (6200fe4) was shipped first and removed at the user's request.

## Practice papers

`~/Documents/P3/Exams/` has 2025 P3 HCL papers from other schools, with
answer keys at the back. The plan uses 2025 Nanyang: Paper 1 is on PDF
p. 2, Paper 2 on pp. 3–14 and the answer key on pp. 15–16.
