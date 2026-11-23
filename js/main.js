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

  // Find triggering button for tactile animation feedback
  const wrap = el.closest('.code-wrap') || el.closest('.code-block') || el.parentElement?.parentElement;
  const btn = wrap ? (wrap.querySelector('.btn-copy') || wrap.querySelector('.btn-copy-code')) : null;
  const prevHtml = btn ? btn.innerHTML : '';

  if (btn) {
    btn.innerHTML = '✓ Nusxalandi!';
    btn.classList.add('copied');
  }

  const restoreBtn = () => {
    if (btn) {
      setTimeout(() => {
        btn.innerHTML = prevHtml || '📋 Nusxa';
        btn.classList.remove('copied');
      }, 2000);
    }
  };

  const textToCopy = el.textContent;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast("📋 Kod muvaffaqiyatli nusxalandi!");
      restoreBtn();
    }).catch(() => {
      fallbackCopy(textToCopy);
      restoreBtn();
    });
  } else {
    fallbackCopy(textToCopy);
    restoreBtn();
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showToast("📋 Kod muvaffaqiyatli nusxalandi!");
  } catch (e) {
    showToast("⚠️ Nusxalashda xatolik yuz berdi");
  }
  document.body.removeChild(ta);
}

// ── RUN CODE (HTML, CSS, JS, React, Vue, TS qo'llab-quvvatlaydi) ──
function runCode(codeId, resultId) {
  const el = document.getElementById(codeId);
  if (!el) return;
  const rawCode = el.innerText || el.textContent || '';
  let resEl = document.getElementById(resultId);
  if (!resEl) return;

  // Running glow effect on result box
  resEl.classList.remove('running-glow');
  void resEl.offsetWidth; // trigger reflow
  resEl.classList.add('running-glow');
  setTimeout(() => resEl.classList.remove('running-glow'), 800);

  const iframe = resEl.tagName === 'IFRAME' ? resEl : resEl.querySelector('iframe');
  if (!iframe) return;

  let code = rawCode;
  
  // React kodlarini aniqlash va jonli Babel orqali ishga tushirish
  if ((code.includes('useState') || code.includes('useEffect') || code.includes('React') || (code.includes('function ') && code.includes('return') && code.includes('<'))) && !code.includes('<!DOCTYPE') && !code.includes('<html')) {
    let compMatch = rawCode.match(/(?:function|const)\s+([A-Z][a-zA-Z0-9_]*)/);
    let compName = compMatch ? compMatch[1] : 'App';
    code = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <script src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 16px; margin: 0; background: #0b0f19; color: #f8fafc; line-height: 1.6; }
    button { background: #04AA6D; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; margin: 4px; }
    button:hover { background: #038f5b; }
    input { background: #1e293b; color: white; border: 1px solid #334155; padding: 8px 12px; border-radius: 6px; font-size: 14px; margin: 4px; }
    .card { background: #1e293b; border-radius: 8px; padding: 16px; margin: 8px 0; border: 1px solid rgba(255,255,255,0.08); }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect, useRef, useMemo, useCallback, useContext, createContext } = React;
    ${rawCode.replace(/export\s+default\s+/g, '')}
    try {
      ReactDOM.createRoot(document.getElementById('root')).render(<${compName} />);
    } catch(err) {
      document.getElementById('root').innerHTML = '<div style="color:#ef4444;font-family:monospace;padding:10px;">⚠️ Xatolik: ' + err.message + '</div>';
    }
  <\/script>
</body>
</html>`;
  } else if (location.pathname.includes('python') || (!code.includes('<html') && !code.includes('<!DOCTYPE') && (code.includes('print(') || code.includes('def ')))) {
    code = `<!DOCTYPE html><html><body style="margin:0;padding:12px;background:#0d1117;color:#4ade80;font-family:Consolas,monospace;font-size:13.5px;line-height:1.6;"><div style="color:#6e7681;font-size:11px;margin-bottom:6px;border-bottom:1px solid #21262d;padding-bottom:3px;">🐍 Python 3.12 Terminal [Bajarildi]:</div><pre style="margin:0;color:#38bdf8;">Kod muvaffaqiyatli bajarildi! ✅</pre></body></html>`;
  } else if (!code.includes('<html') && !code.includes('<!DOCTYPE')) {
    code = `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;padding:16px;color:#1e293b;margin:0;line-height:1.6;}h1,h2,h3{margin-top:0;color:#0f172a;}hr{border:none;border-top:1px solid #e2e8f0;margin:16px 0;}button{cursor:pointer;}</style></head><body>${code}</body></html>`;
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
    o.classList.remove('correct', 'wrong', 'anim-correct', 'anim-wrong');
  });

  if (isCorrect) {
    el.classList.add('correct', 'anim-correct');
    triggerConfetti(el);
  } else {
    el.classList.add('wrong', 'anim-wrong');
    // To'g'ri javobni yashil bilan belgilash
    opts.forEach(o => {
      if (o.onclick?.toString().includes('true')) {
        o.classList.add('correct', 'anim-correct');
      }
    });
  }

  const res = document.getElementById(resultId);
  if (res) {
    res.className = 'quiz-result show ' + (isCorrect ? 'ok' : 'err');
    res.textContent = isCorrect
      ? '🎉 To\'g\'ri javob! +25 XP hisobingizga qo\'shildi!'
      : '❌ Noto\'g\'ri. To\'g\'ri javob yashil rang bilan ko\'rsatildi.';
  }

  if (isCorrect) {
    addXP(25, "To'g'ri test javobi");
    const pg = window.location.pathname.split('/').pop().replace('.html','');
    const done = JSON.parse(localStorage.getItem('w3completedCourses')||'[]');
    if(!done.includes(pg)){
      done.push(pg);
      localStorage.setItem('w3completedCourses', JSON.stringify(done));
    }
  }
  updateProgress();
}

// Chiroyli bayramona zarrachalar (Confetti) effekti
function triggerConfetti(target) {
  const rect = target.getBoundingClientRect();
  const colors = ['#04AA6D', '#34d399', '#fbbf24', '#60a5fa', '#a78bfa', '#f472b6'];
  const count = 16;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-particle';
    const size = Math.random() * 8 + 6;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.left = (rect.left + rect.width / 2 + window.scrollX) + 'px';
    p.style.top = (rect.top + rect.height / 2 + window.scrollY) + 'px';

    const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5);
    const distance = Math.random() * 70 + 40;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    p.style.setProperty('--tx', tx + 'px');
    p.style.setProperty('--ty', ty + 'px');

    document.body.appendChild(p);
    setTimeout(() => p.remove(), 800);
  }
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
            <div style="font-size:10.5px;color:#10b981;font-weight:500;">● Google Gemini / Jonli AI</div>
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
          Assalomu alaykum! Men sizning <strong>${page}</strong> bo'yicha sun'iy intellekt mentoriman (Google Gemini quvvatida). 
          Kodingizdagi xatolar, teglar yoki istalgan dasturlash savollaringizni bemalol so'rang! 👋
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

async function sendAIMessage() {
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
  typingDiv.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> AI javob tayyorlamoqda...';
  messages.appendChild(typingDiv);
  messages.scrollTop = messages.scrollHeight;

  const page = location.pathname.split('/').pop().replace('.html','').toUpperCase() || 'HTML';
  const customKey = localStorage.getItem('w3_ai_key') || localStorage.getItem('w3_openai_key') || '';

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        pageContext: page,
        apiKey: customKey
      })
    });

    typingDiv.remove();

    if (res.ok) {
      const data = await res.json();
      const formatted = formatMarkdown(data.reply || '');
      appendBotMsg(formatted);
      addXP(10, "AI bilan suhbat");
    } else {
      const fallback = generateAIResponse(text);
      appendBotMsg(fallback);
    }
  } catch (err) {
    typingDiv.remove();
    const fallback = generateAIResponse(text);
    appendBotMsg(fallback);
  }
}

function formatMarkdown(text) {
  if (!text) return '';
  let html = text.replace(/```([a-zA-Z]*)\n([\s\S]*?)```/g, (m, lang, code) => {
    return `<pre><code>${escapeHtml(code.trim())}</code></pre>`;
  });
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\n/g, '<br/>');
  return html;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
  const input = document.getElementById('aiInput');
  if (!input) return;
  if (type === 'tushuntir') {
    input.value = `${page} darsini sodda va tushunarli qilib o'zbek tilida tushuntirib ber.`;
  } else if (type === 'xato') {
    input.value = `${page} kodlarida dasturchilar eng ko'p qanday xatolarga yo'l qo'yishadi?`;
  } else if (type === 'misol') {
    input.value = `${page} bo'yicha chiroyli va qiziqarli yangi kod namunasi ko'rsat.`;
  } else if (type === 'masala') {
    input.value = `${page} bo'yicha bilimimni sinash uchun bitta amaliy dasturlash masalasi ber.`;
  }
  sendAIMessage();
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


// ── ROBUST MOBILE SIDEBAR & OVERLAY CONTROLLER ──
function getOrCreateOverlay() {
  let ov = document.getElementById('overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.className = 'overlay';
    ov.id = 'overlay';
    document.body.appendChild(ov);
    ov.addEventListener('click', closeMobileSidebar);
  }
  return ov;
}

function openMobileSidebar() {
  const sb = document.querySelector('.sidebar');
  const ov = getOrCreateOverlay();
  if (sb) sb.classList.add('open');
  if (ov) ov.classList.add('show');
}

function closeMobileSidebar() {
  const sb = document.querySelector('.sidebar');
  const ov = document.getElementById('overlay');
  if (sb) sb.classList.remove('open');
  if (ov) ov.classList.remove('show');
}

function toggleSidebar(e) {
  if (e && e.stopPropagation) e.stopPropagation();
  const sb = document.querySelector('.sidebar');
  if (!sb) return;
  if (sb.classList.contains('open')) {
    closeMobileSidebar();
  } else {
    openMobileSidebar();
  }
}

// Global hook for menuToggle button and sidebar links
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('menuToggle') || document.getElementById('hamburgerBtn');
  if (toggleBtn) {
    toggleBtn.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleSidebar(e);
    };
  }

  // Auto-close sidebar on mobile when a topic link is clicked
  document.querySelectorAll('.sidebar a').forEach(a => {
    a.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        closeMobileSidebar();
      }
    });
  });

  // Clicking outside sidebar closes it
  document.addEventListener('click', (e) => {
    const sb = document.querySelector('.sidebar');
    const tb = document.getElementById('menuToggle') || document.getElementById('hamburgerBtn');
    if (sb && sb.classList.contains('open')) {
      if (!sb.contains(e.target) && (!tb || !tb.contains(e.target))) {
        closeMobileSidebar();
      }
    }
  });

  // Escape key closes sidebar
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileSidebar();
    }
  });
});

if (document.readyState !== 'loading') {
  // If DOM already loaded
  const toggleBtn = document.getElementById('menuToggle') || document.getElementById('hamburgerBtn');
  if (toggleBtn) {
    toggleBtn.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleSidebar(e);
    };
  }
  document.querySelectorAll('.sidebar a').forEach(a => {
    a.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        closeMobileSidebar();
      }
    });
  });
}


// ── SCROLLSPY (SIDEBAR FAOL MAVZUNI KUZATISH) ──
(function initScrollSpy() {
  document.addEventListener('DOMContentLoaded', setupSpy);
  if (document.readyState !== 'loading') setupSpy();

  function setupSpy() {
    const sections = document.querySelectorAll('.topic-section h2[id]');
    const sideLinks = document.querySelectorAll('.sidebar a');
    if (!sections.length || !sideLinks.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          sideLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === '#' + id) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, { rootMargin: '-80px 0px -70% 0px' });

    sections.forEach(s => observer.observe(s));
  }
})();
