// Вставляет nav, footer и auth-modal на страницу
(function() {
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  const links = [
    { href: '/', label: 'Главная', pages: ['index.html', ''] },
    { href: '/forum.html', label: 'Форум', pages: ['forum.html'] },
    { href: '/donate.html', label: 'Донат', pages: ['donate.html'] },
    { href: '/download.html', label: 'Скачать', pages: ['download.html'] },
  ];

  const navLinksHtml = links.map(l => {
    const active = l.pages.includes(currentPage) ? ' class="active"' : '';
    return `<a href="${l.href}"${active}>${l.label}</a>`;
  }).join('');

  // NAV
  const nav = document.createElement('nav');
  nav.innerHTML = `
    <a href="/" class="nav-logo">✦ NeverLight</a>
    <div class="nav-links">${navLinksHtml}</div>
    <div class="nav-right" id="nav-right"></div>
  `;
  document.body.prepend(nav);

  // FOOTER
  const footer = document.createElement('footer');
  footer.innerHTML = `
    <div class="footer-top">
      <div class="footer-brand">
        <div class="footer-logo">✦ NeverLight</div>
        <p>Кастомный Minecraft проект с уникальным клиентом, модами и сообществом.</p>
        <div class="footer-social" style="margin-top:14px">
          <a href="https://t.me/neverlight_official" target="_blank" class="social-btn" title="Telegram">✈</a>
          <a href="https://discord.gg/EKTxTsvHQ" target="_blank" class="social-btn" title="Discord">💬</a>
          <a href="https://www.twitch.tv/animoonst" target="_blank" class="social-btn" title="Twitch">🎮</a>
        </div>
      </div>
      <div class="footer-links-group">
        <h4>Навигация</h4>
        <a href="/">Главная</a>
        <a href="/forum.html">Форум</a>
        <a href="/donate.html">Донат</a>
        <a href="/download.html">Скачать</a>
      </div>
      <div class="footer-links-group">
        <h4>Сообщество</h4>
        <a href="https://t.me/neverlight_official" target="_blank">Telegram-канал</a>
        <a href="https://discord.gg/EKTxTsvHQ" target="_blank">Discord-сервер</a>
        <a href="https://www.twitch.tv/animoonst" target="_blank">Twitch AniMoonST</a>
      </div>
      <div class="footer-links-group">
        <h4>Поддержка</h4>
        <a href="#" onclick="goToForumSection('Помощь')">Тех. поддержка</a>
        <a href="#" onclick="goToForumSection('Жалобы и апелляции')">Оставить жалобу</a>
        <a href="/donate.html">Купить привилегию</a>
      </div>
    </div>
    <div class="footer-bottom">
      <div>© 2026 NeverLight. Все права защищены. Не связан с Mojang Studios.</div>
      <div class="footer-support-links">
        <a href="#" onclick="goToForumSection('Помощь')">Тех. поддержка</a>
        <a href="#" onclick="goToForumSection('Жалобы и апелляции')">Оставить жалобу</a>
      </div>
    </div>
  `;
  document.body.appendChild(footer);

  // AUTH MODAL
  const modalHtml = `
  <div class="modal-overlay" id="auth-modal">
    <div class="modal">
      <button class="modal-close" onclick="closeModal()">×</button>
      <div class="modal-tabs">
        <div class="modal-tab active" data-tab="login" onclick="switchTab('login')">Войти</div>
        <div class="modal-tab" data-tab="register" onclick="switchTab('register')">Регистрация</div>
      </div>
      <div id="form-login">
        <form onsubmit="doLogin(event)">
          <div class="form-group"><label>Никнейм или Email</label><input type="text" id="login-username" required autocomplete="username"></div>
          <div class="form-group"><label>Пароль</label><input type="password" id="login-password" required autocomplete="current-password"></div>
          <div class="form-error" id="login-error"></div>
          <button type="submit" class="btn btn-red" style="width:100%;padding:12px;margin-top:4px">Войти</button>
          <div class="modal-switch" style="margin-top:12px">Нет аккаунта? <a onclick="switchTab('register')">Зарегистрироваться</a></div>
        </form>
      </div>
      <div id="form-register" style="display:none">
        <form onsubmit="doRegister(event)">
          <div class="form-group"><label>Никнейм</label><input type="text" id="reg-username" minlength="3" required autocomplete="username"></div>
          <div class="form-group"><label>Email <span style="color:var(--accent2)">*</span></label><input type="email" id="reg-email" required autocomplete="email"></div>
          <div class="form-group"><label>Пароль</label><input type="password" id="reg-password" minlength="6" required autocomplete="new-password"></div>
          <div class="form-error" id="register-error"></div>
          <button type="submit" class="btn btn-red" style="width:100%;padding:12px;margin-top:4px">Создать аккаунт</button>
          <div class="modal-switch" style="margin-top:12px">Уже есть аккаунт? <a onclick="switchTab('login')">Войти</a></div>
        </form>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  document.getElementById('auth-modal').addEventListener('click', e => {
    if (e.target.id === 'auth-modal') closeModal();
  });
})();

function goToForumSection(name) {
  if (!Auth.isLoggedIn()) { openModal('login'); return; }
  window.location.href = '/forum.html?cat=' + encodeURIComponent(name);
}
