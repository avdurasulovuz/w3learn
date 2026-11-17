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
