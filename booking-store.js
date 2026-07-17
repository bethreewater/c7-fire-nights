/* ============================================================
   夏夜火舞 · 訂位資料層 (booking-store.js) — Firebase 版
   ------------------------------------------------------------
   後端：Firestore（資料）+ Auth（後台登入）。
   對外介面 window.C7 與先前相同——讀取同步（自 onSnapshot 即時快取），
   異動非同步（回傳 Promise）。book.html / admin.html 幾乎不用改。

   需頁面先載入（在本檔之前）：
     firebase-app-compat.js / firebase-firestore-compat.js / firebase-auth-compat.js

   對外（window.C7）：
     讀（同步，自快取）：sessions() / capacity(pid) / bookings() / fmtCountdown(ms)
     寫（非同步，Promise）：createBooking(payload) / confirm(id) / cancel(id) / releaseExpired()
     Auth：signIn(email,pw) / signOut() / onAuth(cb) / isAdmin()
     其他：subscribe(fn) / PRICE / CAP / HOLD_MS
   場次 id 對外用 "6/20|night"；Firestore doc id 內部用 "6-20_night"。
   ============================================================ */
(function () {
  'use strict';

  var firebaseConfig = {
    apiKey: 'AIzaSyBXaOPYXcA-0_CrjwPrIxczXzCF5XrBqWk',
    authDomain: 'fire-nights.firebaseapp.com',
    projectId: 'fire-nights',
    storageBucket: 'fire-nights.firebasestorage.app',
    messagingSenderId: '1015755791708',
    appId: '1:1015755791708:web:86d331521465acf6b53599'
  };

  var CAP = 15;
  var HOLD_MS = 72 * 60 * 60 * 1000;
  var PRICE = 2508;   // 每人實收 = 標價 2,280 + 一成服務費（2280 × 1.1）
  var ADMIN_EMAIL = 'mryomryo@gmail.com';

  if (!window.firebase || !firebase.initializeApp) {
    console.error('[C7] Firebase SDK 未載入——請確認頁面在 booking-store.js 之前載入了 firebase compat 套件');
    return;
  }
  firebase.initializeApp(firebaseConfig);
  var db = firebase.firestore();
  var auth = firebase.auth();

  // 本機快取（IndexedDB）：回訪客場次「秒出」，背景再與伺服器同步。
  // 失敗（私密視窗等）安靜略過，不影響功能。
  try { db.enablePersistence({ synchronizeTabs: true }).catch(function () {}); } catch (e) {}

  // ---- id 映射：對外 "6/20|night"  ↔  Firestore doc id "6-20_night" ----
  function pageId(date, sitting) { return date + '|' + sitting; }
  function docId(pid) {
    var i = pid.indexOf('|');
    return pid.slice(0, i).replace('/', '-') + '_' + pid.slice(i + 1);
  }

  // ---- 即時快取 ----
  var _sessions = {};          // docId -> {docId,pid,date,sitting,label,time,cap,confirmedSeats,order}
  var _partners = {};          // CODE(大寫) -> {code,name,category,active}
  var _holdsBySession = {};    // docId -> [{id,seats,until,bookingId}]
  var _bookings = [];          // 後台才有（含個資）
  var _feedback = [];          // 後台才有（場後回饋）
  var _isAdmin = false;
  var _authCb = null;
  var listeners = [];

  function now() { return Date.now(); }
  function notify() { listeners.forEach(function (f) { try { f(); } catch (e) {} }); }
  function subscribe(fn) {
    listeners.push(fn);
    return function () { listeners = listeners.filter(function (f) { return f !== fn; }); };
  }

  // ---- 公開監聽：場次 + 保留 ----
  var _live = false;   // 伺服器快照已到（之後 REST 種子一律不覆蓋）
  db.collection('sessions').orderBy('order').onSnapshot(function (snap) {
    // 空的「快取」快照不作數（enablePersistence 首次/離線會先吐空快照，
    // 若拿它當權威會擋掉 REST 搶跑、骨架卡死）
    if (snap.empty && snap.metadata.fromCache) return;
    var m = {};
    snap.forEach(function (d) {
      var x = d.data();
      m[d.id] = {
        docId: d.id, pid: pageId(x.date, x.sitting),
        date: x.date, sitting: x.sitting, label: x.label, time: x.time,
        cap: (x.cap != null ? x.cap : CAP), confirmedSeats: (x.confirmedSeats || 0), order: (x.order || 0)
      };
    });
    if (!snap.metadata.fromCache) _live = true;   // 只有伺服器快照才鎖門
    _sessions = m;
    notify();
  }, function (e) { console.error('[C7] sessions 監聽錯誤', e); });

  // 夥伴折扣碼：公開可讀（book.html 驗碼用），僅後台可寫。CODE 用大寫當 doc id。
  db.collection('partners').onSnapshot(function (snap) {
    var m = {};
    snap.forEach(function (d) {
      var x = d.data() || {};
      var c = (x.code || d.id || '').toUpperCase();
      if (c) m[c] = { code: c, name: x.name || c, category: x.category || '其他', active: x.active !== false, discount: Math.max(0, Math.min(100, Number(x.discount) || 0)), commission: (x.commission != null ? Math.max(0, Math.min(100, Number(x.commission) || 0)) : 10) };
    });
    _partners = m;
    notify();
  }, function (e) { console.error('[C7] partners 監聽錯誤', e); });

  // ---- REST 搶跑：不等 SDK 建立連線，先用一發輕量 GET 把場次畫出來 ----
  // 首次訪客 SDK 下載＋連線要 1–3 秒，這發通常 ~0.3 秒就回。
  // 真快照（onSnapshot）一到就整批覆蓋；REST 只在還沒有任何資料時填入。
  try {
    fetch('https://firestore.googleapis.com/v1/projects/' + firebaseConfig.projectId +
          '/databases/(default)/documents/sessions?key=' + firebaseConfig.apiKey + '&pageSize=50')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j || !j.documents || _live || Object.keys(_sessions).length) return;
        var m = {};
        j.documents.forEach(function (doc) {
          var f = doc.fields || {};
          var sv = function (k) { return f[k] && f[k].stringValue; };
          var iv = function (k, dft) { return f[k] && f[k].integerValue != null ? Number(f[k].integerValue) : dft; };
          var date = sv('date'), sitting = sv('sitting');
          if (!date || !sitting) return;
          var id = doc.name.split('/').pop();
          m[id] = {
            docId: id, pid: pageId(date, sitting),
            date: date, sitting: sitting, label: sv('label') || '', time: sv('time') || '',
            cap: iv('cap', CAP), confirmedSeats: iv('confirmedSeats', 0), order: iv('order', 0)
          };
        });
        if (!_live && !Object.keys(_sessions).length && Object.keys(m).length) {
          _sessions = m;
          notify();
        }
      })
      .catch(function () {});
  } catch (e) {}

  db.collectionGroup('holds').onSnapshot(function (snap) {
    var m = {};
    snap.forEach(function (d) {
      var sidDoc = d.ref.parent.parent.id;   // sessions/{sidDoc}/holds/{id}
      var x = d.data();
      (m[sidDoc] = m[sidDoc] || []).push({ id: d.id, seats: x.seats || 0, until: x.until || 0, bookingId: x.bookingId });
    });
    _holdsBySession = m;
    notify();
  }, function (e) { console.error('[C7] holds 監聽錯誤', e); });

  // ---- 讀取（同步，自快取）----
  function sessions() {
    return Object.keys(_sessions).map(function (k) { return _sessions[k]; })
      .sort(function (a, b) { return a.order - b.order; })
      .map(function (s) { return { id: s.pid, date: s.date, sitting: s.sitting, label: s.label, time: s.time, cap: s.cap }; });
  }

  // 報名/匯款截止＝開演前 48 小時（2 天，讓主理人有時間備料）
  var BOOK_CUTOFF_MS = 48 * 60 * 60 * 1000;
  function sessionStartMs(s) {
    if (!s || !s.date) return null;
    var dp = String(s.date).split('/');
    var mo = parseInt(dp[0], 10), d = parseInt(dp[1], 10);
    if (!mo || !d) return null;
    var tp = String(s.time || '19:07').split(':');
    var hh = parseInt(tp[0], 10) || 0, mm = parseInt(tp[1], 10) || 0;
    return new Date(new Date().getFullYear(), mo - 1, d, hh, mm, 0).getTime();
  }

  function capacityByDoc(sd) {
    var s = _sessions[sd];
    var cap = s ? s.cap : CAP;
    var confirmed = s ? s.confirmedSeats : 0;
    var pending = 0, t = now();
    (_holdsBySession[sd] || []).forEach(function (h) { if (h.until > t) pending += h.seats; });
    var remaining = Math.max(0, cap - confirmed - pending);
    var startMs = sessionStartMs(s);
    var closed = (startMs != null) && (t >= startMs - BOOK_CUTOFF_MS);   // 開演前 48h 起停止報名
    return { cap: cap, confirmed: confirmed, pending: pending, remaining: remaining, full: remaining <= 0, closed: closed, startMs: startMs };
  }
  function capacity(pid) { return capacityByDoc(docId(pid)); }

  function bookings() {
    var t = now();
    return _bookings.slice().sort(function (a, b) { return b.createdAt - a.createdAt; })
      .map(function (b) {
        var status = b.status;
        if (status === 'pending' && b.holdUntil <= t) status = 'expired';
        return Object.assign({}, b, { status: status });
      });
  }

  // ---- 建立訂位：同步回傳本地物件 + 背景寫入 Firestore ----
  // book.html 以同步方式取用回傳值（sessionIds/party/holdUntil），故維持同步回傳。
  function createBooking(payload) {
    var t = now();
    var holdUntil = t + HOLD_MS;
    var pids = payload.sessionIds.slice();
    var party = payload.party;

    var bRef = db.collection('bookings').doc();
    var holdIds = {};                       // 以 docId 為 key（避免 '/' '|'）
    var batch = db.batch();
    pids.forEach(function (pid) {
      var sd = docId(pid);
      var hRef = db.collection('sessions').doc(sd).collection('holds').doc();
      holdIds[sd] = hRef.id;
      batch.set(hRef, { seats: party, until: holdUntil, bookingId: bRef.id, createdAt: t });
    });
    batch.set(bRef, {
      sessionIds: pids, sessionDocIds: pids.map(docId), holdIds: holdIds,
      party: party, name: (payload.name || '').trim(), phone: (payload.phone || '').trim(),
      email: (payload.email || '').trim(),
      diet: (payload.diet || []).slice(), last5: (payload.last5 || '').trim(),
      code: (payload.code || '').trim(), unitPrice: (payload.unitPrice || PRICE),
      status: 'pending', createdAt: t, holdUntil: holdUntil, confirmedAt: null
    });
    batch.commit().catch(function (e) {
      console.error('[C7] 訂位寫入失敗', e);
      try { alert('訂位送出失敗，請再試一次，或直接私訊 IG / 撥 0963-059-889。'); } catch (x) {}
    });

    return { id: bRef.id, sessionIds: pids, party: party, holdUntil: holdUntil, status: 'pending', createdAt: t, code: (payload.code || '').trim(), unitPrice: (payload.unitPrice || PRICE) };
  }

  function findBooking(id) { for (var i = 0; i < _bookings.length; i++) if (_bookings[i].id === id) return _bookings[i]; return null; }
  function holdRef(sd, hid) { return db.collection('sessions').doc(sd).collection('holds').doc(hid); }
  function docIdsOf(b) { return b.sessionDocIds || (b.sessionIds || []).map(docId); }

  // ---- 後台：確認到帳（交易：confirmedSeats += party、cap 檢查、刪 holds）----
  function confirm(bookingId) {
    var b = findBooking(bookingId);
    if (!b) return Promise.reject(new Error('找不到訂位'));
    var sds = docIdsOf(b);
    var refs = sds.map(function (sd) { return db.collection('sessions').doc(sd); });
    return db.runTransaction(function (tx) {
      return Promise.all(refs.map(function (r) { return tx.get(r); })).then(function (snaps) {
        snaps.forEach(function (snap) {
          var d = snap.data() || {};
          if ((d.confirmedSeats || 0) + b.party > (d.cap != null ? d.cap : CAP)) throw new Error('超過該場上限');
        });
        snaps.forEach(function (snap, i) {
          tx.update(refs[i], { confirmedSeats: (snap.data().confirmedSeats || 0) + b.party });
        });
        tx.update(db.collection('bookings').doc(bookingId), { status: 'confirmed', confirmedAt: now() });
        var hids = b.holdIds || {};
        sds.forEach(function (sd) { if (hids[sd]) tx.delete(holdRef(sd, hids[sd])); });
      });
    });
  }

  // ---- 後台：取消（pending/expired 釋放保留；confirmed 退回 confirmedSeats）----
  function cancel(bookingId) {
    var b = findBooking(bookingId);
    if (!b) return Promise.reject(new Error('找不到訂位'));
    var sds = docIdsOf(b);
    var hids = b.holdIds || {};
    if (b.status === 'confirmed') {
      var refs = sds.map(function (sd) { return db.collection('sessions').doc(sd); });
      return db.runTransaction(function (tx) {
        return Promise.all(refs.map(function (r) { return tx.get(r); })).then(function (snaps) {
          snaps.forEach(function (snap, i) {
            tx.update(refs[i], { confirmedSeats: Math.max(0, (snap.data().confirmedSeats || 0) - b.party) });
          });
          tx.update(db.collection('bookings').doc(bookingId), { status: 'cancelled' });
        });
      });
    }
    var batch = db.batch();
    batch.update(db.collection('bookings').doc(bookingId), { status: 'cancelled' });
    sds.forEach(function (sd) { if (hids[sd]) batch.delete(holdRef(sd, hids[sd])); });
    return batch.commit();
  }

  // ---- 後台：改期（把一筆訂位換到別的場次）----
  // confirmed：舊場退席次、新場扣席次（有滿場檢查）；pending：舊 hold 刪、新場開 hold（有名額檢查）；
  // expired：沒有佔位，只換場次（之後仍可「補確認到帳」）。寫入 rescheduledAt/prevSessionIds → 觸發通知信。
  function reschedule(bookingId, newPid) {
    if (!_isAdmin) return Promise.reject(new Error('需要管理員登入'));
    var b = findBooking(bookingId);
    if (!b) return Promise.reject(new Error('找不到訂位'));
    if (b.status === 'cancelled') return Promise.reject(new Error('已取消的訂位不能改期'));
    var oldSds = docIdsOf(b);
    if (oldSds.length !== 1) return Promise.reject(new Error('多場次訂位請手動處理'));
    var oldSd = oldSds[0], newSd = docId(newPid);
    if (oldSd === newSd) return Promise.resolve(false);          // 沒變
    var party = Number(b.party) || 0;
    var bRef = db.collection('bookings').doc(bookingId);
    var meta = { sessionIds: [newPid], sessionDocIds: [newSd], rescheduledAt: now(), prevSessionIds: (b.sessionIds || []) };

    if (b.status === 'confirmed') {
      var oldRef = db.collection('sessions').doc(oldSd), newRef = db.collection('sessions').doc(newSd);
      return db.runTransaction(function (tx) {
        return Promise.all([tx.get(oldRef), tx.get(newRef)]).then(function (snaps) {
          if (!snaps[1].exists) throw new Error('新場次不存在');
          var oldD = snaps[0].data() || {}, newD = snaps[1].data() || {};
          var newCap = newD.cap != null ? newD.cap : CAP;
          if ((newD.confirmedSeats || 0) + party > newCap) throw new Error('新場次已滿，改不過去');
          tx.update(oldRef, { confirmedSeats: Math.max(0, (oldD.confirmedSeats || 0) - party) });
          tx.update(newRef, { confirmedSeats: (newD.confirmedSeats || 0) + party });
          tx.update(bRef, meta);
        });
      }).then(function () { return true; });
    }

    // pending / expired
    var batch = db.batch(), hids = b.holdIds || {};
    if (b.status === 'pending') {
      if (capacityByDoc(newSd).remaining < party) return Promise.reject(new Error('新場次名額不足'));
      var nh = db.collection('sessions').doc(newSd).collection('holds').doc();
      batch.set(nh, { seats: party, until: b.holdUntil, bookingId: bookingId, createdAt: now() });
      var nhIds = {}; nhIds[newSd] = nh.id;
      meta.holdIds = nhIds;
    }
    if (hids[oldSd]) batch.delete(holdRef(oldSd, hids[oldSd]));
    batch.update(bRef, meta);
    return batch.commit().then(function () { return true; });
  }

  // ---- 後台：手動調整「已確認席次」（IG／電話訂位入帳、釋放保留席）----
  // 直接增減 sessions.confirmedSeats，鎖在 0..cap 之間。
  function adjustSeats(pid, delta) {
    if (!_isAdmin) return Promise.reject(new Error('需要管理員登入'));
    var ref = db.collection('sessions').doc(docId(pid));
    return db.runTransaction(function (tx) {
      return tx.get(ref).then(function (snap) {
        var d = snap.data() || {};
        var cap = d.cap != null ? d.cap : CAP;
        var next = Math.max(0, Math.min(cap, (d.confirmedSeats || 0) + delta));
        tx.update(ref, { confirmedSeats: next });
      });
    });
  }

  // ---- 後台：釋放逾時 pending（標 expired + 刪 holds，放回名額）----
  // 公開端不需要：capacity() 已用 until>now 過濾逾時保留，不影響顯示。
  function releaseExpired() {
    if (!_isAdmin) return Promise.resolve(false);
    var t = now(), batch = db.batch(), n = 0;
    _bookings.forEach(function (b) {
      if (b.status === 'pending' && b.holdUntil <= t) {
        batch.update(db.collection('bookings').doc(b.id), { status: 'expired' });
        var sds = docIdsOf(b), hids = b.holdIds || {};
        sds.forEach(function (sd) { if (hids[sd]) batch.delete(holdRef(sd, hids[sd])); });
        n++;
      }
    });
    if (!n) return Promise.resolve(false);
    return batch.commit().then(function () { return true; }).catch(function (e) { console.error('[C7] releaseExpired', e); return false; });
  }

  function feedback() { return _feedback.slice(); }

  // ---- 夥伴折扣碼 ----
  function partners() { return Object.keys(_partners).map(function (k) { return _partners[k]; }); }
  function findPartner(code) {                       // 公開：book.html 驗碼（只認啟用中的）
    var p = _partners[(code || '').trim().toUpperCase()];
    return (p && p.active) ? p : null;
  }
  function savePartner(p) {                           // 後台：新增/更新一個夥伴碼
    if (!_isAdmin) return Promise.reject(new Error('需要管理員登入'));
    var code = (p.code || '').trim().toUpperCase();
    if (!code) return Promise.reject(new Error('缺少代碼'));
    var doc = { code: code, createdAt: p.createdAt || now() };
    if (p.name != null) doc.name = String(p.name).trim();
    if (p.category != null) doc.category = p.category || '其他';
    if (p.active != null) doc.active = p.active !== false;
    if (p.discount != null) doc.discount = Math.max(0, Math.min(100, Number(p.discount) || 0));
    if (p.commission != null) doc.commission = Math.max(0, Math.min(100, Number(p.commission) || 0));
    return db.collection('partners').doc(code).set(doc, { merge: true });
  }
  function deletePartner(code) {                       // 後台：刪除
    if (!_isAdmin) return Promise.reject(new Error('需要管理員登入'));
    return db.collection('partners').doc((code || '').trim().toUpperCase()).delete();
  }

  function reset() { console.warn('[C7] reset() 在正式版停用（資料在 Firestore）'); }

  // ---- Auth ----
  var bookingsUnsub = null;
  var feedbackUnsub = null;
  function signIn(email, password) { return auth.signInWithEmailAndPassword(email, password); }
  function signOut() { return auth.signOut(); }
  function onAuth(cb) { _authCb = cb; return auth.onAuthStateChanged(cb); }
  function isAdmin() { return _isAdmin; }

  auth.onAuthStateChanged(function (user) {
    _isAdmin = !!(user && user.email === ADMIN_EMAIL);
    if (_isAdmin) {
      if (!bookingsUnsub) {
        bookingsUnsub = db.collection('bookings').onSnapshot(function (snap) {
          var arr = [];
          snap.forEach(function (d) { var x = d.data(); x.id = d.id; arr.push(x); });
          _bookings = arr;
          notify();
        }, function (e) { console.error('[C7] bookings 監聽錯誤', e); });
      }
      if (!feedbackUnsub) {
        feedbackUnsub = db.collection('feedback').orderBy('createdAt', 'desc').onSnapshot(function (snap) {
          var arr = [];
          snap.forEach(function (d) { var x = d.data(); x.id = d.id; arr.push(x); });
          _feedback = arr;
          notify();
        }, function (e) { console.error('[C7] feedback 監聽錯誤', e); });
      }
    } else {
      if (bookingsUnsub) { bookingsUnsub(); bookingsUnsub = null; }
      if (feedbackUnsub) { feedbackUnsub(); feedbackUnsub = null; }
      _bookings = [];
      _feedback = [];
    }
    notify();
  });

  // ---- 倒數格式 ----
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function fmtCountdown(ms) {
    if (ms <= 0) return '00:00:00';
    var s = Math.floor(ms / 1000);
    var h = Math.floor(s / 3600); s -= h * 3600;
    var m = Math.floor(s / 60); s -= m * 60;
    return pad(h) + ':' + pad(m) + ':' + pad(s);
  }

  window.C7 = {
    CAP: CAP, PRICE: PRICE, HOLD_MS: HOLD_MS, BOOK_CUTOFF_MS: BOOK_CUTOFF_MS,
    sessions: sessions, capacity: capacity, bookings: bookings, feedback: feedback,
    createBooking: createBooking, confirm: confirm, cancel: cancel, reschedule: reschedule,
    adjustSeats: adjustSeats,
    partners: partners, findPartner: findPartner, savePartner: savePartner, deletePartner: deletePartner,
    releaseExpired: releaseExpired, reset: reset,
    subscribe: subscribe, fmtCountdown: fmtCountdown,
    signIn: signIn, signOut: signOut, onAuth: onAuth, isAdmin: isAdmin
  };
})();
