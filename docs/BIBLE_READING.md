# Bible reading pages (`/bible/<book>/<chapter>`)

A chapter of the Chinese Bible to read along with: every word is tappable
for pinyin + meaning + sound, every verse has its own 🔊, and 读全章 reads
the chapter verse by verse.

Currently one book: 箴言 (Proverbs), 31 chapters, 913 verses.

## Where the text comes from

`https://ebible.org/Scriptures/cmn-cu89s_vpl.zip` — 新标点和合本, simplified,
verse-per-line.

**Use the `_vpl` archive, never the HTML one.** The VPL archive's own
`_about.htm` says all "formatting, paragraph breaks, notes, introductions,
noncanonical section titles, etc., have been removed". That matters legally:

| Edition | Status |
|---|---|
| 和合本 (1919) | public domain — copyright expired |
| 新标点和合本 (1988) | adds punctuation + section headings; headings are the part that is not ours to ship |
| 和合本2010 (RCUV) | copyrighted and enforced — **do not use** (≤1000 verses, no audio, written permission required) |

Taking the VPL archive leaves the 1919 wording plus punctuation, which is the
lowest-risk configuration that is still a modern, readable text. Our own
headings (if we ever add any) are our own.

`build_bible_text.py` enforces this: every line of a VPL file is
`BOOK C:V text`, so a line that is not a verse means the wrong archive, and
the script aborts. It does **not** test heading strings against verse text —
`所罗门的箴言` is genuinely the opening of 1:1, 10:1 and 25:1.

## Pipeline

Run in this order. All three are idempotent.

```bash
PY=~/.local/share/mise/installs/python/3.14.6/bin/python

# 1. verses -> public/data/bible/proverbs_<n>.json   (no deps)
python3 scripts/build_bible_text.py /path/to/cmn-cu89s_vpl.txt 1

# 2. tappable words -> proverbs_<n>_words.json       (jieba + pypinyin + CC-CEDICT)
$PY scripts/build_bible_words.py 1

# 3. audio -> public/audio/tts/<sha256(text)[:16]>.mp3   (edge-tts)
$PY scripts/generate_bible_tts.py 1
```

Omit the chapter numbers to do all 31.

### English — two lines, and the difference matters

Each verse carries **two** English lines, and the page labels both:

| Field | Label | What it is |
|---|---|---|
| `kjv` | `KJV` | King James Version — a real translation, public domain |
| `en` | `简单说` | a hand-written plain-English paraphrase, P2/P3 level |

`kjv` comes from `https://ebible.org/Scriptures/eng-kjv_vpl.zip` (1769
standardised text). `build_bible_text.py` strips the `¶` paragraph marks and
unwraps the `[bracketed]` words the 1611 translators supplied — "A wise [man]
will hear" reads as broken punctuation to a child, and the convention carries
nothing a P3 reader can use.

`en` lives in `public/data/bible/proverbs_en.json`, keyed `"<chapter>:<verse>"`,
**written by hand**. The KJV's archaic English ("to give subtilty to the
simple") is harder than the Chinese, so it does not serve a P2 reader on its
own — that is the only reason the paraphrase exists.

> **Never present `en` as scripture.** It is not a translation and has no
> authority behind it. The page marks it 简单说 on an amber chip and says so
> again in the footer. If that labelling is ever removed, the paraphrase must
> go too.

A verse with no entry is emitted with `"en": ""` and the page omits the line.

#### On the NKJV

Asked for and declined: the NKJV is copyrighted by Thomas Nelson, and their
permissions are cumulative — ~500 verses **and** not a complete book of the
Bible **and** under 25% of the work. Proverbs is 915 verses and *is* a
complete book, so it fails on two counts independently, and "personal,
non-commercial" is not among the conditions. A deployed Worker on a public URL
is distribution. Chapters 1–9 alone (~250 verses) would be inside the
allowance if it ever comes up again; the whole book is not.

#### On the KJV and the Crown patent

eBible's own notice: the KJV is "firmly in the Public Domain" outside the UK.
Letters patent give CUP/OUP/Collins the exclusive right to **print** it in the
UK or import printed copies — a printing restriction, not a restriction on a
web page served from Cloudflare. Safe here; worth knowing before anyone prints
a booklet from it in Britain.

### Audio

Same scheme as the 综合练习 pages: `zh-CN-XiaoxiaoNeural` at `-15%`, written
to `public/audio/tts/<sha256(text)[:16]>.mp3`, which is exactly the key
`src/lib/tts.ts` computes in the browser. Shared folder, so a word that also
appears in a zonghe page is only ever generated once.

Sizing: ~19 hanzi per verse, so the full book is roughly 1.5–2 hours of audio
(~70–100 MB). Chapter 1 alone is ~3 MB. If the whole book is generated, serve
it from R2 (`tingxie-assets`) rather than committing it.

## The word bank

`build_bible_words.py` segments each verse with jieba and glosses every token
in this order: `OVERRIDES` → CC-CEDICT → character-by-character composition.

箴言 is semi-classical, so **CC-CEDICT misses ~30% of the word types here**
(11% of tokens): 我儿, 训诲, 穷乏, 必致, 明哲, 争竞, 贻羞. Without an override
a child taps 我儿 and reads "我 I + 儿 child". Two knobs:

- `OVERRIDES` — a kid-level gloss that beats the dictionary.
- `DEL_WORDS` — jieba splits that are wrong here. 箴言 leans on 必/我/这/自 +
  verb, which jieba glues into non-words (`必杀`, `我要`, `自害己`), and those
  then fall through to composition. Splitting them is better than glossing them.

After adding a chapter, check what still composed:

```bash
$PY -c "
import json; d=json.load(open('public/data/bible/proverbs_1_words.json'))
print([w for w,e in d['dict'].items() if ' + ' in e['en']])"
```

Anything in that list is either a missing override or a bad split.

## The page

| File | Role |
|---|---|
| `src/routes/bible.$book.$chapter.tsx` | route wrapper |
| `src/components/bible/BiblePage.tsx` | the page: verses, 读全章, chapter nav |
| `src/lib/bible/types.ts` | `Verse`, `ChapterData`, `BOOKS` |

Shared with `/zonghe/<week>`, and not to be forked:
`src/components/shared/words.tsx` (`Seg`, `WordSheet`, `WordsCtx`),
`src/components/shared/ui.tsx` (`Card`, `SpeakButton`),
`src/lib/shared/words.ts` (`WordBank`, `WordInfo`, `HAN`).

读全章 chains per-verse clips (the `OralTab.playAll` pattern) rather than
aligning one long recording, so no timestamps are needed. The playing verse
is highlighted and scrolled into view.

## Adding a book

1. Add it to `BOOKS` in `src/lib/bible/types.ts`.
2. Point `BOOK`/`BOOK_ZH` in `build_bible_text.py` at its 3-letter code (`PRO`,
   `PSA`, …) — or generalise the script if we end up with several.
3. Run the three steps above; add a `NAV_ITEMS` entry in `src/lib/constants.ts`.

## Credits

The page footer carries these, and they need to stay:
text 和合本 (public domain) · dictionary CC-CEDICT (CC BY-SA 4.0) · speech synthesis.
