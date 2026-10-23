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

`public/data/p3hcl/final/pics.json` maps an item id to 1–3 emoji, shown as a
tile by `Pic.tsx` (words in 看/自测/听写, 句子变变变 items, 练习 questions).
Ids: `v-<lesson>-<index in lesson>` (`wordPicId`), `s-<pattern>-<item>`,
`q-<set>-<section>-<n>`. Particles and pure spelling questions have no entry
and show no tile. Emoji, not photos: Google and Bing both block automated
image search from this network (CAPTCHA / junk results), and emoji can never
spell out the answer on a 听写 card. After adding items, give them an id here.

## Practice papers

`~/Documents/P3/Exams/` has 2025 P3 HCL papers from other schools, with
answer keys at the back. The plan uses 2025 Nanyang: Paper 1 is on PDF
p. 2, Paper 2 on pp. 3–14 and the answer key on pp. 15–16.
