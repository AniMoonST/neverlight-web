const API = 'http://157.22.207.233/api';

const Auth = {
  token: () => localStorage.getItem('nl_token'),
  user: () => { try { return JSON.parse(localStorage.getItem('nl_user')); } catch { return null; } },
  isLoggedIn: () => !!localStorage.getItem('nl_token'),

  async login(username, password) {
    const r = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const initials = user.username.slice(0,2).toUpperCase();
    navRight.innerHTML = `
      <a href="/profile.html?u=${user.username}" class="user-btn">
        <div class="user-avatar">${initials}</div>
        <span style="font-size:14px;font-weight:600">${user.username}</span>
        <span class="rubins-badge">💎 ${user.balance_rubins || 0}</span>
      </a>
      <button class="btn btn-outline" onclick="Auth.logout()">Выйти</button>
    `;
  } else {
    navRight.innerHTML = `
      <button class="btn btn-outline" onclick="openModal('login')">Войти</button>
      <button class="btn btn-red" onclick="openModal('register')">Регистрация</button>
    `;
  }
}

function openModal(tab = 'login') {
  document.getElementById('auth-modal').classList.add('open');
  switchTab(tab);
}

function closeModal() {
  document.getElementById('auth-modal').classList.remove('open');
}

function switchTab(tab) {
  document.querySelectorAll('.modal-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.getElementById('form-login').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('form-register').style.display = tab === 'register' ? 'block' : 'none';
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
  } catch (ex) {
    err.textContent = ex.message;
    err.classList.add('show');
  }
}

async function doRegister(e) {
  e.preventDefault();
  const err = document.getElementById('register-error');
  try {
    await Auth.register(
      document.getElementById('reg-username').value,
      document.getElementById('reg-email').value,
      document.getElementById('reg-password').value
    );
    switchTab('login');
    document.getElementById('login-username').value = document.getElementById('reg-username').value;
  } catch (ex) {
    err.textContent = ex.message;
    err.classList.add('show');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateNav();
  document.getElementById('auth-modal')?.addEventListener('click', e => {
    if (e.target.id === 'auth-modal') closeModal();
  });
});
