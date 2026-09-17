"""读取 channels.json，抓取各节目的 RSS，生成 playlist.js 供 index.html 直接播放。

用法：python update_playlist.py   （建议每周运行一次拿到新节目）
"""
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime
from email.utils import parsedate_to_datetime
from pathlib import Path

PER_CHANNEL = 40
ITUNES = "{http://www.itunes.com/dtds/podcast-1.0.dtd}"

CHANNELS_FILE = Path(__file__).with_name("channels.json")


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


def main():
    channels = json.loads(CHANNELS_FILE.read_text(encoding="utf-8"))
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
        print(f"[OK] {ch['name']}: {len(eps)} 期，最新 {eps[0]['d']}")
        keep = {k: ch[k] for k in ("id", "stage", "name", "org", "desc") if k in ch}
        out.append(keep | {"episodes": eps})
    data = {"updated": datetime.now().strftime("%Y-%m-%d"), "channels": out}
    js = "window.PLAYLIST = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n"
    Path(__file__).with_name("playlist.js").write_text(js, encoding="utf-8")
    print("已写入 playlist.js")


if __name__ == "__main__":
    main()
