const API = 'http://157.22.207.233/api';

const ROLES = {
  founder:    { label: 'Основатель',        css: 'role-founder' },
  spec_admin: { label: 'Спец. администратор', css: 'role-spec_admin' },
  helper:     { label: 'Хелпер',            css: 'role-helper' },
  tester:     { label: 'Тестировщик',       css: 'role-tester' },
  sponsor:    { label: 'Спонсор',           css: 'role-sponsor' },
  user:       { label: 'Пользователь',      css: 'role-user' },
};

const STATUSES = {
  reviewed: { label: 'Рассмотрено',     css: 'status-reviewed' },
  pending:  { label: 'На рассмотрении', css: 'status-pending' },
  closed:   { label: 'Закрыто',         css: 'status-closed' },
};

function roleTag(role) {
  const r = ROLES[role] || ROLES.user;
  return `<span class="role-badge ${r.css}">${r.label}</span>`;
}

function statusTag(status) {
  if (!status || !STATUSES[status]) return '';
  const s = STATUSES[status];
  return `<span class="topic-status ${s.css}">${s.label}</span>`;
}

const Auth = {
  token: () => localStorage.getItem('nl_token'),
  user:  () => { try { return JSON.parse(localStorage.getItem('nl_user')); } catch { return null; } },
  isLoggedIn: () => !!localStorage.getItem('nl_token'),

  async login(username, password) {
    const r = await fetch(`${API}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error);
    localStorage.setItem('nl_token', data.token);
    localStorage.setItem('nl_user', JSON.stringify(data.user));
    return data;
  },

  async register(username, email, password) {
    const r = await fetch(`${API}/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error);
    return data;
  },

  logout() {
    localStorage.removeItem('nl_token');
    localStorage.removeItem('nl_user');
    window.location.href = '/';
  },

  headers() {
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token()}` };
  }
};

function updateNav() {
  const navRight = document.getElementById('nav-right');
  if (!navRight) return;
  const user = Auth.user();
  if (user) {
    const initials = user.username.slice(0, 2).toUpperCase();
    navRight.innerHTML = `
      <a href="/profile.html?u=${user.username}" class="user-btn">
        <div class="user-avatar">${initials}</div>
        <span style="font-size:13px;font-weight:600">${user.username}</span>
        <span class="rubins-badge">💎 ${user.balance_rubins || 0}</span>
      </a>
      <button class="btn btn-outline" onclick="Auth.logout()" style="font-size:13px;padding:7px 14px">Выйти</button>
    `;
  } else {
    navRight.innerHTML = `
      <button class="btn btn-outline" onclick="openModal('login')" style="font-size:13px;padding:7px 14px">Войти</button>
      <button class="btn btn-red" onclick="openModal('register')" style="font-size:13px;padding:7px 14px">Регистрация</button>
    `;
  }
}

function openModal(tab) {
  tab = tab || 'login';
  const m = document.getElementById('auth-modal');
  if (!m) return;
  m.classList.add('open');
  switchTab(tab);
}

function closeModal() {
  const m = document.getElementById('auth-modal');
  if (m) m.classList.remove('open');
}

function switchTab(tab) {
  document.querySelectorAll('.modal-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  const fl = document.getElementById('form-login');
  const fr = document.getElementById('form-register');
  if (fl) fl.style.display = tab === 'login' ? 'block' : 'none';
  if (fr) fr.style.display = tab === 'register' ? 'block' : 'none';
  document.querySelectorAll('.form-error').forEach(e => e.classList.remove('show'));
}

async function doLogin(e) {
  e.preventDefault();
  const err = document.getElementById('login-error');
  try {
    await Auth.login(
      document.getElementById('login-username').value,
      document.getElementById('login-password').value
    );
    closeModal();
    updateNav();
    if (typeof onLoginSuccess === 'function') onLoginSuccess();
  } catch (ex) { err.textContent = ex.message; err.classList.add('show'); }
}

async function doRegister(e) {
  e.preventDefault();
  const err = document.getElementById('register-error');
  const email = document.getElementById('reg-email').value;
  if (!email) { err.textContent = 'Email обязателен для регистрации'; err.classList.add('show'); return; }
  try {
    await Auth.register(
      document.getElementById('reg-username').value,
      email,
      document.getElementById('reg-password').value
    );
    switchTab('login');
    document.getElementById('login-username').value = document.getElementById('reg-username').value;
  } catch (ex) { err.textContent = ex.message; err.classList.add('show'); }
}

function escHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function requireAuth(callback) {
  if (!Auth.isLoggedIn()) { openModal('login'); return false; }
  if (callback) callback();
  return true;
}

// Animate counters
function animateCounter(el, target, duration) {
  const start = performance.now();
  const step = ts => {
    const p = Math.min((ts - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(ease * target).toLocaleString('ru');
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

document.addEventListener('DOMContentLoaded', () => {
  updateNav();
  document.getElementById('auth-modal')?.addEventListener('click', e => {
    if (e.target.id === 'auth-modal') closeModal();
  });
  // Scroll reveal init
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});
