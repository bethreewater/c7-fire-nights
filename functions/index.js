/* 夏夜火舞 · 訂位確認信
   觸發：bookings/{id} 更新且 status 變為 'confirmed' 且有填 email → 寄一封確認信。
   寄信：Gmail SMTP（帳號 mryomryo@gmail.com + 應用程式密碼，存在 Secret Manager）。
*/
const { onDocumentUpdated, onDocumentCreated } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const nodemailer = require('nodemailer');

const GMAIL_PASS = defineSecret('GMAIL_PASS');   // 應用程式密碼（部署時設定，不入碼）
const GMAIL_USER = 'mryomryo@gmail.com';
const PRICE = 2508;   // 每人實收 = 標價 2,280 + 一成服務費（2280 × 1.1）

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

// ============================================================
// 內測回饋通知：feedback collection 一有新筆 → email 給主理人
// ============================================================
const FB_LABELS = [
  ['session', '場次'], ['name', '稱呼'], ['firstVisit', '首次來店'],
  ['q1_length', 'Q1 110 分鐘長度'],
  ['q2_again', 'Q2 願意再參加'], ['q2_why', '　└ 原因'],
  ['q3_price', 'Q3 票價 2,280 感受'], ['q3_note', '　└ 補充'],
  ['q4_dance', 'Q4 最愛火舞段'], ['q4_why', '　└ 原因'], ['q4a_light', 'Q4a 第一段光線(Sunset)'],
  ['q5_pace', 'Q5 出餐節奏'], ['q5_stuck', '　└ 最卡的一波'],
  ['q6_service', 'Q6 服務'], ['q6_note', '　└ 具體'],
  ['q7_fav', 'Q7 最愛餐點'],
  ['q8_weak', 'Q8 最弱餐點'], ['q8_why', '　└ 原因'],
  ['q9_portion', 'Q9 份量'],
  ['q10_view', 'Q10 座位視野'], ['q10_seat', '　└ 座位'],
  ['q11_comfort', 'Q11 草皮舒適度'], ['q11_note', '　└ 具體'],
  ['q12_rec', 'Q12 會推薦朋友'], ['q12_who', '　└ 推薦給誰／原因'],
  ['q13_improve', '★ Q13 最想改的一件事'],
  ['consent', '引用同意'], ['ig', 'IG／Threads'],
];

exports.notifyFeedback = onDocumentCreated(
  { document: 'feedback/{fid}', region: 'asia-east1', secrets: [GMAIL_PASS] },
  async (event) => {
    const d = (event.data && event.data.data()) || {};
    console.log(`[feedback] 新回饋 ${event.params.fid}: ${d.session || ''} ${d.name || ''}`);

    const rows = FB_LABELS.map((pair) => {
      const key = pair[0], label = pair[1];
      let v = d[key];
      if (Array.isArray(v)) v = v.join('、');
      if (v == null || v === '') return '';
      const hi = key === 'q13_improve';
      return `<tr><td style="padding:7px 12px 7px 0;color:#888;font-size:13px;white-space:nowrap;vertical-align:top;">${esc(label)}</td>` +
             `<td style="padding:7px 0;color:${hi ? '#D14820' : '#1a1a1a'};font-weight:${hi ? '700' : '400'};">${esc(v)}</td></tr>`;
    }).join('');

    const w = new Date(Number(d.createdAt) || Date.now());
    const whenStr = `${w.getMonth() + 1}/${w.getDate()} ${String(w.getHours()).padStart(2, '0')}:${String(w.getMinutes()).padStart(2, '0')}`;

    const html = `<!DOCTYPE html><html><body style="margin:0;background:#f4f1ec;font-family:-apple-system,'Helvetica Neue',Arial,'PingFang TC','Microsoft JhengHei',sans-serif;color:#1a1a1a;">
  <div style="max-width:560px;margin:0 auto;padding:32px 26px;">
    <div style="font-size:12px;letter-spacing:3px;color:#D14820;text-transform:uppercase;">Container No.7 · 夏夜火舞 · 內測回饋</div>
    <h1 style="font-size:22px;margin:12px 0 4px;font-weight:700;">${esc(d.name || '匿名')} · ${esc(d.session || '未填場次')}</h1>
    <p style="color:#888;font-size:13px;margin:0 0 20px;">${whenStr} 送出</p>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #e0dace;">${rows}</table>
    <p style="color:#999;font-size:12px;margin:22px 0 0;line-height:1.7;">完整列表在訂位後台「內測回饋」分頁。<br>——夏夜火舞</p>
  </div>
</body></html>`;

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', port: 465, secure: true,
      auth: { user: GMAIL_USER, pass: GMAIL_PASS.value() },
    });
    try {
      await transporter.sendMail({
        from: `"夏夜火舞 · 回饋" <${GMAIL_USER}>`,
        to: GMAIL_USER,
        subject: `新內測回饋 · ${d.session || ''} · ${d.name || '匿名'}`,
        html,
      });
      console.log('  ✓ 回饋通知已寄出');
    } catch (e) {
      console.error('  ✗ 回饋通知寄信失敗: ' + (e && e.message));
    }
  }
);
