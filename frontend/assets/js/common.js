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
    </div>
  `;
  document.body.appendChild(footer);

  // AUTH MODAL
  const modalHtml = `
  <div class="modal-overlay" id="auth-modal">
    <div class="modal">
      <button class="modal-close" onclick="closeModal()">×</button>

      <div class="modal-header" id="modal-header">
        <div class="modal-header-logo">✦ NeverLight</div>
        <div class="modal-header-sub" id="modal-header-sub">Войди или создай аккаунт</div>
      </div>

      <div class="modal-body">
        <div class="modal-tabs" id="modal-tabs-row">
          <div class="modal-tab active" data-tab="login" onclick="switchTab('login')">Войти</div>
          <div class="modal-tab" data-tab="register" onclick="switchTab('register')">Регистрация</div>
        </div>

        <!-- ВХОД -->
        <div id="form-login">
          <form onsubmit="doLogin(event)">
            <div class="form-group">
              <label>Никнейм или Email</label>
              <input type="text" id="login-username" required autocomplete="username" placeholder="Введи никнейм или email">
            </div>
            <div class="form-group">
              <label>Пароль</label>
              <input type="password" id="login-password" required autocomplete="current-password" placeholder="••••••••">
            </div>
            <div class="form-error" id="login-error"></div>
            <button type="submit" class="btn btn-red" style="width:100%;padding:13px;font-size:15px;border-radius:10px;margin-top:2px">Войти</button>
            <div style="display:flex;justify-content:space-between;margin-top:12px">
              <span class="modal-switch" style="margin:0"><a onclick="showForgotPassword()">Забыли пароль?</a></span>
              <span class="modal-switch" style="margin:0">Нет аккаунта? <a onclick="switchTab('register')">Регистрация</a></span>
            </div>
          </form>
        </div>

        <!-- РЕГИСТРАЦИЯ -->
        <div id="form-register" style="display:none">
          <form onsubmit="doRegister(event)">
            <div class="form-group">
              <label>Никнейм</label>
              <input type="text" id="reg-username" minlength="3" required autocomplete="username" placeholder="От 3 символов">
            </div>
            <div class="form-group">
              <label>Email <span style="color:var(--accent2)">*</span></label>
              <input type="email" id="reg-email" required autocomplete="email" placeholder="your@email.com">
            </div>
            <div class="form-group">
              <label>Пароль</label>
              <input type="password" id="reg-password" minlength="6" required autocomplete="new-password" placeholder="От 6 символов">
            </div>
            <div class="form-error" id="register-error"></div>
            <button type="submit" class="btn btn-red" style="width:100%;padding:13px;font-size:15px;border-radius:10px;margin-top:2px">Создать аккаунт</button>
            <div class="modal-switch" style="margin-top:12px">Уже есть аккаунт? <a onclick="switchTab('login')">Войти</a></div>
          </form>
        </div>

        <!-- ПОДТВЕРЖДЕНИЕ EMAIL -->
        <div id="form-verify" style="display:none">
          <div style="text-align:center;margin-bottom:22px">
            <div style="width:56px;height:56px;background:rgba(224,48,48,0.12);border:1px solid rgba(224,48,48,0.25);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:26px;margin:0 auto 14px">📧</div>
            <div style="font-weight:800;font-size:17px;margin-bottom:6px">Проверь почту</div>
            <div style="color:var(--text2);font-size:13px;line-height:1.5" id="verify-hint">Мы отправили 6-значный код на твой email</div>
          </div>
          <div class="form-group">
            <label>Код подтверждения</label>
            <input type="text" id="verify-code" maxlength="6" placeholder="000000"
              style="text-align:center;font-size:28px;font-weight:800;letter-spacing:10px;padding:14px">
          </div>
          <div class="form-error" id="verify-error"></div>
          <button class="btn btn-red" style="width:100%;padding:13px;font-size:15px;border-radius:10px" onclick="doVerify()">Подтвердить</button>
          <div class="modal-switch" style="margin-top:12px">Не пришло? <a onclick="resendCode()">Отправить снова</a></div>
        </div>

        <!-- СБРОС ПАРОЛЯ — шаг 1 -->
        <div id="form-forgot" style="display:none">
          <div style="text-align:center;margin-bottom:20px">
            <div style="width:56px;height:56px;background:rgba(224,48,48,0.12);border:1px solid rgba(224,48,48,0.25);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:26px;margin:0 auto 12px">🔑</div>
            <div style="font-weight:800;font-size:17px;margin-bottom:4px">Восстановление пароля</div>
            <div style="color:var(--text2);font-size:13px">Введи email — пришлём код для сброса</div>
          </div>
          <div class="form-group">
            <label>Email от аккаунта</label>
            <input type="email" id="forgot-email" required placeholder="your@email.com">
          </div>
          <div class="form-error" id="forgot-error"></div>
          <button class="btn btn-red" style="width:100%;padding:13px;font-size:15px;border-radius:10px" onclick="doForgot()">Отправить код</button>
          <div class="modal-switch" style="margin-top:12px"><a onclick="switchTab('login')">← Назад ко входу</a></div>
        </div>

        <!-- СБРОС ПАРОЛЯ — шаг 2 -->
        <div id="form-reset" style="display:none">
          <div style="text-align:center;margin-bottom:20px">
            <div style="font-weight:800;font-size:17px;margin-bottom:4px">🔑 Новый пароль</div>
            <div style="color:var(--text2);font-size:13px">Введи код из письма и придумай новый пароль</div>
          </div>
          <div class="form-group">
            <label>Код из письма</label>
            <input type="text" id="reset-code" maxlength="6" placeholder="000000"
              style="text-align:center;font-size:24px;font-weight:800;letter-spacing:8px;padding:13px">
          </div>
          <div class="form-group">
            <label>Новый пароль</label>
            <input type="password" id="reset-password" minlength="6" placeholder="От 6 символов">
          </div>
          <div class="form-error" id="reset-error"></div>
          <button class="btn btn-red" style="width:100%;padding:13px;font-size:15px;border-radius:10px" onclick="doReset()">Сменить пароль</button>
        </div>
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
