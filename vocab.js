/* 单词打卡：每日任务 + 按键拼写 + 间隔复习 + 打卡日历
   依赖 index.html 里的 $、esc、store、speak、stopSpeech 等全局函数。 */
(() => {
  const BOOKS = window.WORD_BOOKS || [];
  const KEY = "vocab";
  const INTERVAL = [0, 1, 2, 4, 7, 15, 30];   // 熟练度 1–6 对应的复习间隔（天）
  const MAX_REVIEW = 60;

  const pad = n => String(n).padStart(2, "0");
  const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = () => ymd(new Date());
  const addDays = (s, n) => { const [y, m, d] = s.split("-").map(Number); return ymd(new Date(y, m - 1, d + n)); };

  const vs = Object.assign({ book: null, perDay: 10, remind: "20:00", cards: {}, days: {} }, store.get(KEY, {}));
  const save = () => store.set(KEY, vs);

  const zhOf = {};
  BOOKS.forEach(b => b.items.forEach(([en, zh]) => { if (!(en in zhOf)) zhOf[en] = zh; }));
  const currentBook = () => BOOKS.find(b => b.id === vs.book) || BOOKS[0];

  if (!BOOKS.length) {
    $("vMeta").textContent = "没有找到词书（words.js）。";
    $("vStart").disabled = true;
    return;
  }
  if (!vs.book) vs.book = BOOKS[0].id;

  /* ---------- 今日任务 ---------- */
  function ensureTask() {
    const t = today();
    let d = vs.days[t];
    const stale = d && !d.checked && d.done.length === 0 && (d.book !== vs.book || d.perDay !== vs.perDay);
    if (!d || stale) {
      const review = Object.entries(vs.cards)
        .filter(([w, c]) => c.due <= t && w in zhOf)
        .sort((a, b) => a[1].due.localeCompare(b[1].due))
        .slice(0, MAX_REVIEW).map(([w]) => w);
      const fresh = currentBook().items.map(i => i[0]).filter(w => !vs.cards[w]).slice(0, vs.perDay);
      d = vs.days[t] = { book: vs.book, perDay: vs.perDay, review, fresh, done: [], learned: [], graded: {}, checked: false };
      save();
    }
    return d;
  }

  function grade(d, w, ok) {
    if (d.graded[w]) return;
    d.graded[w] = 1;
    const c = vs.cards[w] || { box: 0, seen: 0, wrong: 0 };
    c.seen++;
    if (ok) c.box = Math.min(c.box + 1, 6); else { c.box = 1; c.wrong++; }
    c.due = addDays(today(), INTERVAL[c.box]);
    vs.cards[w] = c;
    save();
  }

  function streak() {
    let d = today(), n = 0;
    if (!vs.days[d]?.checked) d = addDays(d, -1);
    while (vs.days[d]?.checked) { n++; d = addDays(d, -1); }
    return n;
  }

  /* ---------- 主页卡片 ---------- */
  function render() {
    const d = ensureTask();
    const total = d.review.length + d.fresh.length;
    const done = d.checked ? total : d.done.length;
    $("vDone").textContent = done;
    $("vTotal").textContent = total;
    $("vBar").style.width = total ? `${done / total * 100}%` : "0";
    $("vStreak").textContent = streak();

    const now = new Date(), late = !d.checked && `${pad(now.getHours())}:${pad(now.getMinutes())}` > vs.remind;
    const meta = $("vMeta");
    if (!total) {
      meta.textContent = "今天没有要学或复习的词。这本词书已经学完，可以换一本。";
    } else if (d.checked) {
      meta.textContent = `今日已打卡 ✓ ${d.time || ""}  ·  新词 ${d.fresh.length} · 复习 ${d.review.length}`;
    } else {
      meta.textContent = `新词 ${d.fresh.length} · 复习 ${d.review.length}  ·  ${late ? `已过 ${vs.remind}，还没打卡` : `${vs.remind} 前完成`}`;
    }
    meta.classList.toggle("vlate", late && total > 0);
    $("vStart").disabled = !total;
    $("vStart").textContent = d.checked ? "再练一遍今天的词" : d.done.length ? "继续今天的任务" : "开始今天的任务";

    const b = currentBook(), words = b.items.map(i => i[0]);
    const learned = words.filter(w => vs.cards[w]).length, solid = words.filter(w => vs.cards[w]?.box >= 4).length;
    $("vBookProg").innerHTML = `<div class="vbar"><i style="width:${learned / words.length * 100}%"></i></div>
      <span>已学 ${learned} / ${words.length} 词 · 掌握牢固 ${solid} 词</span>`;
    renderCalendar();
  }

  function renderCalendar() {
    const now = new Date(), y = now.getFullYear(), m = now.getMonth(), t = today();
    const first = (new Date(y, m, 1).getDay() + 6) % 7;   // 周一为一周第一天
    const days = new Date(y, m + 1, 0).getDate();
    let html = "一二三四五六日".split("").map(w => `<span class="wd">${w}</span>`).join("");
    html += "<span></span>".repeat(first);
    let count = 0;
    for (let i = 1; i <= days; i++) {
      const ds = `${y}-${pad(m + 1)}-${pad(i)}`, on = vs.days[ds]?.checked;
      if (on) count++;
      html += `<span class="${on ? "on" : ""}${ds === t ? " today" : ""}${ds > t ? " future" : ""}" title="${ds}${on ? " 已打卡" : ""}">${i}</span>`;
    }
    $("vCal").innerHTML = html;
    $("vMonth").textContent = `${y} 年 ${m + 1} 月`;
    $("vMonthCount").textContent = `本月打卡 ${count} 天`;
  }

  /* ---------- 设置 ---------- */
  $("vBook").innerHTML = BOOKS.map(b => `<option value="${esc(b.id)}">${esc(b.name)}（${b.items.length} 词）</option>`).join("");
  $("vBook").value = currentBook().id;
  $("vPerDay").value = String(vs.perDay);
  $("vRemind").value = vs.remind;
  $("vBook").onchange = () => { vs.book = $("vBook").value; save(); render(); };
  $("vPerDay").onchange = () => { vs.perDay = +$("vPerDay").value; save(); render(); };
  $("vRemind").onchange = () => { vs.remind = $("vRemind").value || "20:00"; save(); render(); };

  $("vIcs").onclick = () => {
    const [hh, mm] = vs.remind.split(":");
    const start = today().replace(/-/g, "") + `T${hh}${mm}00`;
    const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
    const url = location.href.split("#")[0] + "#words";
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//commute-english//vocab//CN", "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT", `UID:vocab-daily-${Date.now()}@commute-english`, `DTSTAMP:${stamp}`,
      `DTSTART:${start}`, "DURATION:PT15M", "RRULE:FREQ=DAILY",
      "SUMMARY:单词打卡", `DESCRIPTION:完成今天的单词任务：${url}`, `URL:${url}`,
      "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:单词打卡", "TRIGGER:PT0M", "END:VALARM",
      "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    a.download = "单词打卡提醒.ics";
    document.body.appendChild(a); a.click(); a.remove();
    $("vSetHint").textContent = `已生成提醒文件，打开后选择“添加到日历”，每天 ${vs.remind} 提醒。`;
  };

  /* ---------- 练习 ---------- */
  const ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
  $("vKb").innerHTML = ROWS.map(r => `<div class="row">${[...r].map(k => `<button type="button" data-k="${k}">${k}</button>`).join("")}</div>`).join("");

  let S = null;   // 当前练习状态

  const isLetter = ch => /[a-z]/i.test(ch);
  const say = w => { if (typeof playing !== "undefined" && playing) { playing = false; stopSpeech(); setPlayIcon(); } $("audio").pause(); speak(w, "en-US", 0.85); };

  function open() {
    const d = ensureTask();
    const all = [...d.review, ...d.fresh];
    const extra = d.checked;
    S = { d, extra, total: all.length, queue: extra ? [...all] : all.filter(w => !d.done.includes(w)), word: null, pos: 0, miss: 0, lock: false, doneExtra: 0, started: Date.now() };
    $("vModal").hidden = false;
    document.body.style.overflow = "hidden";
    next();
  }
  function close() {
    $("vModal").hidden = true;
    document.body.style.overflow = "";
    if (synth) synth.cancel();
    S = null;
    render();
  }
  function show(view) {
    ["vLearn", "vSpell", "vFinish"].forEach(id => { $(id).hidden = id !== view; });
    $("vKb").hidden = view !== "vSpell";
  }
  function progress() {
    const n = S.extra ? S.doneExtra : S.d.done.length;
    $("vqBar").style.width = `${n / S.total * 100}%`;
    $("vqCount").textContent = `${n} / ${S.total}`;
  }

  function next() {
    progress();
    if (!S.queue.length) return finish();
    const w = S.word = S.queue.shift();
    S.pos = 0; S.miss = 0; S.lock = false;
    const isNew = !S.extra && S.d.fresh.includes(w) && !S.d.learned.includes(w);
    if (isNew) {
      $("vlWord").textContent = w;
      $("vlZh").textContent = zhOf[w] || "";
      show("vLearn");
      say(w);
      $("vlGo").focus();
    } else spell();
  }

  function spell() {
    const w = S.word;
    if (!S.extra && !S.d.learned.includes(w) && S.d.fresh.includes(w)) { S.d.learned.push(w); save(); }
    $("vsTag").textContent = S.extra ? "巩固" : S.d.fresh.includes(w) ? "新词拼写" : "复习";
    $("vsZh").textContent = zhOf[w] || "";
    $("vFb").textContent = ""; $("vFb").className = "vfb";
    skipFixed();
    drawSlots();
    show("vSpell");
    say(w);
  }
  function skipFixed() { while (S.pos < S.word.length && !isLetter(S.word[S.pos])) S.pos++; }
  function drawSlots(reveal) {
    $("vSlots").innerHTML = [...S.word].map((ch, i) => {
      if (ch === " ") return `<span class="gap"></span>`;
      if (!isLetter(ch)) return `<span class="fill">${esc(ch)}</span>`;
      if (i < S.pos) return `<span class="fill">${esc(ch)}</span>`;
      if (reveal) return `<span class="miss">${esc(ch)}</span>`;
      return `<span class="${i === S.pos ? "cur" : ""}"></span>`;
    }).join("");
  }

  function press(k) {
    if (!S || S.lock || $("vSpell").hidden) return;
    k = k.toLowerCase();
    if (k === S.word[S.pos].toLowerCase()) {
      S.pos++; skipFixed(); drawSlots();
      if (S.pos >= S.word.length) complete();
      return;
    }
    S.miss++;
    const btn = $("vKb").querySelector(`[data-k="${k}"]`);
    if (btn) { btn.classList.add("bad"); setTimeout(() => btn.classList.remove("bad"), 350); }
    const slots = $("vSlots"); slots.classList.remove("shake"); void slots.offsetWidth; slots.classList.add("shake");
    $("vFb").className = "vfb bad";
    $("vFb").textContent = S.miss >= 3 ? "想不起来可以点“提示一个字母”" : "不对，再想想";
  }

  function hint() {
    if (!S || S.lock) return;
    S.miss++;
    S.pos++; skipFixed(); drawSlots();
    $("vFb").className = "vfb"; $("vFb").textContent = "已提示一个字母";
    if (S.pos >= S.word.length) complete();
  }

  function giveUp() {
    if (!S || S.lock) return;
    S.lock = true; S.miss = Math.max(S.miss, 1);
    drawSlots(true);
    $("vFb").className = "vfb bad"; $("vFb").textContent = "记一下，这个词稍后会再考一次";
    say(S.word);
    if (!S.extra) grade(S.d, S.word, false);
    S.queue.push(S.word);
    setTimeout(() => S && next(), 2200);
  }

  function complete() {
    S.lock = true;
    const w = S.word, perfect = S.miss === 0;
    say(w);
    if (!S.extra) grade(S.d, w, perfect);
    if (perfect) {
      $("vFb").className = "vfb ok"; $("vFb").textContent = "✓ 拼对了";
      if (S.extra) S.doneExtra++; else { S.d.done.push(w); save(); }
    } else {
      $("vFb").className = "vfb"; $("vFb").textContent = "拼出来了，有错误，稍后再来一遍";
      S.queue.push(w);
    }
    setTimeout(() => S && next(), perfect ? 900 : 1600);
  }

  function finish() {
    const d = S.d;
    if (!S.extra && !d.checked) {
      const now = new Date();
      d.checked = true; d.time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
      save();
    }
    const mins = Math.max(1, Math.round((Date.now() - S.started) / 60000));
    $("vfTitle").textContent = S.extra ? "巩固完成" : "今日打卡成功";
    $("vfText").textContent = S.extra
      ? `又把今天的 ${S.total} 个词拼了一遍。`
      : `新词 ${d.fresh.length} 个 · 复习 ${d.review.length} 个 · 用时约 ${mins} 分钟`;
    $("vfStreak").textContent = streak();
    show("vFinish");
    $("vfClose").focus();
  }

  $("vStart").onclick = open;
  $("vClose").onclick = close;
  $("vfClose").onclick = close;
  $("vlGo").onclick = spell;
  $("vlSay").onclick = () => say(S.word);
  $("vsSay").onclick = () => say(S.word);
  $("vHint").onclick = hint;
  $("vGiveUp").onclick = giveUp;
  $("vKb").addEventListener("pointerdown", e => { const b = e.target.closest("button"); if (b) { e.preventDefault(); press(b.dataset.k); } });
  document.addEventListener("keydown", e => {
    if ($("vModal").hidden || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "Escape") return close();
    if (!$("vLearn").hidden && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); return spell(); }
    if (!$("vFinish").hidden && e.key === "Enter") { e.preventDefault(); return close(); }
    if (/^[a-z]$/i.test(e.key)) { e.preventDefault(); press(e.key); }
  });

  render();
  document.addEventListener("visibilitychange", () => { if (!document.hidden && !S) render(); });
})();
