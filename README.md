# 通勤英语

零基础日常英语：开车磨耳朵、英语广播、场景句库。

网页地址：https://lylsecem.github.io/commute-english/

## 最简单的两种方式（不用碰代码）

### 加课程：写一个 txt

1. 打开仓库的 `courses` 文件夹，点 **Add file → Create new file**
2. 文件名写场景名，比如 `看病.txt`
3. 内容每行一句，英文和中文用 `|` 隔开，`#` 开头的一行是说明：

```
# 医院、药店。
I don't feel well. | 我不舒服。
I have a headache. | 我头疼。
```

4. 点 **Commit changes**。1–2 分钟后刷新网页，句库和磨耳朵播放器里就有“看病”了。

`courses/看病.txt` 已经是现成的例子，可以照着改。

### 加音频：上传一个文件夹

1. 打开仓库的 `audio` 文件夹，点 **Add file → Create new file**
2. 文件名输入 `我的听力课/说明.txt`（输入 `/` 会自动变成文件夹），内容写一句介绍，提交
3. 进入新建的 `我的听力课` 文件夹，点 **Add file → Upload files**，把 mp3 拖进去，提交
4. 1–2 分钟后刷新网页，广播里最前面就是“我的听力课”

- 文件夹名 = 节目名，文件名 = 每期标题
- 按文件名里的数字排序，建议写成 `01 xxx.mp3`、`02 xxx.mp3`
- 支持 mp3 / m4a / aac / ogg / wav；网页上传单个文件不超过 25MB
- **仓库是公开的，上传的音频任何人都能访问，只放你有权分享的内容**

在电脑上也可以一次拖入整个文件夹（桌面版浏览器支持），会保留文件夹结构。

---

## 文件一览

| 文件 | 作用 | 要不要改 |
|---|---|---|
| `courses/*.txt` | 自己加的课程 | **加课程改这里** |
| `audio/<节目名>/` | 自己上传的音频 | **加音频放这里** |
| `channels.json` | 网上的播客 / 直播电台 | 加网络广播改这里 |
| `courses.js` | 内置的 9 个场景、8 周路线 | 想改内置内容时改 |
| `playlist.js`、`custom_courses.js` | 自动生成 | 不要手改 |
| `index.html`、`update_playlist.py` | 页面和脚本 | 不用改 |

---

## 一、修改内置课程（courses.js）

打开 `courses.js`，在 `scenes: [` 里照着已有的格式加一段：

```js
  {id:"doctor", name:"看病", note:"医院、药店。", items:[
    ["I don't feel well.", "我不舒服。"],
    ["I have a headache.", "我头疼。"],
    ["Where is the pharmacy?", "药店在哪？"]
  ]},
```

- `id`：英文小写，不能和别的场景重复。
- `items`：每句是 `["英文", "中文"]`，句子之间用英文逗号隔开。
- 加好后，磨耳朵播放器的“场景”下拉框和句库里会自动出现。

在已有场景里加句子也一样，往 `items` 里多写一行。

8 周路线在 `weeks: [` 里，每周是 `["标题", "说明"]`。

**常见错误**：漏了逗号、用了中文引号 “ ”、括号没配对。改完页面空白就检查这三点。

---

## 二、添加网络广播（channels.json）

打开 `channels.json`，在最后一个 `}` 后面加逗号，再加一段。有三种写法：

### 1. 播客（有 RSS 地址，最推荐）

```json
  {"id": "culips", "stage": 2, "name": "Culips", "org": "Culips",
   "desc": "日常口语对话。",
   "feed": "https://esl.culips.com/feed/podcast/"}
```

会自动抓最近 40 期，每周一自动更新。

**怎么找 RSS 地址**：在浏览器打开下面的地址，把最后的节目名换成你要找的：

```
https://itunes.apple.com/search?media=podcast&limit=5&term=节目名
```

结果里 `"feedUrl"` 后面那串就是 RSS 地址。

### 2. 直播电台（24 小时直播流）

```json
  {"id": "bbcws", "stage": 3, "name": "BBC World Service", "org": "BBC 直播",
   "desc": "24 小时英语新闻广播。",
   "live": "https://stream.live.vc.bbcmedia.co.uk/bbc_world_service"}
```

直播地址必须是 `https://` 开头、能直接出声的音频流（mp3/aac）。`.m3u8` 格式的流在部分安卓浏览器上放不了。

### 3. 自己的音频（手动列出每一期）

```json
  {"id": "mine", "stage": 1, "name": "我的课程", "org": "自制",
   "desc": "自己收集的音频。",
   "episodes": [
     {"title": "第 1 课", "url": "https://example.com/lesson1.mp3", "duration": "5:30"},
     {"title": "第 2 课", "url": "https://example.com/lesson2.mp3"}
   ]}
```

音频要能通过 `https://` 网址直接访问。

### 字段说明

| 字段 | 说明 |
|---|---|
| `id` | 英文小写，不能重复 |
| `stage` | 难度：`1` 零基础、`2` 入门、`3` 进阶 |
| `name` / `org` / `desc` | 节目名、来源、一句介绍 |
| `feed` / `live` / `episodes` | 三选一 |

**删除节目**：把那一整段 `{...}` 连同前面的逗号删掉。
**调顺序**：页面按文件里的顺序显示。

### 改完之后

在 GitHub 上提交后，会自动运行“更新节目和课程”，1–2 分钟后网页上就有新节目。
到仓库的 **Actions** 页面能看到运行结果：绿色勾表示成功；红色叉点进去看日志，一般是 JSON 格式写错了（比如最后一项后面多了逗号）。

---

## 在电脑上改（可选）

```bash
python update_playlist.py
python -m http.server 8000
```

浏览器打开 http://localhost:8000 预览，没问题再 `git add -A && git commit -m "..." && git push`。
