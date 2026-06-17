/* analytics.js — 行為分析載入器
   啟用方式：把下面 CLARITY_ID 改成 clarity.microsoft.com 專案的 id，重新部署即可全站生效。
   空字串＝休眠：不載入任何追蹤、所有 c7track 事件為 no-op（零風險、可安心上線）。
   隱私：Clarity 預設遮罩輸入內容；只收行為（捲動/點擊/停留），不收個資。 */
(function () {
  var CLARITY_ID = "";   // <-- 待填，例如 "abcde12345"

  // 漏斗事件：有 Clarity 才送，否則安全 no-op
  window.c7track = function (name) {
    try { if (window.clarity) window.clarity("event", name); } catch (e) {}
  };

  if (!CLARITY_ID) return;   // 沒填 id → 不載入、不追蹤

  (function (c, l, a, r, i, t, y) {
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
    t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
    y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
  })(window, document, "clarity", "script", CLARITY_ID);
})();
