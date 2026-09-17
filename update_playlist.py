"""生成网页用的数据文件。

- channels.json + audio/<节目名>/*.mp3  ->  playlist.js
- courses/<场景名>.txt                  ->  custom_courses.js

用法：python update_playlist.py   （建议每周运行一次拿到新节目）
"""
import hashlib
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime
from email.utils import parsedate_to_datetime
from pathlib import Path
from urllib.parse import quote

PER_CHANNEL = 40
ITUNES = "{http://www.itunes.com/dtds/podcast-1.0.dtd}"

ROOT = Path(__file__).parent
CHANNELS_FILE = ROOT / "channels.json"
AUDIO_DIR = ROOT / "audio"
COURSES_DIR = ROOT / "courses"
AUDIO_EXT = {".mp3", ".m4a", ".aac", ".ogg", ".wav"}


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (commute-english playlist)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def seconds(text):
    if not text:
        return 0
    text = text.strip()
    if text.isdigit():
        return int(text)
    parts = [int(p) for p in re.findall(r"\d+", text)]
    total = 0
    for p in parts[-3:]:
        total = total * 60 + p
    return total


def https(url):
    url = url.replace("/proto/http/", "/proto/https/")
    return "https://" + url[len("http://"):] if url.startswith("http://") else url


def parse(raw):
    channel = ET.fromstring(raw).find("channel")
    episodes = []
    for item in channel.findall("item"):
        enc = item.find("enclosure")
        if enc is None or not enc.get("url"):
            continue
        try:
            date = parsedate_to_datetime(item.findtext("pubDate")).strftime("%Y-%m-%d")
        except Exception:
            date = ""
        title = re.sub(r"\s+-\s+\w+ \d{1,2}, \d{4}$", "", (item.findtext("title") or "").strip())
        episodes.append(dict(t=title, d=date, s=seconds(item.findtext(ITUNES + "duration")), u=https(enc.get("url"))))
    episodes.sort(key=lambda e: e["d"], reverse=True)
    return episodes[:PER_CHANNEL]


def build(ch):
    """三种写法：feed = RSS 播客；live = 直播流地址；episodes = 手动列出的音频。"""
    if ch.get("feed"):
        return parse(fetch(ch["feed"]))
    if ch.get("live"):
        return [dict(t=ch["name"] + " 直播", d="直播", s=0, u=https(ch["live"]), live=True)]
    return [dict(t=e["title"], d=e.get("date", ""), s=seconds(str(e.get("duration", ""))), u=e["url"])
            for e in ch.get("episodes", [])]


def natural(path):
    return [int(x) if x.isdigit() else x.lower() for x in re.split(r"(\d+)", path.name)]


def short_id(prefix, text):
    return prefix + hashlib.md5(text.encode("utf-8")).hexdigest()[:8]


def folder_channels():
    """audio/ 下每个文件夹是一个节目，文件夹里的音频按文件名排序，文件夹里的 说明.txt 作为介绍。"""
    if not AUDIO_DIR.is_dir():
        return []
    channels = []
    for folder in sorted((d for d in AUDIO_DIR.iterdir() if d.is_dir()), key=natural):
        files = sorted((f for f in folder.iterdir() if f.suffix.lower() in AUDIO_EXT), key=natural)
        note = folder / "说明.txt"
        desc = note.read_text(encoding="utf-8-sig").strip().split("\n")[0] if note.is_file() else ""
        channels.append(dict(
            id=short_id("my-", folder.name), stage=1, name=folder.name, org="我的音频",
            desc=desc or "自己上传的音频。",
            episodes=[dict(title=f.stem, url=quote(f.relative_to(ROOT).as_posix())) for f in files]))
    return channels


def build_courses():
    """courses/ 下每个 .txt 是一个场景：# 开头是说明，其余每行 “英文 | 中文”。"""
    scenes = []
    if COURSES_DIR.is_dir():
        for f in sorted(COURSES_DIR.glob("*.txt"), key=natural):
            note, items = "", []
            for line in f.read_text(encoding="utf-8-sig").splitlines():
                line = line.strip()
                if not line:
                    continue
                if line.startswith("#"):
                    note = note or line.lstrip("# ")
                    continue
                en, _, zh = line.replace("｜", "|").partition("|")
                items.append([en.strip(), zh.strip()])
            if items:
                scenes.append(dict(id=short_id("c-", f.stem), name=f.stem, note=note, items=items))
                print(f"[课程] {f.stem}: {len(items)} 句")
    js = "window.CUSTOM_SCENES = " + json.dumps(scenes, ensure_ascii=False, indent=1) + ";\n"
    (ROOT / "custom_courses.js").write_text(js, encoding="utf-8")


def main():
    build_courses()
    channels = folder_channels() + json.loads(CHANNELS_FILE.read_text(encoding="utf-8"))
    out = []
    for ch in channels:
        stage = ch.get("stage")
        if stage not in (1, 2, 3):
            print(f"[提示] {ch.get('name')}: stage 应为 1/2/3，已按 2（入门）处理", file=sys.stderr)
            ch["stage"] = 2
        try:
            eps = build(ch)
        except Exception as ex:
            print(f"[失败] {ch.get('name')}: {ex}", file=sys.stderr)
            continue
        if not eps:
            print(f"[跳过] {ch['name']}: 没有可播放的内容", file=sys.stderr)
            continue
        print(f"[OK] {ch['name']}: {len(eps)} 期" + (f"，最新 {eps[0]['d']}" if eps[0]["d"] else ""))
        keep = {k: ch[k] for k in ("id", "stage", "name", "org", "desc") if k in ch}
        out.append(keep | {"episodes": eps})
    data = {"updated": datetime.now().strftime("%Y-%m-%d"), "channels": out}
    js = "window.PLAYLIST = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n"
    (ROOT / "playlist.js").write_text(js, encoding="utf-8")
    print("已写入 playlist.js")


if __name__ == "__main__":
    main()
