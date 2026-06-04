/* 夏夜火舞 · 訂位確認信
   觸發：bookings/{id} 更新且 status 變為 'confirmed' 且有填 email → 寄一封確認信。
   寄信：Gmail SMTP（帳號 mryomryo@gmail.com + 應用程式密碼，存在 Secret Manager）。
*/
const { onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const nodemailer = require('nodemailer');

const GMAIL_PASS = defineSecret('GMAIL_PASS');   // 應用程式密碼（部署時設定，不入碼）
const GMAIL_USER = 'mryomryo@gmail.com';
const PRICE = 1999;

const SITTING = {
  sunset: { label: 'Sunset', time: '18:00', arrive: '17:30–17:50' },
  night:  { label: 'Night',  time: '20:00', arrive: '19:50–20:05' },
};

// "6/20|night" → { date:"6/20", label:"Night", time:"20:00", arrive:"19:50–20:05" }
function parseSession(pid) {
  const i = pid.indexOf('|');
  const date = pid.slice(0, i);
  const s = SITTING[pid.slice(i + 1)] || { label: pid.slice(i + 1), time: '', arrive: '' };
  return { date, label: s.label, time: s.time, arrive: s.arrive };
}
function esc(x) {
  return String(x == null ? '' : x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

exports.sendConfirmEmail = onDocumentUpdated(
  { document: 'bookings/{bookingId}', region: 'asia-east1', secrets: [GMAIL_PASS] },
  async (event) => {
    const id = event.params.bookingId;
    const before = event.data.before.data() || {};
    const after = event.data.after.data() || {};
    console.log(`[confirm-email] ${id}: ${before.status} -> ${after.status}, email=${after.email || '(無)'}`);

    // 僅在「剛轉為 confirmed」且有 email 時寄
    if (before.status === 'confirmed' || after.status !== 'confirmed') { console.log('  跳過：非新確認'); return; }
    const to = (after.email || '').trim();
    if (!to) { console.log('  跳過：沒填 email'); return; }

    const ids = after.sessionIds || [];
    const parsed = ids.map(parseSession);
    const party = after.party || 0;
    const amount = (party * PRICE * ids.length).toLocaleString('en-US');

    const rows = parsed.map((s) =>
      `<tr><td style="padding:6px 0;color:#555;">${esc(s.date)}（六）</td>` +
      `<td style="padding:6px 0;text-align:right;font-weight:600;">${esc(s.label)} ${esc(s.time)}</td></tr>` +
      `<tr><td colspan="2" style="padding:0 0 10px;color:#999;font-size:13px;">請於 ${esc(s.arrive)} 抵達</td></tr>`
    ).join('');

    const html = `<!DOCTYPE html><html><body style="margin:0;background:#f4f1ec;font-family:-apple-system,'Helvetica Neue',Arial,'PingFang TC','Microsoft JhengHei',sans-serif;color:#1a1a1a;">
  <div style="max-width:520px;margin:0 auto;padding:36px 28px;">
    <div style="font-size:12px;letter-spacing:3px;color:#D14820;text-transform:uppercase;">Container No.7 · 夏夜火舞</div>
    <h1 style="font-size:26px;margin:14px 0 6px;font-weight:700;">訂位已確認</h1>
    <p style="color:#555;line-height:1.7;margin:0 0 22px;">${esc(after.name || '')} 你好，已收到你的款項，位子幫你留好了。</p>

    <table style="width:100%;border-collapse:collapse;border-top:1px solid #e0dace;border-bottom:1px solid #e0dace;margin-bottom:8px;">
      ${rows}
      <tr><td style="padding:10px 0 6px;color:#555;border-top:1px solid #efe;">人數</td><td style="padding:10px 0 6px;text-align:right;font-weight:600;border-top:1px solid #efe9df;">${esc(party)} 位</td></tr>
      <tr><td style="padding:0 0 10px;color:#555;">已付金額</td><td style="padding:0 0 10px;text-align:right;font-weight:600;">NT$ ${amount}</td></tr>
    </table>

    <p style="color:#555;line-height:1.8;font-size:14px;margin:18px 0 0;">
      草皮、戶外、夏夜——好走的鞋、輕鬆的衣服，會微涼可帶薄外套。<br>
      遇雨（含小雨）或風大不安全，當天整場免費改期，我們會主動聯絡你。
    </p>
    <p style="color:#999;line-height:1.8;font-size:13px;margin:18px 0 0;">
      有任何問題：IG @container_no.7_penghu ／ 電話 0963-059-889<br>
      ——七號貨櫃
    </p>
  </div>
</body></html>`;

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', port: 465, secure: true,
      auth: { user: GMAIL_USER, pass: GMAIL_PASS.value() },
    });

    try {
      await transporter.sendMail({
        from: `"夏夜火舞 · 七號貨櫃" <${GMAIL_USER}>`,
        to,
        subject: `訂位已確認 · 夏夜火舞 ${parsed.map((s) => s.date + ' ' + s.label).join('、')}`,
        html,
      });
      console.log('  ✓ 已寄出至 ' + to);
    } catch (e) {
      console.error('  ✗ 寄信失敗: ' + (e && e.message));
      throw e;
    }
  }
);
