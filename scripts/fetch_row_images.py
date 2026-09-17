#!/usr/bin/env python3
"""Fetch candidate photos for a vocabulary word from Bing image search.

    python3 scripts/fetch_row_images.py <slug> "<english query>"

Downloads up to 5 candidates into cand/<slug>/ plus a sources.json recording
each source URL. ALWAYS review the candidates visually before installing one:
image search regularly returns off-topic results, watermarked stock previews,
or pictures with text baked in (which would leak the answer). Install the
chosen file with:

    magick <candidate> -resize 800x600^ -gravity center -extent 800x600 \\
        -strip public/images/<word>.png
"""
import re, sys, json, subprocess
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36"
OUT = Path("cand")

def urls(q, n=14):
    r = Request(f"https://www.bing.com/images/search?q={quote(q)}&qft=+filterui:imagesize-large",
                headers={"User-Agent": UA})
    html = urlopen(r, timeout=25).read().decode("utf-8", "ignore")
    found, seen = [], set()
    for m in re.findall(r'murl&quot;:&quot;(.*?)&quot;', html):
        u = m.replace("\\u0026", "&")
        if u in seen: continue
        seen.add(u); found.append(u)
        if len(found) >= n: break
    return found

def main():
    slug, q = sys.argv[1], sys.argv[2]
    d = OUT / slug; d.mkdir(parents=True, exist_ok=True)
    got = []
    for i, u in enumerate(urls(q)):
        ext = ".png" if ".png" in u.lower() else ".jpg"
        p = d / f"{i:02d}{ext}"
        try:
            hdr = {"User-Agent": UA, "Referer": "https://www.bing.com/",
                   "Accept": "image/avif,image/webp,image/png,image/jpeg,*/*"}
            data = urlopen(Request(u, headers=hdr), timeout=20).read()
            if len(data) < 8000: continue

            p.write_bytes(data)
            got.append((str(p), u))
        except Exception:
            continue
        if len(got) >= 5: break
    (d / "sources.json").write_text(json.dumps(got, indent=1))
    print(f"{slug}: {len(got)} candidates")

main()
