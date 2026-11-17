/* ============================================
   W3LEARN — MAIN.JS v2.0
   Dark Mode, Run, Copy, Quiz, Progress,
   Bookmark, Toast, Scroll Reveal, Mobile
   ============================================ */

// ── DARK MODE ──
const darkBtn = document.getElementById('darkBtn');
const applyTheme = () => {
  const isDark = localStorage.getItem('theme') !== 'light';
  document.body.classList.toggle('light', !isDark);
  if (darkBtn) darkBtn.textContent = isDark ? '☀️' : '🌙';
};
applyTheme();
if (darkBtn) {
  darkBtn.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    darkBtn.textContent = isLight ? '🌙' : '☀️';
  });
}

// ── TOAST NOTIFICATION ──
function showToast(msg, type = 'success') {
  let toast = document.getElementById('w3toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'w3toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = (type === 'success' ? '✅ ' : '❌ ') + msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 2800);
}

// ── CODE COPY ──
function copyCode(id) {
  const el = document.getElementById(id);
  if (!el) return;
  navigator.clipboard.writeText(el.textContent).then(() => {
    showToast("Kod nusxalandi!");
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = el.textContent;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast("Kod nusxalandi!");
  });
}

// ── RUN CODE ──
function runCode(codeId, resultId) {
  const el = document.getElementById(codeId);
  if (!el) return;
  const rawCode = el.innerText || el.textContent || '';
  let resEl = document.getElementById(resultId);
  if (!resEl) return;
  const iframe = resEl.tagName === 'IFRAME' ? resEl : resEl.querySelector('iframe');
  if (!iframe) return;

  // Clean wrapper with modern typography
  let code = rawCode;
  if (!code.includes('<html') && !code.includes('<!DOCTYPE')) {
    code = `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;padding:16px;color:#1e293b;margin:0;line-height:1.6;}h1,h2,h3{margin-top:0;color:#0f172a;}hr{border:none;border-top:1px solid #e2e8f0;margin:16px 0;}</style></head><body>${code}</body></html>`;
  }

  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(code);
  doc.close();

  // Auto-resize
  setTimeout(() => {
    try {
      const h = doc.body.scrollHeight;
      iframe.style.height = Math.max(120, Math.min(h + 24, 600)) + 'px';
    } catch(e) {}
  }, 100);
}

// ── EDITABLE CODE BLOCKS & LIVE AUTO-UPDATE ──
function setupEditableCode() {
  document.querySelectorAll('.code-body pre').forEach(pre => {
    pre.setAttribute('contenteditable', 'true');
    pre.setAttribute('spellcheck', 'false');

    // Find associated result box or button
    const wrap = pre.closest('.code-wrap');
    let targetResultId = null;

    if (wrap) {
      const runBtn = wrap.querySelector('.run-btn, .btn-run');
      if (runBtn && runBtn.getAttribute('onclick')) {
        const match = runBtn.getAttribute('onclick').match(/runCode\(['"]([^'"]+)['"],\s*['"]([^'"]+)['"]\)/);
        if (match) targetResultId = match[2];
      }
      if (!targetResultId && wrap.nextElementSibling && wrap.nextElementSibling.classList.contains('result-box')) {
        targetResultId = wrap.nextElementSibling.id;
      }
    }

    if (targetResultId) {
      // 1. Live auto-update when user edits code!
      pre.addEventListener('input', () => {
        runCode(pre.id, targetResultId);
      });
      // 2. Initial run on page load so result box is already filled!
      setTimeout(() => {
        runCode(pre.id, targetResultId);
      }, 150);
    }
  });

  document.querySelectorAll('.code-toolbar').forEach(toolbar => {
    if (!toolbar.querySelector('.edit-badge')) {
      const badge = document.createElement('span');
      badge.className = 'edit-badge';
      badge.innerHTML = '✏️ Jonli tahrirlash';
      badge.title = 'Kodni o\'zgartirishingiz bilan natija darhol o\'zgaradi!';
      const copyBtn = toolbar.querySelector('.copy-btn, .btn-copy');
      if (copyBtn) {
        toolbar.insertBefore(badge, copyBtn);
      } else {
        toolbar.appendChild(badge);
      }
    }
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupEditableCode);
} else {
  setupEditableCode();
}

// ── QUIZ ──
function checkQuiz(el, isCorrect, resultId) {
  const opts = el.parentElement.querySelectorAll('.quiz-opt');
  opts.forEach(o => {
    o.style.pointerEvents = 'none';
    o.classList.remove('correct', 'wrong');
  });
  el.classList.add(isCorrect ? 'correct' : 'wrong');
  // Mark correct answer
  if (!isCorrect) {
    opts.forEach(o => {
      if (o.onclick?.toString().includes('true')) o.classList.add('correct');
    });
  }
  const res = document.getElementById(resultId);
  if (res) {
    res.className = 'quiz-result show ' + (isCorrect ? 'ok' : 'err');
    res.textContent = isCorrect
      ? '✅ To\'g\'ri! Ajoyib!'
      : '❌ Noto\'g\'ri. Qayta o\'qib chiqing.';
  }
  if (isCorrect) {
    addXP(25, "To'g'ri test javobi");
  }
  // Update progress
  updateProgress();
}

// ── PROGRESS ──
function updateProgress() {
  const page = location.pathname.split('/').pop().replace('.html','') || 'home';
  const answered = document.querySelectorAll('.quiz-opt.correct, .quiz-opt.wrong').length;
  const total    = document.querySelectorAll('.quiz-opt').length;
  if (total > 0) {
    const pct = Math.round((answered / total) * 100);
    const fill = document.querySelector('.progress-fill');
    if (fill) fill.style.width = pct + '%';
    const label = document.querySelector('.progress-label span:last-child');
    if (label) label.textContent = pct + '%';
    // Save to localStorage
    const prog = JSON.parse(localStorage.getItem('w3progress') || '{}');
    prog[page] = { answered, total, pct };
    localStorage.setItem('w3progress', JSON.stringify(prog));
  }
}

// ── ACTIVE SIDEBAR LINK ──
const hash = location.hash || '#';
document.querySelectorAll('.sidebar a').forEach(a => {
  a.classList.remove('active');
  if (a.getAttribute('href') === hash) a.classList.add('active');
});

// Update active on scroll
const sections = document.querySelectorAll('main [id]');
const sideLinks = document.querySelectorAll('.sidebar a');
if (sections.length && sideLinks.length) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        sideLinks.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });
  sections.forEach(s => obs.observe(s));
}

// ── SEARCH ──
function doSearch() {
  const q = document.getElementById('searchInput')?.value?.trim();
  if (!q) return;
  const pages = {
    'html':'html','css':'css','javascript':'javascript','js':'javascript',
    'react':'react','vue':'vue','bootstrap':'bootstrap','typescript':'typescript',
    'jquery':'jquery','python':'python','nodejs':'nodejs','node':'nodejs',
    'php':'php','java':'java','django':'django','cpp':'cpp','c++':'cpp',
    'csharp':'csharp','c#':'csharp','sql':'sql','mongodb':'mongodb',
    'postgresql':'postgresql','redis':'redis','git':'git',
    'docker':'docker','linux':'linux','restapi':'restapi','api':'restapi'
  };
  const key = q.toLowerCase();
  for (const [term, page] of Object.entries(pages)) {
    if (key.includes(term)) {
      const base = location.href.includes('/pages/') ? '' : 'pages/';
      location.href = base + page + '.html';
      return;
    }
  }
  showToast('Natija topilmadi: ' + q, 'error');
}
document.getElementById('searchInput')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') doSearch();
});

// ── BOOKMARK ──
function toggleBookmark(page) {
  const bookmarks = JSON.parse(localStorage.getItem('w3bookmarks') || '[]');
  const idx = bookmarks.indexOf(page);
  if (idx === -1) {
    bookmarks.push(page);
    showToast('Bookmark qo\'shildi!');
  } else {
    bookmarks.splice(idx, 1);
    showToast('Bookmark o\'chirildi.', 'error');
  }
  localStorage.setItem('w3bookmarks', JSON.stringify(bookmarks));
  document.querySelectorAll('.bookmark-btn').forEach(btn => {
    btn.classList.toggle('saved', bookmarks.includes(page));
    btn.textContent = bookmarks.includes(page) ? '🔖 Saqlangan' : '🔖 Saqlash';
  });
}

// Init bookmark state
(function initBookmark() {
  const page = location.pathname.split('/').pop().replace('.html','');
  const bookmarks = JSON.parse(localStorage.getItem('w3bookmarks') || '[]');
  document.querySelectorAll('.bookmark-btn').forEach(btn => {
    if (bookmarks.includes(page)) {
      btn.classList.add('saved');
      btn.textContent = '🔖 Saqlangan';
    }
  });
})();

// ── MOBILE SIDEBAR ──
const menuToggle = document.getElementById('menuToggle');
const sidebar    = document.querySelector('.sidebar');
const overlay    = document.getElementById('overlay');
if (menuToggle && sidebar) {
  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay?.classList.toggle('show');
  });
  overlay?.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  });
}

// ── SCROLL REVEAL ──
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const revObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  revealEls.forEach(el => revObs.observe(el));
}

// ── CATEGORY FILTER (index.html) ──
function filterCat(cat) {
  document.querySelectorAll('.cat-tab').forEach(t =>
    t.classList.toggle('active', t.dataset.cat === cat));
  document.querySelectorAll('.course-card').forEach(card => {
    const show = cat === 'all' || card.dataset.cat === cat;
    card.style.display = show ? '' : 'none';
  });
}

// ── ANIMATE STATS COUNTER ──
function animateCount(el, target, suffix = '') {
  let start = 0;
  const dur = 1500;
  const step = target / (dur / 16);
  const timer = setInterval(() => {
    start = Math.min(start + step, target);
    el.textContent = Math.floor(start) + suffix;
    if (start >= target) clearInterval(timer);
  }, 16);
}
document.querySelectorAll('.stat-num[data-count]').forEach(el => {
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      animateCount(el, +el.dataset.count, el.dataset.suffix || '');
      obs.disconnect();
    }
  });
  obs.observe(el);
});

// ── KEYBOARD SHORTCUTS ──
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    document.getElementById('searchInput')?.focus();
  }
  if (e.key === 'Escape') {
    sidebar?.classList.remove('open');
    overlay?.classList.remove('show');
  }
});

// ── PROGRESS RESTORE ──
(function restoreProgress() {
  const prog = JSON.parse(localStorage.getItem('w3progress') || '{}');
  const page = location.pathname.split('/').pop().replace('.html','') || 'home';
  const fill  = document.querySelector('.progress-fill');
  const label = document.querySelector('.progress-label span:last-child');
  if (fill && prog[page]) {
    fill.style.width = prog[page].pct + '%';
    if (label) label.textContent = prog[page].pct + '%';
  }
})();

// ══════════════════════════════════════
// GAMIFICATION: XP, STREAK, LEADERBOARD
// ══════════════════════════════════════
function initGamification() {
  let xp = parseInt(localStorage.getItem('w3_xp') || '50');
  let streak = parseInt(localStorage.getItem('w3_streak') || '1');
  const lastDate = localStorage.getItem('w3_last_date');
  const today = new Date().toDateString();

  if (lastDate !== today) {
    if (lastDate) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (lastDate === yesterday) {
        streak += 1;
      } else {
        streak = 1;
      }
    }
    localStorage.setItem('w3_streak', streak);
    localStorage.setItem('w3_last_date', today);
  }

  // Inject Gamification pills into Topbar
  const topbar = document.querySelector('.topbar');
  if (topbar && !document.getElementById('gamifyWrap')) {
    const wrap = document.createElement('div');
    wrap.id = 'gamifyWrap';
    wrap.className = 'gamify-wrap';
    wrap.innerHTML = `
      <div class="xp-pill" onclick="openLeaderboard()" title="Sizning ballaringiz. Reytingni ko'rish uchun bosing!">
        ⭐ <span id="userXpDisplay">${xp}</span> XP
      </div>
      <div class="streak-pill" title="Siz har kuni muntazam o'rganmoqdasiz!">
        🔥 <span id="userStreakDisplay">${streak}</span> kun
      </div>
    `;
    const darkBtn = topbar.querySelector('.dark-btn');
    if (darkBtn) {
      topbar.insertBefore(wrap, darkBtn);
    } else {
      topbar.appendChild(wrap);
    }
  }

  // Inject Leaderboard modal into body
  if (!document.getElementById('leaderboardModal')) {
    const modal = document.createElement('div');
    modal.id = 'leaderboardModal';
    modal.className = 'leaderboard-modal';
    modal.innerHTML = `
      <div class="leaderboard-card">
        <div class="leaderboard-header">
          <div style="font-size:17px;font-weight:800;color:#fff;display:flex;align-items:center;gap:8px;">
            🏆 <span>W3Learn Haftalik Reyting</span>
          </div>
          <button onclick="closeLeaderboard()" style="background:none;border:none;color:#9ca3af;font-size:18px;cursor:pointer;">✕</button>
        </div>
        <div id="leaderboardList"></div>
        <div style="margin-top:16px;text-align:center;font-size:12px;color:#94a3b8;">
          💡 Darslarni o'qing, kod yozing va testlarni yechib XP yig'ing!
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
}

function addXP(amount, reason = '') {
  let xp = parseInt(localStorage.getItem('w3_xp') || '50');
  xp += amount;
  localStorage.setItem('w3_xp', xp);

  const display = document.getElementById('userXpDisplay');
  if (display) display.textContent = xp;

  // Floating animation
  const pop = document.createElement('div');
  pop.className = 'xp-pop';
  pop.textContent = `+${amount} XP! 🎉`;
  pop.style.top = '70px';
  pop.style.right = '130px';
  document.body.appendChild(pop);
  setTimeout(() => pop.remove(), 1200);

  if (reason) showToast(`+${amount} XP: ${reason}!`);
}

function openLeaderboard() {
  const currentXP = parseInt(localStorage.getItem('w3_xp') || '50');
  const learners = [
    { name: "Sardor Azimov", xp: 1240 },
    { name: "Malika Rahimova", xp: 1110 },
    { name: "Bobur Mirzayev", xp: 980 },
    { name: "Siz (Talaba)", xp: currentXP, me: true },
    { name: "Jasur Bek", xp: 750 },
    { name: "Nodira Karimova", xp: 620 },
    { name: "Dilshod Olimov", xp: 540 }
  ];

  learners.sort((a,b) => b.xp - a.xp);

  const listEl = document.getElementById('leaderboardList');
  if (listEl) {
    listEl.innerHTML = learners.map((l, idx) => {
      const rank = idx + 1;
      const rankClass = rank === 1 ? 'rank-1' : rank === 2 ? 'rank-2' : rank === 3 ? 'rank-3' : 'rank-other';
      return `
        <div class="leaderboard-item ${l.me ? 'me' : ''}">
          <div class="rank-badge ${rankClass}">${rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}</div>
          <div style="flex:1;font-weight:${l.me ? '700' : '500'};color:${l.me ? '#00d4a0' : '#e2e8f0'}">
            ${l.name}
          </div>
          <div style="font-weight:700;color:#fbbf24;">${l.xp} XP</div>
        </div>
      `;
    }).join('');
  }

  document.getElementById('leaderboardModal')?.classList.add('open');
}

function closeLeaderboard() {
  document.getElementById('leaderboardModal')?.classList.remove('open');
}

// ══════════════════════════════════════
// AI MENTOR (W3BOT)
// ══════════════════════════════════════
function initAIMentor() {
  if (document.getElementById('aiMentorWidget')) return;

  const page = location.pathname.split('/').pop().replace('.html','').toUpperCase() || 'DASTURLASH';

  const container = document.createElement('div');
  container.id = 'aiMentorWidget';
  container.innerHTML = `
    <!-- Floating Button -->
    <button class="ai-trigger-btn" onclick="toggleAIChat()" id="aiTriggerBtn">
      <span class="dot-online"></span>
      <i class="fa-solid fa-robot"></i> AI Ustoz
    </button>

    <!-- Chat Window -->
    <div class="ai-chat-window" id="aiChatWindow">
      <div class="ai-header">
        <div class="ai-title">
          <div style="width:28px;height:28px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;">
            🤖
          </div>
          <div>
            <div>W3Bot — AI Ustoz</div>
            <div style="font-size:10.5px;color:#10b981;font-weight:500;">● Real-vaqtli yordamchi</div>
          </div>
        </div>
        <button class="ai-close-btn" onclick="toggleAIChat()">✕</button>
      </div>

      <!-- Quick Chips -->
      <div class="ai-quick-chips">
        <div class="ai-chip" onclick="askQuickPrompt('tushuntir')">💡 Darsni tushuntir</div>
        <div class="ai-chip" onclick="askQuickPrompt('xato')">🐛 Koddagi xatolar</div>
        <div class="ai-chip" onclick="askQuickPrompt('misol')">📝 Yangi misol</div>
        <div class="ai-chip" onclick="askQuickPrompt('masala')">🧩 Kichik masala</div>
      </div>

      <!-- Messages -->
      <div class="ai-messages" id="aiMessages">
        <div class="ai-msg bot">
          Assalomu alaykum! Men sizning <strong>${page}</strong> bo'yicha sun'iy intellekt mentoriman. 
          Savollaringiz bo'lsa yoki kodni tushunmay qolsangiz, bemalol so'rang! 👋
        </div>
      </div>

      <!-- Input Bar -->
      <div class="ai-input-bar">
        <input type="text" class="ai-input" id="aiInput" placeholder="${page} bo'yicha savol bering..." onkeydown="if(event.key==='Enter') sendAIMessage()"/>
        <button class="ai-send-btn" onclick="sendAIMessage()">
          <i class="fa-solid fa-paper-plane"></i>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(container);
}

function toggleAIChat() {
  const win = document.getElementById('aiChatWindow');
  if (win) {
    win.classList.toggle('open');
    if (win.classList.contains('open')) {
      document.getElementById('aiInput')?.focus();
    }
  }
}

function sendAIMessage() {
  const input = document.getElementById('aiInput');
  const text = input?.value?.trim();
  if (!text) return;
  input.value = '';

  appendUserMsg(text);

  // Bot thinking
  const messages = document.getElementById('aiMessages');
  const typingDiv = document.createElement('div');
  typingDiv.className = 'ai-msg bot';
  typingDiv.id = 'aiTyping';
  typingDiv.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> O\'ylamoqda...';
  messages.appendChild(typingDiv);
  messages.scrollTop = messages.scrollHeight;

  setTimeout(() => {
    typingDiv.remove();
    const reply = generateAIResponse(text);
    appendBotMsg(reply);
    addXP(5, "AI bilan suhbat");
  }, 500);
}

function appendUserMsg(text) {
  const messages = document.getElementById('aiMessages');
  const div = document.createElement('div');
  div.className = 'ai-msg user';
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function appendBotMsg(html) {
  const messages = document.getElementById('aiMessages');
  const div = document.createElement('div');
  div.className = 'ai-msg bot';
  div.innerHTML = html;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function askQuickPrompt(type) {
  const page = location.pathname.split('/').pop().replace('.html','').toUpperCase() || 'HTML';
  if (type === 'tushuntir') {
    appendUserMsg(`${page} darsini sodda qilib tushuntirib ber.`);
    setTimeout(() => {
      appendBotMsg(`<strong>${page} bo'yicha qisqa tushuncha:</strong><br/>
Ushbu darsda ko'rsatilgan kodlar veb sahifaning asosiy elementlari hisoblanadi. Kodni tahrirlash oynasida o'zgartirishingiz bilan pastdagi natijada darhol uning natijasi chiqadi! O'zgartirib ko'ring! 🚀`);
    }, 400);
  } else if (type === 'xato') {
    appendUserMsg("Koddagi eng ko'p uchraydigan xatolar qaysilar?");
    setTimeout(() => {
      appendBotMsg(`<strong>Eng ko'p uchraydigan xatolar:</strong><br/>
1. Yopiluvchi tegni (masalan: <code>&lt;/h1&gt;</code> yoki <code>&lt;/div&gt;</code>) unutish.<br/>
2. Qavslar yoki qo'shtirnoqlarni to'g'ri yopmaslik.<br/>
3. Katta-kichik harflarga e'tibor bermaslik.<br/>
Kodingizni tekshirib ko'ring! 🧐`);
    }, 400);
  } else if (type === 'misol') {
    appendUserMsg("Qo'shimcha amaliy misol ko'rsat.");
    setTimeout(() => {
      appendBotMsg(`Mana yangi amaliy misol:<br/>
<pre>&lt;div style="background:#04AA6D;color:#fff;padding:15px;border-radius:8px;"&gt;
  &lt;h2&gt;Ajoyib Natija!&lt;/h2&gt;
  &lt;p&gt;Bu W3Learn misoli.&lt;/p&gt;
&lt;/div&gt;</pre>
Buni yuqoridagi kod oynasiga qo'yib ko'ring, natija pastda darhol chiqadi! 💻`);
    }, 400);
  } else if (type === 'masala') {
    appendUserMsg("Bilimimni sinash uchun masala ber.");
    setTimeout(() => {
      appendBotMsg(`<strong>🧩 Kichik topshiriq:</strong><br/>
Kodingiz ichiga yangi <code>&lt;button&gt;Meni bosing!&lt;/button&gt;</code> tugmasini qo'shing va natijada qanday ko'rinishini tekshiring! Qani, sinab ko'ring-chi? 🎯`);
    }, 400);
  }
}

function generateAIResponse(query) {
  const q = query.toLowerCase();
  const page = location.pathname.split('/').pop().replace('.html','').toUpperCase() || 'HTML';

  if (q.includes('salom') || q.includes('qalaysan') || q.includes('assalom')) {
    return `Assalomu alaykum! Rahmat, o'rganishlar a'lo darajada ketyapti degan umiddaman. <strong>${page}</strong> bo'yicha qanday yordam bera olaman? 😊`;
  }
  if (q.includes('nima') || q.includes('tushuntir')) {
    return `<strong>${query}:</strong><br/>Dasturlashda har bir buyruq va teg kompyuterga aniq ko'rsatma beradi. Masalan, HTML sahifaning suyagi (skeleti), CSS uning kiyimi (ko'rinishi), JavaScript esa uning harakati hisoblanadi!`;
  }
  if (q.includes('xato') || q.includes('ishlamadi')) {
    return `Xavotir olmang! Dasturlashda xatolar — bu o'rganishning tabiiy qismi. <br/>Kodingizda ochilgan barcha teglarning yopilganini va qo'shtirnoqlar juftligini bir qator tekshiring.`;
  }
  return `Savolingiz uchun rahmat! <strong>${query}</strong> bo'yicha: eng yaxshi o'rganish yo'li — uni yuqoridagi kod oynasida to'g'ridan-to'g'ri yozib ko'rishdir. Natija pastda darhol aks etadi! 💡`;
}

// ══════════════════════════════════════
// INTERACTIVE EXERCISES CHECKER
// ══════════════════════════════════════
function checkExercise(inputEl, expectedAnswer, resultId, xp = 20) {
  const val = inputEl.value.trim().toLowerCase();
  const res = document.getElementById(resultId);
  const isRight = val === expectedAnswer.toLowerCase();
  if (res) {
    res.className = 'exercise-result show ' + (isRight ? 'ok' : 'err');
    res.innerHTML = isRight 
      ? `🎉 Barakalla! To'g'ri javob (+${xp} XP)!`
      : `❌ Noto'g'ri javob. Qayta urinib ko'ring (yordam: "${expectedAnswer}").`;
  }
  if (isRight) {
    inputEl.style.borderColor = '#10b981';
    inputEl.disabled = true;
    addXP(xp, "Mashq to'g'ri yechildi");
  } else {
    inputEl.style.borderColor = '#ef4444';
  }
}

function checkExerciseDouble(id1, id2, expected, resId, xp = 20) {
  const el1 = document.getElementById(id1);
  const el2 = document.getElementById(id2);
  const v1 = el1?.value.trim().toLowerCase();
  const v2 = el2?.value.trim().toLowerCase();
  const res = document.getElementById(resId);
  const ok = v1 === expected.toLowerCase() && v2 === expected.toLowerCase();
  if (res) {
    res.className = 'exercise-result show ' + (ok ? 'ok' : 'err');
    res.innerHTML = ok
      ? `🎉 Barakalla! To'g'ri javob (<code>&lt;${expected}&gt;</code> tegi) (+${xp} XP)!`
      : `❌ Noto'g'ri. Havola (link) yaratish uchun qaysi teg ishlatiladi? (Yordam: "${expected}")`;
  }
  if (ok) {
    el1.style.borderColor = '#10b981';
    el2.style.borderColor = '#10b981';
    el1.disabled = true;
    el2.disabled = true;
    addXP(xp, "Amaliy mashq to'g'ri yechildi");
  } else {
    if (el1) el1.style.borderColor = '#ef4444';
    if (el2) el2.style.borderColor = '#ef4444';
  }
}

// ── INITIALIZE NEW MODULES ──
document.addEventListener('DOMContentLoaded', () => {
  initGamification();
  initAIMentor();

  // Inject PDF Konspekt button into lesson meta-tags
  document.querySelectorAll('.meta-tags').forEach(meta => {
    if (!meta.querySelector('.btn-pdf-konspekt')) {
      const btn = document.createElement('button');
      btn.className = 'tag tag-green btn-pdf-konspekt';
      btn.innerHTML = '<i class="fa-solid fa-file-pdf"></i> 📥 PDF Konspekt';
      btn.style.cursor = 'pointer';
      btn.style.border = 'none';
      btn.title = 'Ushbu darsni PDF qilib saqlash yoki chop etish';
      btn.onclick = () => window.print();
      meta.appendChild(btn);
    }
  });
});
if (document.readyState !== 'loading') {
  initGamification();
  initAIMentor();
}

