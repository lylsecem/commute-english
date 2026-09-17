"""抓取各英语节目的 RSS，生成 playlist.js 供 index.html 直接播放。

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

CHANNELS = [
    # stage: 1 = 零基础, 2 = 入门, 3 = 进阶
    dict(id="eim", stage=1, name="English in a Minute", org="VOA",
         desc="每期 1 分钟讲一个日常说法，连着听不累。",
         feed="https://learningenglish.voanews.com/podcast/video.aspx?zoneId=3619"),
    dict(id="tews", stage=1, name="The English We Speak", org="BBC",
         desc="3 分钟小情景讲一个口语表达。",
         feed="https://podcasts.files.bbci.co.uk/p02pc9zn.rss"),
    dict(id="echo", stage=1, name="The English Echo", org="Podcast",
         desc="为初学者做的慢速英语听力。",
         feed="https://anchor.fm/s/f79395d4/podcast/rss"),
    dict(id="eslpod", stage=2, name="ESLPod", org="ESLPod.com",
         desc="慢速对话 + 逐句讲解 + 正常语速再读一遍。",
         feed="https://www.eslpod.com/feed.xml"),
    dict(id="cbe", stage=2, name="Coffee Break English", org="Coffee Break",
         desc="老师带学生上课，讲解耐心。",
         feed="https://feeds.acast.com/public/shows/183d2cc4-50d2-420f-a306-40dae4a0bfa7"),
    dict(id="stories", stage=2, name="Learning English Stories", org="BBC",
         desc="几分钟一个简化版的经典故事。",
         feed="https://podcasts.files.bbci.co.uk/p02pc9s1.rss"),
    dict(id="words", stage=3, name="Words and Their Stories", org="VOA",
         desc="讲词语和习语背后的故事，语速慢。",
         feed="https://learningenglish.voanews.com/podcast/?zoneId=987"),
    dict(id="6min", stage=3, name="6 Minute English", org="BBC",
         desc="两人聊一个话题，顺带讲 6 个词。",
         feed="https://podcasts.files.bbci.co.uk/p02pc9tn.rss"),
]


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


def main():
    out = []
    for ch in CHANNELS:
        try:
            eps = parse(fetch(ch["feed"]))
        except Exception as ex:
            print(f"[失败] {ch['name']}: {ex}", file=sys.stderr)
            continue
        latest = eps[0]["d"] if eps else "-"
        print(f"[OK] {ch['name']}: {len(eps)} 期，最新 {latest}")
        out.append({k: v for k, v in ch.items() if k != "feed"} | {"episodes": eps})
    data = {"updated": datetime.now().strftime("%Y-%m-%d"), "channels": out}
    js = "window.PLAYLIST = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n"
    Path(__file__).with_name("playlist.js").write_text(js, encoding="utf-8")
    print("已写入 playlist.js")


if __name__ == "__main__":
    main()
