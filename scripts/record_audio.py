#!/usr/bin/env python3
"""
Guided recorder for tingxie audio. NO TTS — records a real human voice.

Usage:
    python3 scripts/record_audio.py            # record everything still missing
    python3 scripts/record_audio.py --list     # just show what's missing
    python3 scripts/record_audio.py --redo 我们要认真学习，不浪费大好时光。

Controls per item:
    ENTER  start recording, ENTER again to stop
    r      re-record the item
    s      skip
    q      quit (progress is kept — already-saved files are never re-asked)
"""
import json, os, re, shutil, subprocess, sys, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUB = ROOT / "public"

def collect():
    items = []
    school = json.loads((PUB/"data/tingxie/school_vocabulary.json").read_text())
    for r in school["vocabulary"]:
        for it in r["items"]:
            a = it.get("audio")
            if a:
                items.append((r["title"], it.get("characters") or it.get("sentence",""), a))
    vocab = json.loads((PUB/"data/tingxie/tingxie_vocabulary.json").read_text())
    for r in vocab["vocabulary"]:
        for w in r["words"]:
            if w.get("audio"):
                items.append((f"词语 row{r['row']}", w["simplified"], w["audio"]))
    return items

def missing(items):
    return [(s,t,a) for s,t,a in items if not (PUB/a).exists()]

AUDIO_SOURCE = os.environ.get("TINGXIE_MIC")  # pactl source name, optional

def RECORD_CMD(wav):
    """Prefer pw-record (PipeWire) so we follow the system default mic."""
    if shutil.which("pw-record"):
        cmd = ["pw-record", "--rate", "44100", "--channels", "1"]
        if AUDIO_SOURCE:
            cmd += ["--target", AUDIO_SOURCE]
        return cmd + [wav]
    if shutil.which("parec") and shutil.which("sox"):
        return ["parecord", "--file-format=wav", wav]
    return ["arecord", "-q", "-f", "cd", "-t", "wav", wav]

def check_level(path):
    """Return (mean_db, max_db) so we can warn about a silent/dead mic."""
    r = subprocess.run(["ffmpeg","-i",str(path),"-af","volumedetect","-f","null","-"],
                       capture_output=True, text=True)
    out = r.stderr
    def grab(k):
        m = re.search(k + r": (-?[0-9.]+) dB", out)
        return float(m.group(1)) if m else None
    return grab("mean_volume"), grab("max_volume")

def record_one(dest: Path):
    """ENTER to start, ENTER to stop. Returns True if saved."""
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tf:
        wav = tf.name
    input("      ⏺  ENTER to START recording...")
    proc = subprocess.Popen(RECORD_CMD(wav),
        stdin=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    input("      ⏹  recording... ENTER to STOP.")
    proc.terminate(); proc.wait()
    mean, peak = check_level(wav)
    if peak is not None and peak < -50:
        print(f"      ⚠ almost no sound captured (peak {peak:.0f} dB).")
        print("        Check the input device:  pactl list short sources")
        print("        then re-run with:  TINGXIE_MIC=<source-name> python3 scripts/record_audio.py")
    dest.parent.mkdir(parents=True, exist_ok=True)
    # trim leading/trailing silence, normalise, encode mp3
    r = subprocess.run(
        ["ffmpeg","-y","-i",wav,
         "-af","silenceremove=start_periods=1:start_silence=0.1:start_threshold=-45dB:"
               "stop_periods=-1:stop_silence=0.3:stop_threshold=-45dB,loudnorm=I=-16:TP=-1.5:LRA=11",
         "-codec:a","libmp3lame","-b:a","64k","-ar","44100","-ac","1", str(dest)],
        capture_output=True)
    os.unlink(wav)
    if r.returncode != 0 or not dest.exists() or dest.stat().st_size < 800:
        print("      ✗ encode failed / too short")
        if dest.exists(): dest.unlink()
        return False
    dur = subprocess.run(["ffprobe","-v","error","-show_entries","format=duration",
                          "-of","csv=p=0",str(dest)],capture_output=True,text=True).stdout.strip()
    print(f"      ✓ saved {dest.name}  ({float(dur):.2f}s)")
    return True

def play(p: Path):
    subprocess.run(["ffplay","-nodisp","-autoexit","-loglevel","quiet",str(p)])

def main():
    args = sys.argv[1:]
    items = collect()
    if "--list" in args:
        m = missing(items)
        print(f"{len(m)} missing of {len(items)} total\n")
        cur=None
        for s,t,a in m:
            if s!=cur: print(f"\n{s}"); cur=s
            print(f"  • {t}")
        return
    if "--redo" in args:
        target = args[args.index("--redo")+1]
        todo = [(s,t,a) for s,t,a in items if t == target or Path(a).stem == target]
        if not todo:
            print("no match for", target); return
    else:
        todo = missing(items)

    if not todo:
        print("Nothing to record — every item already has audio. 🎉"); return

    print(f"\n{len(todo)} item(s) to record.")
    print("Speak clearly at normal dictation pace. Silence is trimmed automatically.\n")
    done = 0
    for n,(s,t,a) in enumerate(todo,1):
        dest = PUB/a
        print(f"[{n}/{len(todo)}] {s}")
        print(f"      「{t}」")
        while True:
            if not record_one(dest):
                if input("      retry? [Y/n] ").lower().startswith("n"): break
                continue
            c = input("      ENTER=keep  p=play  r=redo  q=quit : ").strip().lower()
            if c == "p":
                play(dest); c = input("      ENTER=keep  r=redo : ").strip().lower()
            if c == "r": continue
            if c == "q":
                print(f"\nStopped. {done} recorded this session."); return
            done += 1
            break
    print(f"\n✅ Done — {done} recorded.")
    left = missing(collect())
    print(f"{len(left)} still missing." if left else "All items now have audio. 🎉")

if __name__ == "__main__":
    main()
