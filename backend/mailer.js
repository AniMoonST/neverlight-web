const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'neverlight.noreply@gmail.com',
    pass: 'eabtenкfwmqyjkwr'.replace('к','k')
  }
});

async function sendVerificationEmail(toEmail, username, code) {
  await transporter.sendMail({
    from: '"NeverLight" <neverlight.noreply@gmail.com>',
    to: toEmail,
    subject: 'Подтверждение регистрации — NeverLight',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#08080e;font-family:'Segoe UI',sans-serif">
  <div style="max-width:520px;margin:40px auto;background:#111120;border:1px solid #242438;border-radius:16px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#1a0a0a,#0a0a1a);padding:32px;text-align:center;border-bottom:1px solid #242438">
      <div style="font-size:28px;font-weight:900;color:#ff4444;letter-spacing:1px">✦ NeverLight</div>
      <div style="color:#8888a8;font-size:13px;margin-top:6px">Добро пожаловать в игру</div>
    </div>
    <div style="padding:36px 32px">
      <div style="font-size:20px;font-weight:700;margin-bottom:10px;color:#e8e8f0">Привет, ${username}!</div>
      <div style="color:#8888a8;font-size:14px;line-height:1.7;margin-bottom:28px">
        Для завершения регистрации введи код подтверждения на сайте NeverLight.
      </div>
      <div style="background:#08080e;border:1px solid #242438;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px">
        <div style="color:#8888a8;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px">Код подтверждения</div>
        <div style="font-size:42px;font-weight:900;letter-spacing:12px;color:#ff4444;text-shadow:0 0 20px rgba(255,68,68,0.4)">${code}</div>
        <div style="color:#8888a8;font-size:12px;margin-top:10px">Действует 15 минут</div>
      </div>
      <div style="color:#555570;font-size:12px;line-height:1.6">
        Если ты не регистрировался на NeverLight — просто проигнорируй это письмо.
      </div>
    </div>
    <div style="background:#0a0a14;border-top:1px solid #242438;padding:20px 32px;text-align:center">
      <div style="color:#555570;font-size:12px">© 2026 NeverLight. Не связан с Mojang Studios.</div>
    </div>
  </div>
</body>
</html>`
  });
}

async function sendPasswordResetEmail(toEmail, username, code) {
  await transporter.sendMail({
    from: '"NeverLight" <neverlight.noreply@gmail.com>',
    to: toEmail,
    subject: 'Сброс пароля — NeverLight',
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#08080e;font-family:'Segoe UI',sans-serif">
  <div style="max-width:520px;margin:40px auto;background:#111120;border:1px solid #242438;border-radius:16px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#1a0a0a,#0a0a1a);padding:32px;text-align:center;border-bottom:1px solid #242438">
      <div style="font-size:28px;font-weight:900;color:#ff4444;letter-spacing:1px">✦ NeverLight</div>
    </div>
    <div style="padding:36px 32px">
      <div style="font-size:20px;font-weight:700;margin-bottom:10px;color:#e8e8f0">Сброс пароля</div>
      <div style="color:#8888a8;font-size:14px;line-height:1.7;margin-bottom:28px">
        Привет, ${username}! Введи этот код для сброса пароля.
      </div>
      <div style="background:#08080e;border:1px solid #242438;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px">
        <div style="color:#8888a8;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px">Код сброса</div>
        <div style="font-size:42px;font-weight:900;letter-spacing:12px;color:#ff4444">${code}</div>
        <div style="color:#8888a8;font-size:12px;margin-top:10px">Действует 15 минут</div>
      </div>
      <div style="color:#555570;font-size:12px">Если ты не запрашивал сброс — проигнорируй письмо.</div>
    </div>
    <div style="background:#0a0a14;border-top:1px solid #242438;padding:20px 32px;text-align:center">
      <div style="color:#555570;font-size:12px">© 2026 NeverLight</div>
    </div>
  </div>
</body>
</html>`
  });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
