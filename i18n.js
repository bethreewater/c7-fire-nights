/* ============================================================
   夏夜火舞 · 官網多語 (i18n.js)
   ------------------------------------------------------------
   做法：選擇器字典。HTML 以中文為預設（SEO 不變）；切換語言時
   依 selector 換 innerHTML，切回中文時還原開機快照。
   動態字串（即時名額／倒數／彩蛋）由 window.C7L 提供，
   切換時發 'c7lang' 事件，index 內的渲染器自行重畫。
   日韓字體：html[lang] 切系統字體（不另載 webfont）。
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 動態字串（index 的 JS 會讀 window.C7L）---------- */
  var L = {
    zh: {
      sat: '（六）', seasonOver: '本季十二場已收官 — 明年夏天見',
      full: '● 已滿', last: '◐ 最後 {n} 位', some: '◐ 剩 {n} 位', more: '○ 剩 {n} 位',
      ended: '已落幕', why: '來了就知道。'
    },
    en: {
      sat: ' (Sat) ', seasonOver: 'All twelve nights are done — see you next summer',
      full: '● Full', last: '◐ Last {n}', some: '◐ {n} left', more: '○ {n} left',
      ended: 'Ended', why: 'Come and you’ll know.'
    },
    ja: {
      sat: '（土）', seasonOver: '今季の十二夜は終了 — また来年の夏に',
      full: '● 満席', last: '◐ 残り {n} 席', some: '◐ 残り {n} 席', more: '○ 残り {n} 席',
      ended: '終了', why: '来ればわかります。'
    },
    ko: {
      sat: ' (토) ', seasonOver: '올여름 열두 밤은 끝났습니다 — 내년 여름에',
      full: '● 매진', last: '◐ 마지막 {n}석', some: '◐ {n}석 남음', more: '○ {n}석 남음',
      ended: '종료', why: '와보면 압니다.'
    }
  };

  /* ---------- 頁面文案字典：[selector, innerHTML] ----------
     zh 不需要字典（DOM 預設即中文，切回時還原快照）。 */
  var DICT = {};

  DICT.en = [
    /* HERO */
    ['.hero .lead', 'You strike the first match.<br>For the next hundred and ten minutes, that fire leaps into the sky, sears onto your plate — and comes back to your hands.'],
    ['.hero .bottom-meta div:nth-child(3)', 'Summer only · NT$ 2,280 · one night'],
    /* ISLAND */
    ['#island .display-h-zh', 'An island born of fire'],
    ['#island .story p:nth-of-type(1)', 'This island was made by fire — seventeen million years before you.'],
    ['#island .story p:nth-of-type(2)', 'The sea floor split; magma rose and cooled, and Penghu grew out of the ocean. The black rock underfoot is fire gone cold.'],
    ['#island .story p:nth-of-type(3)', 'Fire built the island, then stopped.<br>The island stayed — and fed everything on it.'],
    ['#island .story p:nth-of-type(4)', 'The squid beneath the reef is your <strong>starter</strong>.<br>The island’s oldest herb, with the cactus the Dutch brought four hundred years ago, ferments into your <strong>first glass</strong>.<br>The slow-growing prawn by the reef is your <strong>main</strong>.<br>The last course is <strong>shaved ice</strong> with the season’s fruit — a whole hot evening deserves it.'],
    ['#island .story p:nth-of-type(5)', 'Seventeen million years — one island made of fire, grown into the table in front of you.'],
    ['#island .story p:nth-of-type(6)', 'Tonight, the fire starts in your hands.<br>One match lights the lamp on your table; Duchi takes it and dances it across the dark; course by course, it returns to your bowl.<br>And at the end — back to your hands.'],
    ['#island .story p:nth-of-type(7)', 'A hundred and ten minutes. No fast-forward.<br>You won’t want one.'],
    ['#island .story p:nth-of-type(8)', 'When you leave, take a little fire with you.<br>It built an island, fed its people for generations, and danced tonight’s dance.<br>This fire doesn’t go out — from here on, you carry it.'],
    /* SESSIONS */
    ['#sessions .display-h-zh', 'One sitting'],
    ['#sessions .session-block .label', 'One night, every Saturday'],
    ['#sessions .session-block .desc', 'Curtain at 19:07 — you sit down in dusk.'],
    ['#why907', 'Why 19:07?'],
    ['#sessions .session-block .body', 'When you take your seat, the sky is just starting to dim.<br><br>Over one dinner, the darker it gets, the brighter the fire — until the only light on you is the flame. From daylight into night: one sitting, that’s all.'],
    ['.five-cta > p:first-child', 'Want a night of your own? Gather five or more, message us — we’ll open a date for you.'],
    ['.five-cta-links', 'IG <a href="https://www.instagram.com/container_no.7_penghu/" target="_blank" rel="noopener" class="inline-link">@container_no.7_penghu&nbsp;↗</a> · Phone <a href="tel:+886963059889" class="inline-link">0963-059-889</a>'],
    /* MENU */
    ['#menu .display-h-zh', 'Four courses'],
    ['#menu .lede', 'Four courses, woven between two fire dances — one at a time, never rushed.<br>One evening: two fire dances, four courses, a hundred and ten minutes — NT$2,280 per person<small style="color:var(--paper-mute);font-weight:400;"> (+10% service)</small> (was NT$2,980).'],
    ['.mcourse:nth-of-type(1) .mc-zh', 'Welcome'],
    ['.mcourse:nth-of-type(1) .mc-name', 'Bread · Dip · Cactus &amp; Fengru Kombucha'],
    ['.mcourse:nth-of-type(1) .mc-line', 'The sky just dimming. Your first glass is the island’s oldest herb.'],
    ['.mcourse:nth-of-type(2) .mc-zh', 'Starter'],
    ['.mcourse:nth-of-type(2) .mc-name', 'Fresh Squid Salad'],
    ['.mcourse:nth-of-type(2) .mc-line', 'Squid from beneath the reef — at the fish market this very morning.'],
    ['.mcourse:nth-of-type(3) .mc-zh', 'Main'],
    ['.mcourse:nth-of-type(3) .mc-name', 'Seared Duck Breast · Wild Penghu Prawn'],
    ['.mcourse:nth-of-type(3) .mc-line', 'Fire on the plate. The prawns sear to order — they won’t be rushed.'],
    ['.mcourse:nth-of-type(4) .mc-zh', 'Dessert'],
    ['.mcourse:nth-of-type(4) .mc-name', 'Seasonal Fruit Shaved Ice'],
    ['.mcourse:nth-of-type(4) .mc-line', 'A whole hot evening. Time to cool down.'],
    ['#mClose', 'And at the end, the fire returns to your hands.'],
    ['#mHint', 'Scroll — follow the night'],
    ['#schedLive', 'Live availability<span class="lg">○ Open</span><span class="lg">◐ Filling</span><span class="lg">● Full</span>'],
    ['.menu-fallback .course-tile:nth-child(1) .zh', 'Welcome bread<br>dip<br>cactus &amp; fengru kombucha'],
    ['.menu-fallback .course-tile:nth-child(2) .zh', 'Fresh squid salad'],
    ['.menu-fallback .course-tile:nth-child(3) .zh', 'Seared duck breast<br>wild Penghu prawn'],
    ['.menu-fallback .course-tile:nth-child(4) .zh', 'Seasonal fruit<br>shaved ice'],
    ['.menu-fallback > p', 'Squid and prawns are bought at the fish market that very morning — fresh, guaranteed.'],
    /* PERFORMER */
    ['#performer .display-h-zh', 'Phoenix Dancer · Duchi'],
    ['#performer .lede', 'Fire performer.<br>He has built a full programme for Container No.7 this summer.'],
    ['#performer .body-p', 'Two fire dances — one after the welcome, one after the main course. And at the close, the fire comes back to your hands.'],
    /* FLOW */
    ['#flow .display-h-zh', 'The shape of an evening'],
    ['#flow .lede', 'No minute-by-minute schedule — it can’t be fast-forwarded, so you won’t need a watch.'],
    ['#flow .beat:nth-child(1) .what', '<strong>Arrival</strong>One match, and the lamp on your table is lit. The first flame of the night is yours.'],
    ['#flow .beat:nth-child(2) .what', '<strong>First fire</strong>The tea still warm, Duchi takes the flame you lit and dances the first piece. Then starter and main, unhurried.'],
    ['#flow .beat:nth-child(3) .what', '<strong>Second fire</strong>After the main course the sky is fully dark — the fire rises again, and it’s the only light left on you.'],
    ['#flow .beat:nth-child(4) .what', '<strong>Last</strong>Something cold for dessert. Then the last flame comes back to your hands. You’ll take a little with you — how, you’ll see.'],
    /* SCHEDULE */
    ['#schedule .display-h-zh', 'Twelve Saturdays'],
    ['#schedule .spread p.lede', 'June through August · one night every Saturday, 19:07.<br>Twelve Saturdays, twelve evenings from dusk into night.'],
    ['.reserve > p.lede', 'Each night is whole — two fire dances, four courses, a hundred and ten minutes. One sitting every Saturday, fifteen seats at most.'],
    ['.reserve-item:nth-child(1) .rk', 'Seats per night'],
    ['.reserve-item:nth-child(1) .rv', '8–15<span class="rsub">small on purpose — full is full</span>'],
    ['.reserve-item:nth-child(2) .rk', 'Summer only'],
    ['.reserve-item:nth-child(2) .rv', '<s style="font-size:0.5em;color:var(--paper-mute);font-weight:400;margin-right:5px;vertical-align:2px;">NT$2,980</s>NT$2,280<span class="rsub">/person · +10% service</span>'],
    ['.reserve-item:nth-child(3) .rk', 'Booking closes'],
    ['.reserve-item:nth-child(3) .rv', 'Day before<span class="rsub">22:00</span>'],
    ['.reserve-how', 'Book online — live seats, instant pick. Or DM <a href="https://www.instagram.com/container_no.7_penghu/" target="_blank" rel="noopener" class="inline-link">@container_no.7_penghu&nbsp;↗</a> or call <a href="tel:+886963059889" class="inline-link">0963-059-889</a>.'],
    ['#openBook', 'Reserve'],
    ['.cta-block .bf-note', 'Tap any date above — or this button — to pick seats live.'],
    /* TERMS */
    ['#terms .display-h-zh', 'The fine print'],
    ['#terms .qa:nth-of-type(2) .q', '<span class="num">06.1</span>Weather'],
    ['#terms .qa:nth-of-type(2) .a', 'CWA land or sea typhoon warning → full refund or free rebooking.<br>Fire needs dry weather: rain on the day (even drizzle), or wind the performer judges unsafe, moves your whole night — dinner and fire together — to any later date, free. Penghu is a windy island; in ordinary wind the show goes on. The performer makes the call.'],
    ['#terms .qa:nth-of-type(3) .q', '<span class="num">06.2</span>Refunds'],
    ['#terms .qa:nth-of-type(3) .a', '5+ days before: full refund. 2–5 days: 50%. Under 2 days: no refund, rebooking allowed. Typhoon warnings are always excepted.'],
    ['#terms .qa:nth-of-type(4) .q', '<span class="num">06.3</span>Arrival'],
    ['#terms .qa:nth-of-type(4) .a', 'Arrive 18:40–19:05; curtain at 19:07. More than 15 minutes late counts as a no-show.'],
    ['#terms .qa:nth-of-type(5) .q', '<span class="num">06.4</span>Dietary'],
    ['#terms .qa:nth-of-type(5) .a', 'Tell us when you book. No duck, shellfish allergy, egg or dairy allergy, vegetarian, no spice — all covered.'],
    ['#terms .qa:nth-of-type(6) .q', '<span class="num">06.5</span>Ingredients'],
    ['#terms .qa:nth-of-type(6) .a', 'Freshness first — most ingredients are bought at the morning market that day. If something runs out, we may substitute a dish of equal value.'],
    /* FAQ */
    ['#faq .display-h-zh', 'Before you come'],
    ['#faq .qa:nth-of-type(2) .q', '<span class="num">07.1</span>Can I use my phone?'],
    ['#faq .qa:nth-of-type(2) .a', 'We don’t take your phone. All night — photos, video, stories, all welcome.'],
    ['#faq .qa:nth-of-type(3) .q', '<span class="num">07.2</span>Just the fire, without dinner?'],
    ['#faq .qa:nth-of-type(3) .a', 'No. It’s one whole evening — the fire and the meal don’t separate.'],
    ['#faq .qa:nth-of-type(4) .q', '<span class="num">07.3</span>What should I wear?'],
    ['#faq .qa:nth-of-type(4) .a', 'Grass, outdoors, a summer night. Easy shoes, easy clothes. Bring a light jacket.'],
    ['#faq .qa:nth-of-type(5) .q', '<span class="num">07.4</span>Can I bring kids?'],
    ['#faq .qa:nth-of-type(5) .a', 'Yes — ages 6 and up recommended (the fire is loud, the dinner is long).'],
    ['#faq .qa:nth-of-type(6) .q', '<span class="num">07.5</span>Is there alcohol in the kombucha?'],
    ['#faq .qa:nth-of-type(6) .a', 'House-fermented, ABV under 0.5% — legally a non-alcoholic drink in Taiwan.'],
    ['#faq .qa:nth-of-type(7) .q', '<span class="num">07.6</span>Allergies or dietary needs?'],
    ['#faq .qa:nth-of-type(7) .a', 'No duck, shellfish, egg or dairy, vegetarian, no spice — all have alternatives. Tell us when you book; we can’t adjust on the night if it wasn’t noted.'],
    ['#faq .qa:nth-of-type(8) .q', '<span class="num">07.7</span>Do we have to leave right after?'],
    ['#faq .qa:nth-of-type(8) .a', 'No rush. After the hundred and ten minutes, the bar returns to normal service — stay for another glass.'],
    /* VISIT */
    ['#visit .display-h-zh', 'Visit'],
    ['#visit .visit-item:nth-child(1) .val', 'Container No.7 · Magong, Penghu<br><span class="addr-pending">Full address &amp; map coming soon</span>'],
    /* FAB */
    ['.fp-tag', 'Summer only'],
    ['.fp-count', '8–15 seats'],
    ['.fp-per', '/person · +10% service'],
    ['.fp-price s', 'was NT$ 2,980'],
    ['.fp-btn', 'Book now']
  ];

  /* 日文・韓文字典：與 en 同樣的 selector 順序（由翻譯流程填入） */
  DICT.ja = [
    /* HERO */
    ['.hero .lead', '最初のマッチは、あなたが擦る。<br>それからの百十分、その火は空へ舞い上がり、皿に焼きつき、最後はあなたの手へ戻ってくる。'],
    ['.hero .bottom-meta div:nth-child(3)', '夏季限定 NT$ 2,280 · 一夜'],
    /* ISLAND */
    ['#island .display-h-zh', '火から生まれた島'],
    ['#island .story p:nth-of-type(1)', 'この島は、火でできている——あなたより一千七百万年も古い。'],
    ['#island .story p:nth-of-type(2)', '海底が噴き、マグマが湧き上がって冷え、澎湖（ポンフー）はそうして海から生まれた——黒いのは、冷めた火。'],
    ['#island .story p:nth-of-type(3)', '火は島をつくり、やがて止んだ。<br>島は残り、その上のすべてを養ってきた。'],
    ['#island .story p:nth-of-type(4)', '岩礁の下のケンサキイカは、あなたの<strong>前菜</strong>。<br>島でいちばん古い草は、四百年前にオランダ人が持ち込んだ棘とともに醸され、あなたの<strong>最初の一杯</strong>になる。<br>礁のそばでゆっくり育つ海老は、あなたの<strong>主菜</strong>。<br>最後の一皿は旬の果実の<strong>シャーベット</strong>——ひと晩じゅう熱かったから、少し涼む頃。'],
    ['#island .story p:nth-of-type(5)', '一千七百万年、火でできたひとつの島が、あなたの目の前のこの一卓に育った。'],
    ['#island .story p:nth-of-type(6)', '今夜、火はあなたの手から始まる。<br>一本のマッチが、卓上のランプを灯す。ドゥチ（Duchi）がその火を受け取り、夜空いっぱいに舞わせる。そして一皿また一皿、あなたの器へ戻ってくる。<br>最後に、もう一度あなたの手へ。'],
    ['#island .story p:nth-of-type(7)', '百十分、早送りはできない。<br>そうしたいとも、思わないはず。'],
    ['#island .story p:nth-of-type(8)', '帰るとき、少しだけ火を持っていって。<br>島をひとつ築き、何代もの島の人を養い、今夜のひと舞いを踊り終えた火。<br>この火は消えない——ここから先は、あなたが携えていく番。'],
    /* SESSIONS */
    ['#sessions .display-h-zh', '一夜一場'],
    ['#sessions .session-block .label', '毎週土曜、一場のみ'],
    ['#sessions .session-block .desc', '19:07 開演——夕暮れに腰を下ろし、そのまま夜へ。'],
    ['#why907', 'なぜ 19:07？'],
    ['#sessions .session-block .body', '席に着くころ、空は暮れはじめたばかり。<br><br>一度の食事のあいだに、空が暗くなるほど火は明るくなる——最後に、あなたを照らすのはあの火だけ。昼から夜まで、ただこの一場。'],
    ['.five-cta > p:first-child', '自分たちだけの一場を開きたい方は、5名以上そろえてDMを。別の日程をご用意します。'],
    ['.five-cta-links', 'IG <a href="https://www.instagram.com/container_no.7_penghu/" target="_blank" rel="noopener" class="inline-link">@container_no.7_penghu&nbsp;↗</a>・電話 <a href="tel:+886963059889" class="inline-link">0963-059-889</a>'],
    /* MENU */
    ['#menu .display-h-zh', '四皿'],
    ['#menu .lede', '四皿の料理が、二幕の火の舞のあいだに織り込まれる。一皿ずつ、急がずに。<br>ひと晩に、二幕の火の舞と四皿、そして百十分——NT$2,280／1名<small style="color:var(--paper-mute);font-weight:400;">（別途サービス料10%）</small>（通常 NT$2,980）。'],
    ['.mcourse:nth-of-type(1) .mc-zh', '迎賓'],
    ['.mcourse:nth-of-type(1) .mc-name', 'パン・ディップ・サボテンと風茹（フォンルー）のコンブチャ'],
    ['.mcourse:nth-of-type(1) .mc-line', '空が暮れはじめる。最初の一杯は、島でいちばん古い草。'],
    ['.mcourse:nth-of-type(2) .mc-zh', '前菜'],
    ['.mcourse:nth-of-type(2) .mc-name', '新鮮なケンサキイカのサラダ'],
    ['.mcourse:nth-of-type(2) .mc-line', '岩礁の下のケンサキイカ。今朝はまだ魚市場にいた。'],
    ['.mcourse:nth-of-type(3) .mc-zh', '主菜'],
    ['.mcourse:nth-of-type(3) .mc-name', '鴨胸肉のソテー・澎湖産天然クルマエビ'],
    ['.mcourse:nth-of-type(3) .mc-line', '火が皿に入る。海老はその場で焼くもの——急かせない。'],
    ['.mcourse:nth-of-type(4) .mc-zh', '甘味'],
    ['.mcourse:nth-of-type(4) .mc-name', '旬のフルーツのシャーベット'],
    ['.mcourse:nth-of-type(4) .mc-line', 'ひと晩じゅう熱かった。そろそろ涼む頃。'],
    ['#mClose', '最後に、火はあなたの手へ戻ってくる。'],
    ['#mHint', '下へ — 夜とともに'],
    ['#schedLive', 'リアルタイム空席状況<span class="lg">○ 空席あり</span><span class="lg">◐ 残りわずか</span><span class="lg">● 満席</span>'],
    ['.menu-fallback .course-tile:nth-child(1) .zh', 'ウェルカムブレッド<br>ディップ<br>サボテンと風茹（フォンルー）のコンブチャ'],
    ['.menu-fallback .course-tile:nth-child(2) .zh', '新鮮なケンサキイカのサラダ'],
    ['.menu-fallback .course-tile:nth-child(3) .zh', '鴨胸肉のソテー<br>澎湖産天然クルマエビ添え'],
    ['.menu-fallback .course-tile:nth-child(4) .zh', '旬のフルーツ<br>シャーベット'],
    ['.menu-fallback > p', 'ケンサキイカもクルマエビも、当日の早朝に魚市場で仕入れたもの——新鮮さは保証します。'],
    /* PERFORMER */
    ['#performer .display-h-zh', '鳳凰の舞い手・ドゥチ'],
    ['#performer .lede', '火の舞のパフォーマー。<br>この夏のContainer No.7のために、ひとつの完全なプログラムを編み上げた。'],
    ['#performer .body-p', '火の舞は二幕——迎賓のあとに一幕、主菜のあとに一幕。締めくくりに、火はあなたの手へ戻ってくる。'],
    /* FLOW */
    ['#flow .display-h-zh', 'ひと晩のかたち'],
    ['#flow .lede', '分刻みの時間表は出さない——早送りできない夜だから、時計は要らない。'],
    ['#flow .beat:nth-child(1) .what', '<strong>入場</strong>一本のマッチが、卓上のランプを灯す。今夜最初の火は、あなたが起こすもの。'],
    ['#flow .beat:nth-child(2) .what', '<strong>第一幕</strong>茶はまだ温かいまま。ドゥチがあなたの点けた火を受け取り、最初のひと舞い。そのあと前菜、主菜と、ゆっくり。'],
    ['#flow .beat:nth-child(3) .what', '<strong>第二幕</strong>主菜のあと、空はもう真っ暗——火がふたたび上がり、あなたを照らすのは、もうその火だけ。'],
    ['#flow .beat:nth-child(4) .what', '<strong>締めくくり</strong>甘味で少し涼む。最後のあの火は、あなたの手へ。少しだけ持ち帰って——どうやってかは、その場でわかる。'],
    /* SCHEDULE */
    ['#schedule .display-h-zh', '十二の土曜日'],
    ['#schedule .spread p.lede', 'June through August · 毎週土曜に一場、19:07 開演。<br>十二の土曜日、夕暮れから夜の中へ座る、十二の夜。'],
    ['.reserve > p.lede', 'どの回も、ひとつの完全な夜——二幕の火の舞、四皿、百十分。毎週土曜に一場、一場は最大十五名。'],
    ['.reserve-item:nth-child(1) .rk', '各回の席数'],
    ['.reserve-item:nth-child(1) .rv', '8–15名<span class="rsub">あえて小さな場——満席で締め切ります</span>'],
    ['.reserve-item:nth-child(2) .rk', '夏季限定'],
    ['.reserve-item:nth-child(2) .rv', '<s style="font-size:0.5em;color:var(--paper-mute);font-weight:400;margin-right:5px;vertical-align:2px;">NT$2,980</s>NT$2,280<span class="rsub">／1名・別途サービス料10%</span>'],
    ['.reserve-item:nth-child(3) .rk', '予約締切'],
    ['.reserve-item:nth-child(3) .rv', '前日<span class="rsub">22:00</span>'],
    ['.reserve-how', 'オンライン予約：下のボタンから、残席をリアルタイムで見ながら席を選べます。IGのDM <a href="https://www.instagram.com/container_no.7_penghu/" target="_blank" rel="noopener" class="inline-link">@container_no.7_penghu&nbsp;↗</a>、または電話 <a href="tel:+886963059889" class="inline-link">0963-059-889</a> でも。'],
    ['#openBook', '予約する'],
    ['.cta-block .bf-note', '上の日付のどれか、またはこのボタンから——オンラインでそのまま席を選べます。'],
    /* TERMS */
    ['#terms .display-h-zh', '約束ごと'],
    ['#terms .qa:nth-of-type(2) .q', '<span class="num">06.1</span>天気'],
    ['#terms .qa:nth-of-type(2) .a', '台湾の中央気象署が陸上または海上の台風警報を出した場合 → 全額返金、または無料で日程変更。<br>火の舞は乾いた天気でなければできません。当日に雨が降れば（小雨でも）、または安全に火を回せないと演者が判断する風なら、その夜はまるごと——食事も火の舞も分けずに——後日のどの回へでも無料で振り替えます。澎湖は風の島。ふつうの風なら予定どおり——中止かどうかは、演者がその場で判断します。'],
    ['#terms .qa:nth-of-type(3) .q', '<span class="num">06.2</span>返金'],
    ['#terms .qa:nth-of-type(3) .a', '開催日の5日以上前なら全額返金。2–5日前は50%。2日未満は返金不可、日程変更は可能。台風警報の場合はこの限りではありません。'],
    ['#terms .qa:nth-of-type(4) .q', '<span class="num">06.3</span>到着'],
    ['#terms .qa:nth-of-type(4) .a', '18:40–19:05 にお越しください。19:07 開演。15分以上の遅れは、不参加の扱いとなります。'],
    ['#terms .qa:nth-of-type(5) .q', '<span class="num">06.4</span>食事制限'],
    ['#terms .qa:nth-of-type(5) .a', 'ご予約時に必ずご記入ください。鴨が苦手、海鮮アレルギー、卵・乳アレルギー、ベジタリアン、辛いものが苦手——すべて対応します。'],
    ['#terms .qa:nth-of-type(6) .q', '<span class="num">06.5</span>食材'],
    ['#terms .qa:nth-of-type(6) .a', '食材は新鮮さを最優先に、多くは当日の早朝に市場で仕入れます。個別の食材が手に入らない日は、同等の一皿に置き換えることがあります。'],
    /* FAQ */
    ['#faq .display-h-zh', 'よくある質問'],
    ['#faq .qa:nth-of-type(2) .q', '<span class="num">07.1</span>スマホは使えますか？'],
    ['#faq .qa:nth-of-type(2) .a', 'スマホはお預かりしません。ひと晩じゅう——写真も動画もストーリーズも、ご自由に。'],
    ['#faq .qa:nth-of-type(3) .q', '<span class="num">07.2</span>食事なしで、火の舞だけ見られますか？'],
    ['#faq .qa:nth-of-type(3) .a', 'できません。これはひとつの完全な夜——火の舞と食事は切り離せません。'],
    ['#faq .qa:nth-of-type(4) .q', '<span class="num">07.3</span>何を着ていけばいいですか？'],
    ['#faq .qa:nth-of-type(4) .a', '芝生、屋外、夏の夜。歩きやすい靴と、楽な服。少し冷えることもあるので、薄い上着をどうぞ。'],
    ['#faq .qa:nth-of-type(5) .q', '<span class="num">07.4</span>子ども連れでも大丈夫ですか？'],
    ['#faq .qa:nth-of-type(5) .a', 'はい。6歳以上をおすすめします（火の舞は音が大きく、食事の時間も長めです）。'],
    ['#faq .qa:nth-of-type(6) .q', '<span class="num">07.5</span>コンブチャにアルコールは入っていますか？'],
    ['#faq .qa:nth-of-type(6) .a', '店内で発酵させたコンブチャはABV 0.5%未満。台湾の法規ではノンアルコール飲料にあたります。'],
    ['#faq .qa:nth-of-type(7) .q', '<span class="num">07.6</span>アレルギーや食事制限がある場合は？'],
    ['#faq .qa:nth-of-type(7) .a', '鴨が苦手、海鮮アレルギー、卵・乳アレルギー、ベジタリアン、辛いものが苦手——いずれも代わりの一皿があります。ご予約時に必ずお知らせください。記入がない場合、当日の調整はできません。'],
    ['#faq .qa:nth-of-type(8) .q', '<span class="num">07.7</span>食べ終わったら、すぐ帰らないといけませんか？'],
    ['#faq .qa:nth-of-type(8) .a', '急ぐ必要はありません。百十分の火の舞と食事のあと、ここは通常営業に戻ります——そのまま残って、もう一杯どうぞ。'],
    /* VISIT */
    ['#visit .display-h-zh', 'アクセス'],
    ['#visit .visit-item:nth-child(1) .val', '澎湖県馬公市・Container No.7<br><span class="addr-pending">詳しい住所と地図は準備中</span>'],
    /* FAB */
    ['.fp-tag', '夏季限定'],
    ['.fp-count', '各回 8–15席'],
    ['.fp-per', '／1名・別途サービス料10%'],
    ['.fp-price s', '通常 NT$ 2,980'],
    ['.fp-btn', '今すぐ予約']
  ];
  DICT.ko = [
    /* HERO */
    ['.hero .lead', '첫 성냥은 당신이 긋습니다.<br>그다음 백십 분, 그 불은 하늘로 뛰어오르고, 접시 위에 구워지고, 마지막엔 당신의 손으로 돌아옵니다.'],
    ['.hero .bottom-meta div:nth-child(3)', '여름 한정 NT$ 2,280 · 하룻밤'],
    /* ISLAND */
    ['#island .display-h-zh', '불에서 태어난 섬'],
    ['#island .story p:nth-of-type(1)', '이 섬은 불로 만들어졌습니다 — 당신보다 천칠백만 년 더 오래되었습니다.'],
    ['#island .story p:nth-of-type(2)', '바다 밑이 터지고, 마그마가 솟아올라 식으며, 펑후는 그렇게 바다에서 자라났습니다 — 검은 것은, 식어 버린 불입니다.'],
    ['#island .story p:nth-of-type(3)', '불은 섬을 만들고, 그리고 멈췄습니다.<br>섬은 남아, 그 위의 모든 것을 길러 왔습니다.'],
    ['#island .story p:nth-of-type(4)', '암초 아래의 한치는 당신의 <strong>전채</strong>.<br>섬에서 가장 오래된 풀은, 사백 년 전 네덜란드인이 가져온 가시와 함께 빚어져 당신의 <strong>첫 잔</strong>이 됩니다.<br>암초 곁에서 천천히 자라는 새우는 당신의 <strong>메인</strong>.<br>마지막 한 접시는 제철 과일 <strong>셔벗</strong> — 밤새 뜨거웠으니, 이제 식힐 시간입니다.'],
    ['#island .story p:nth-of-type(5)', '천칠백만 년, 불로 만들어진 섬 하나가, 당신 눈앞의 이 한 상이 되었습니다.'],
    ['#island .story p:nth-of-type(6)', '오늘 밤, 불은 당신의 손에서 시작됩니다.<br>성냥 하나가 테이블 위의 등을 밝히고, 두치(Duchi)가 그 불을 받아 온 하늘에 춤추게 하고, 그리고 한 접시 한 접시, 당신의 그릇으로 돌아옵니다.<br>마지막엔, 다시 당신의 손으로.'],
    ['#island .story p:nth-of-type(7)', '백십 분, 빨리감기는 없습니다.<br>그러고 싶지도 않을 겁니다.'],
    ['#island .story p:nth-of-type(8)', '떠날 때, 불을 조금 가져가세요.<br>섬 하나를 만들었고, 섬의 몇 대를 먹여 살렸고, 오늘 밤의 춤까지 다 춘 불입니다.<br>이 불은 꺼지지 않습니다 — 이제부터는, 당신이 지니고 갈 차례입니다.'],
    /* SESSIONS */
    ['#sessions .display-h-zh', '하룻밤, 한 번'],
    ['#sessions .session-block .label', '매주 토요일, 단 한 번'],
    ['#sessions .session-block .desc', '19:07 시작 — 황혼에 앉아, 그대로 밤 속으로.'],
    ['#why907', '왜 19:07인가요?'],
    ['#sessions .session-block .body', '자리에 앉을 때, 하늘은 막 어두워지기 시작합니다.<br><br>한 끼 식사 동안, 하늘이 어두워질수록 불은 밝아집니다 — 마지막에 당신을 비추는 건 그 불뿐입니다. 낮에서 밤까지, 오직 이 한 번입니다.'],
    ['.five-cta > p:first-child', '우리끼리의 한 번을 열고 싶다면, 5명 이상 모아 DM을 보내 주세요. 따로 날짜를 열어 드립니다.'],
    ['.five-cta-links', 'IG <a href="https://www.instagram.com/container_no.7_penghu/" target="_blank" rel="noopener" class="inline-link">@container_no.7_penghu&nbsp;↗</a> · 전화 <a href="tel:+886963059889" class="inline-link">0963-059-889</a>'],
    /* MENU */
    ['#menu .display-h-zh', '네 가지 코스'],
    ['#menu .lede', '네 가지 코스가 두 번의 불춤 사이에 놓입니다. 한 접시씩, 서두르지 않고.<br>하룻밤에 두 번의 불춤, 네 가지 코스, 백십 분 — NT$2,280/1인<small style="color:var(--paper-mute);font-weight:400;">(봉사료 10% 별도)</small>(정가 NT$2,980).'],
    ['.mcourse:nth-of-type(1) .mc-zh', '환영'],
    ['.mcourse:nth-of-type(1) .mc-name', '빵 · 딥 · 선인장 펑루 콤부차'],
    ['.mcourse:nth-of-type(1) .mc-line', '하늘이 막 어두워질 무렵. 첫 잔은, 섬에서 가장 오래된 풀.'],
    ['.mcourse:nth-of-type(2) .mc-zh', '전채'],
    ['.mcourse:nth-of-type(2) .mc-name', '신선한 한치 샐러드'],
    ['.mcourse:nth-of-type(2) .mc-line', '암초 아래의 한치, 오늘 새벽까지 어시장에 있었습니다.'],
    ['.mcourse:nth-of-type(3) .mc-zh', '메인'],
    ['.mcourse:nth-of-type(3) .mc-name', '오리 가슴살 구이 · 펑후 자연산 대하'],
    ['.mcourse:nth-of-type(3) .mc-line', '불이 접시로 들어옵니다. 새우는 그 자리에서 굽기에, 서두를 수 없습니다.'],
    ['.mcourse:nth-of-type(4) .mc-zh', '디저트'],
    ['.mcourse:nth-of-type(4) .mc-name', '제철 과일 셔벗'],
    ['.mcourse:nth-of-type(4) .mc-line', '밤새 뜨거웠으니, 이제 식힐 시간입니다.'],
    ['#mClose', '마지막에, 불은 당신의 손으로 돌아옵니다.'],
    ['#mHint', '아래로 — 밤을 따라'],
    ['#schedLive', '실시간 잔여석<span class="lg">○ 여유</span><span class="lg">◐ 마감 임박</span><span class="lg">● 매진</span>'],
    ['.menu-fallback .course-tile:nth-child(1) .zh', '웰컴 브레드<br>딥<br>선인장 펑루 콤부차'],
    ['.menu-fallback .course-tile:nth-child(2) .zh', '신선한 한치 샐러드'],
    ['.menu-fallback .course-tile:nth-child(3) .zh', '오리 가슴살 구이<br>펑후 자연산 대하 곁들임'],
    ['.menu-fallback .course-tile:nth-child(4) .zh', '제철 과일<br>셔벗'],
    ['.menu-fallback > p', '한치와 대하는 모두 당일 새벽 어시장에서 사 옵니다 — 신선함은 보장합니다.'],
    /* PERFORMER */
    ['#performer .display-h-zh', '불사조의 춤꾼 · 두치'],
    ['#performer .lede', '불춤 퍼포머.<br>올여름 Container No.7을 위해, 하나의 완전한 프로그램을 짰습니다.'],
    ['#performer .body-p', '불춤은 두 번 — 환영 다음에 한 번, 메인 다음에 한 번. 마무리에는, 불이 당신의 손으로 돌아옵니다.'],
    /* FLOW */
    ['#flow .display-h-zh', '하룻밤의 모양'],
    ['#flow .lede', '분 단위 시간표는 없습니다 — 빨리감기가 안 되는 밤이니, 시계는 필요 없습니다.'],
    ['#flow .beat:nth-child(1) .what', '<strong>입장</strong>성냥 하나가 테이블 위의 등을 밝힙니다. 오늘 밤 첫 불은, 당신이 일으킨 것입니다.'],
    ['#flow .beat:nth-child(2) .what', '<strong>첫 번째 춤</strong>차가 아직 따뜻할 때, 두치가 당신이 붙인 불을 받아 첫 춤을 춥니다. 그다음 전채와 메인을, 천천히.'],
    ['#flow .beat:nth-child(3) .what', '<strong>두 번째 춤</strong>메인이 끝나면 하늘은 이미 캄캄합니다 — 불이 다시 오르고, 이번에 당신을 비추는 건 그 불뿐입니다.'],
    ['#flow .beat:nth-child(4) .what', '<strong>마무리</strong>디저트로 잠시 식힙니다. 마지막 그 불은, 당신의 손으로. 조금 가져가세요 — 어떻게인지는, 그 자리에서 알게 됩니다.'],
    /* SCHEDULE */
    ['#schedule .display-h-zh', '열두 번의 토요일'],
    ['#schedule .spread p.lede', 'June through August · 매주 토요일 한 번, 19:07 시작.<br>열두 번의 토요일, 황혼에 앉아 밤으로 들어가는 열두 밤.'],
    ['.reserve > p.lede', '매회가 하나의 완전한 밤입니다 — 두 번의 불춤, 네 가지 코스, 백십 분. 매주 토요일 한 번, 한 번에 최대 열다섯 명.'],
    ['.reserve-item:nth-child(1) .rk', '회당 정원'],
    ['.reserve-item:nth-child(1) .rv', '8–15명<span class="rsub">일부러 작게 — 차면 닫습니다</span>'],
    ['.reserve-item:nth-child(2) .rk', '여름 한정'],
    ['.reserve-item:nth-child(2) .rv', '<s style="font-size:0.5em;color:var(--paper-mute);font-weight:400;margin-right:5px;vertical-align:2px;">NT$2,980</s>NT$2,280<span class="rsub">/1인 · 봉사료 10% 별도</span>'],
    ['.reserve-item:nth-child(3) .rk', '예약 마감'],
    ['.reserve-item:nth-child(3) .rv', '전날<span class="rsub">22:00</span>'],
    ['.reserve-how', '온라인 예약: 아래 버튼에서 실시간으로 잔여석을 보며 자리를 고를 수 있습니다. IG DM <a href="https://www.instagram.com/container_no.7_penghu/" target="_blank" rel="noopener" class="inline-link">@container_no.7_penghu&nbsp;↗</a> 또는 전화 <a href="tel:+886963059889" class="inline-link">0963-059-889</a>로도 가능합니다.'],
    ['#openBook', '예약하기'],
    ['.cta-block .bf-note', '위의 날짜 아무 곳이나, 또는 이 버튼을 눌러 온라인으로 바로 자리를 고르세요.'],
    /* TERMS */
    ['#terms .display-h-zh', '몇 가지 약속'],
    ['#terms .qa:nth-of-type(2) .q', '<span class="num">06.1</span>날씨'],
    ['#terms .qa:nth-of-type(2) .a', '대만 중앙기상서의 육상/해상 태풍 경보 → 전액 환불 또는 무료 일정 변경.<br>불춤은 마른 날씨에만 가능합니다. 공연 당일 비가 오면(가랑비 포함), 혹은 공연자가 안전하게 불을 돌릴 수 없다고 판단하는 바람이면, 그날 밤 전체를 — 식사와 불춤을 나누지 않고 — 이후 아무 회차로나 무료로 옮겨 드립니다. 펑후는 바람이 잦은 섬이라, 보통 바람에는 그대로 진행합니다 — 취소 여부는 공연자가 현장에서 판단합니다.'],
    ['#terms .qa:nth-of-type(3) .q', '<span class="num">06.2</span>환불'],
    ['#terms .qa:nth-of-type(3) .a', '공연 5일 이전에는 전액 환불. 2–5일 전에는 50%. 2일 미만이면 환불은 불가하나 일정 변경은 가능합니다. 태풍 경보 시에는 예외입니다.'],
    ['#terms .qa:nth-of-type(4) .q', '<span class="num">06.3</span>도착'],
    ['#terms .qa:nth-of-type(4) .a', '18:40–19:05에 도착해 주세요. 19:07 시작. 15분 이상 늦으면 참석 포기로 간주됩니다.'],
    ['#terms .qa:nth-of-type(5) .q', '<span class="num">06.4</span>식이 제한'],
    ['#terms .qa:nth-of-type(5) .a', '예약 시 꼭 적어 주세요. 오리를 안 드시는 분, 해산물 알레르기, 달걀·유제품 알레르기, 채식, 매운 것을 못 드시는 분 — 모두 대응합니다.'],
    ['#terms .qa:nth-of-type(6) .q', '<span class="num">06.5</span>식재료'],
    ['#terms .qa:nth-of-type(6) .a', '식재료는 신선함을 최우선으로, 대부분 당일 새벽 시장에서 사 옵니다. 특정 재료가 떨어지면, 같은 가치의 다른 요리로 대체될 수 있습니다.'],
    /* FAQ */
    ['#faq .display-h-zh', '자주 묻는 질문'],
    ['#faq .qa:nth-of-type(2) .q', '<span class="num">07.1</span>휴대폰을 써도 되나요?'],
    ['#faq .qa:nth-of-type(2) .a', '휴대폰을 걷지 않습니다. 밤새 — 사진, 영상, 스토리, 모두 괜찮습니다.'],
    ['#faq .qa:nth-of-type(3) .q', '<span class="num">07.2</span>식사 없이 불춤만 볼 수 있나요?'],
    ['#faq .qa:nth-of-type(3) .a', '안 됩니다. 이것은 하나의 완전한 밤이라, 불춤과 식사는 나눌 수 없습니다.'],
    ['#faq .qa:nth-of-type(4) .q', '<span class="num">07.3</span>뭘 입고 가면 좋을까요?'],
    ['#faq .qa:nth-of-type(4) .a', '잔디, 야외, 여름밤. 걷기 편한 신발과 편한 옷. 살짝 쌀쌀할 수 있으니 얇은 겉옷을 챙기세요.'],
    ['#faq .qa:nth-of-type(5) .q', '<span class="num">07.4</span>아이를 데려가도 되나요?'],
    ['#faq .qa:nth-of-type(5) .a', '네. 6세 이상을 권합니다(불춤은 소리가 크고, 식사 시간이 깁니다).'],
    ['#faq .qa:nth-of-type(6) .q', '<span class="num">07.5</span>콤부차에 알코올이 있나요?'],
    ['#faq .qa:nth-of-type(6) .a', '매장에서 발효한 콤부차는 ABV 0.5% 미만으로, 대만 법규상 무알코올 음료입니다.'],
    ['#faq .qa:nth-of-type(7) .q', '<span class="num">07.6</span>알레르기나 식이 제한이 있다면요?'],
    ['#faq .qa:nth-of-type(7) .a', '오리를 안 드시는 분, 해산물 알레르기, 달걀·유제품 알레르기, 채식, 매운 것을 못 드시는 분 — 모두 대체 메뉴가 있습니다. 예약할 때 꼭 알려 주세요. 적지 않으면 현장에서는 조정이 어렵습니다.'],
    ['#faq .qa:nth-of-type(8) .q', '<span class="num">07.7</span>식사가 끝나면 바로 가야 하나요?'],
    ['#faq .qa:nth-of-type(8) .a', '서두르지 않아도 됩니다. 백십 분의 불춤과 식사가 끝나면 이곳은 평소 영업으로 돌아갑니다 — 남아서 한 잔 더 하셔도 좋습니다.'],
    /* VISIT */
    ['#visit .display-h-zh', '오시는 길'],
    ['#visit .visit-item:nth-child(1) .val', '펑후현 마궁시 · Container No.7<br><span class="addr-pending">상세 주소와 지도는 준비 중</span>'],
    /* FAB */
    ['.fp-tag', '여름 한정'],
    ['.fp-count', '회당 8–15석'],
    ['.fp-per', '/1인 · 봉사료 10% 별도'],
    ['.fp-price s', '정가 NT$ 2,980'],
    ['.fp-btn', '바로 예약']
  ];

  /* ---------- 訂位頁（book.html）：靜態字串 ---------- */
  var BOOK_EN = [
    ['title', 'Reserve · Summer Nights · CONTAINER NO.7'],
    ['.site-head .back a', '← Back'],
    ['.pg-kicker', 'RESERVE'],
    ['.pg-h1', 'Reserve'],
    ['.pg-lede', 'Pick a date to see <b>live remaining seats</b> — once sent, we hold yours for 24 hours.<br><b>NT$ 2,280</b> per person<small> (+10% service)</small> (was <s>NT$ 2,980</s>) · <b>110 minutes</b>, <b>two fire dances</b>, <b>four courses</b>.'],
    ['#step1 .sec-h h2', 'Pick a night'],
    ['#step2 .sec-h h2', 'Your details'],
    ['#step3 .sec-h h2', 'Sent'],
    ['#fldPicked > label', 'Date'],
    ['#fldParty > label', 'Party<span class="req">*</span>'],
    ['#errParty', 'Please pick a party size.'],
    ['#fldName > label', 'Name<span class="req">*</span>'],
    ['#name', 'How should we call you?', 'ph'],
    ['#errName', 'Please fill in a name.'],
    ['#fldPhone > label', 'Phone<span class="req">*</span>'],
    ['#errPhone', 'Please enter a valid phone (8+ digits).'],
    ['#fldEmail > label', 'Email · optional (for a confirmation letter)'],
    ['.fld:has(#diet) > label', 'Dietary · pick any'],
    ['#diet label:nth-child(1)', '<input type="checkbox" value="不吃鴨">No duck'],
    ['#diet label:nth-child(2)', '<input type="checkbox" value="海鮮過敏">Shellfish allergy'],
    ['#diet label:nth-child(3)', '<input type="checkbox" value="蛋奶過敏">Egg / dairy allergy'],
    ['#diet label:nth-child(4)', '<input type="checkbox" value="素食">Vegetarian'],
    ['#diet label:nth-child(5)', '<input type="checkbox" value="不吃辣">No spice'],
    ['.fld:has(#last5) > label', 'Last 5 digits of your transfer · can be added later'],
    ['.price-note', 'Listed <b>NT$ 2,280</b> per person, +10% service (about <b>NT$ 2,508</b> per person).'],
    ['#submit', 'Send — held for 24 hours'],
    ['#form .note', 'After you send, we confirm by phone.'],
    ['.bank div:nth-child(1)', '<span class="k">Bank</span>Cathay United Bank (013)'],
    ['.bank div:nth-child(2)', '<span class="k">Account</span><span class="num">128700003341</span>'],
    ['.bank div:nth-child(3) .k', 'Amount'],
    ['.confirm .foot', 'No need to message us after the transfer — we reconcile and confirm by phone.<br>Questions: 0963-059-889.'],
    ['#again', 'Book another']
  ];
  var BOOK_JA = [
    ['title', '予約 · 夏夜火舞 · CONTAINER NO.7'],
    ['.site-head .back a', '← トップへ'],
    ['.pg-kicker', 'ご予約 / RESERVE'],
    ['.pg-h1', 'ご予約'],
    ['.pg-lede', '日付を選ぶと<b>残席がリアルタイム</b>で表示されます。送信後、24時間お席を確保します。<br><b>NT$ 2,280</b>／1名<small>（別途サービス料10%）</small>（通常 <s>NT$ 2,980</s>）・<b>110分</b>、<b>二幕の火の舞</b>、<b>四皿</b>。'],
    ['#step1 .sec-h h2', '日付を選ぶ'],
    ['#step2 .sec-h h2', 'お客様情報'],
    ['#step3 .sec-h h2', '送信済み'],
    ['#fldPicked > label', '日付'],
    ['#fldParty > label', '人数<span class="req">*</span>'],
    ['#errParty', '人数をお選びください。'],
    ['#fldName > label', 'お名前<span class="req">*</span>'],
    ['#name', 'お名前（呼び方）', 'ph'],
    ['#errName', 'お名前をご記入ください。'],
    ['#fldPhone > label', '電話番号<span class="req">*</span>'],
    ['#errPhone', '有効な電話番号をご記入ください（数字8桁以上）。'],
    ['#fldEmail > label', 'メール · 任意（確認メールが必要な方のみ）'],
    ['.fld:has(#diet) > label', '食事制限 · 複数選択可'],
    ['#diet label:nth-child(1)', '<input type="checkbox" value="不吃鴨">鴨なし'],
    ['#diet label:nth-child(2)', '<input type="checkbox" value="海鮮過敏">シーフードアレルギー'],
    ['#diet label:nth-child(3)', '<input type="checkbox" value="蛋奶過敏">卵・乳アレルギー'],
    ['#diet label:nth-child(4)', '<input type="checkbox" value="素食">ベジタリアン'],
    ['#diet label:nth-child(5)', '<input type="checkbox" value="不吃辣">辛味なし'],
    ['.fld:has(#last5) > label', '振込口座の下5桁 · 後からでも可'],
    ['.price-note', '表示価格 <b>NT$ 2,280</b>／1名、別途サービス料10%（お一人あたり約 <b>NT$ 2,508</b>）。'],
    ['#submit', '送信 · 24時間お席を確保'],
    ['#form .note', '送信後、お電話にて確認のご連絡をいたします。'],
    ['.bank div:nth-child(1)', '<span class="k">銀行</span>国泰世華銀行（013）'],
    ['.bank div:nth-child(2)', '<span class="k">口座</span><span class="num">128700003341</span>'],
    ['.bank div:nth-child(3) .k', '金額'],
    ['.confirm .foot', 'お振込み後のご連絡は不要です。入金を確認次第、お電話でご連絡します。<br>お問い合わせ：0963-059-889。'],
    ['#again', 'もう一件予約']
  ];
  var BOOK_KO = [
    ['title', '예약 · 夏夜火舞 · CONTAINER NO.7'],
    ['.site-head .back a', '← 홈으로'],
    ['.pg-kicker', '예약 / RESERVE'],
    ['.pg-h1', '예약'],
    ['.pg-lede', '날짜를 고르면 <b>실시간 잔여석</b>이 표시됩니다. 전송 후 24시간 동안 자리를 잡아둡니다.<br><b>NT$ 2,280</b>/1인<small> (봉사료 10% 별도)</small> (정가 <s>NT$ 2,980</s>) · <b>110분</b>, <b>두 번의 불춤</b>, <b>네 가지 코스</b>.'],
    ['#step1 .sec-h h2', '날짜 선택'],
    ['#step2 .sec-h h2', '예약 정보'],
    ['#step3 .sec-h h2', '전송 완료'],
    ['#fldPicked > label', '날짜'],
    ['#fldParty > label', '인원<span class="req">*</span>'],
    ['#errParty', '인원을 선택해 주세요.'],
    ['#fldName > label', '성함<span class="req">*</span>'],
    ['#name', '성함(호칭)', 'ph'],
    ['#errName', '성함을 입력해 주세요.'],
    ['#fldPhone > label', '전화번호<span class="req">*</span>'],
    ['#errPhone', '유효한 전화번호를 입력해 주세요(숫자 8자리 이상).'],
    ['#fldEmail > label', '이메일 · 선택(확인 메일을 원하시면 입력)'],
    ['.fld:has(#diet) > label', '식이 제한 · 복수 선택 가능'],
    ['#diet label:nth-child(1)', '<input type="checkbox" value="不吃鴨">오리 제외'],
    ['#diet label:nth-child(2)', '<input type="checkbox" value="海鮮過敏">해산물 알레르기'],
    ['#diet label:nth-child(3)', '<input type="checkbox" value="蛋奶過敏">계란·유제품 알레르기'],
    ['#diet label:nth-child(4)', '<input type="checkbox" value="素食">채식'],
    ['#diet label:nth-child(5)', '<input type="checkbox" value="不吃辣">맵지 않게'],
    ['.fld:has(#last5) > label', '이체 계좌 끝 5자리 · 나중에 보내도 됩니다'],
    ['.price-note', '표시 가격 <b>NT$ 2,280</b>/1인, 봉사료 10% 별도(1인 약 <b>NT$ 2,508</b>).'],
    ['#submit', '전송 · 24시간 확보'],
    ['#form .note', '전송 후 전화로 확인드립니다.'],
    ['.bank div:nth-child(1)', '<span class="k">은행</span>국태세화은행 Cathay United (013)'],
    ['.bank div:nth-child(2)', '<span class="k">계좌</span><span class="num">128700003341</span>'],
    ['.bank div:nth-child(3) .k', '금액'],
    ['.confirm .foot', '입금 후 따로 연락하실 필요 없습니다. 입금 확인 후 전화드립니다.<br>문의: 0963-059-889.'],
    ['#again', '한 건 더 예약']
  ];
  DICT.en = DICT.en.concat(BOOK_EN);
  DICT.ja = DICT.ja.concat(BOOK_JA);
  DICT.ko = DICT.ko.concat(BOOK_KO);

  /* ---------- 訂位頁：動態字串擴充 ---------- */
  var LB = {
    zh: { pickFirst: '請先在上方選擇場次', partyPh: '請選擇人數', partyNone: '尚無可選名額', partyN: '{n} 位',
          errParty: '請選擇人數。', errOver: '人數超過剩餘名額（剩 {n}）。', syncing: '名額同步中…',
          bFull: '已滿', bLast: '最後 {n}', bLeft: '剩 {n}', seatWord: '{n} 位',
          sentToast: '已送出 · 已為你保留 24 小時', fullToast: '你選的場次剛剛被訂滿了，請重新選擇',
          reserved: '已為你保留 {n} 位', confTail: '。請在 {cd} 內完成匯款，逾時位子自動釋放。', expired: '已逾時' },
    en: { pickFirst: 'Pick a date above first', partyPh: 'How many of you?', partyNone: 'No seats available', partyN: '{n}',
          errParty: 'Please pick a party size.', errOver: 'That’s more than the seats left ({n}).', syncing: 'Syncing seats…',
          bFull: 'Full', bLast: 'Last {n}', bLeft: '{n} left', seatWord: '{n}',
          sentToast: 'Sent — your seats are held for 24 hours', fullToast: 'That night just filled up — please pick another',
          reserved: '{n} seats held for you', confTail: '. Please transfer within {cd} — after that the seats release automatically.', expired: 'Expired' },
    ja: { pickFirst: 'まず上の日付をお選びください', partyPh: '人数をお選びください', partyNone: '空席がありません', partyN: '{n} 名',
          errParty: '人数をお選びください。', errOver: '残席を超えています（残り {n}）。', syncing: '残席を確認中…',
          bFull: '満席', bLast: '残り {n}', bLeft: '残り {n}', seatWord: '{n} 名',
          sentToast: '送信しました · 24時間お席を確保します', fullToast: 'その日はちょうど満席になりました。別の日をお選びください',
          reserved: '{n} 名分のお席を確保しました', confTail: '。{cd} 以内にお振込みください。期限を過ぎるとお席は自動的に解放されます。', expired: '期限切れ' },
    ko: { pickFirst: '먼저 위에서 날짜를 선택해 주세요', partyPh: '인원을 선택해 주세요', partyNone: '남은 자리가 없습니다', partyN: '{n}명',
          errParty: '인원을 선택해 주세요.', errOver: '남은 자리보다 많습니다(남은 {n}석).', syncing: '잔여석 확인 중…',
          bFull: '매진', bLast: '마지막 {n}', bLeft: '{n} 남음', seatWord: '{n}명',
          sentToast: '전송 완료 · 24시간 동안 자리를 잡아둡니다', fullToast: '방금 그 날짜가 매진되었습니다. 다른 날짜를 선택해 주세요',
          reserved: '{n}석을 잡아두었습니다', confTail: '. {cd} 안에 입금해 주세요. 시간이 지나면 자리가 자동으로 풀립니다.', expired: '기한 만료' }
  };
  Object.keys(LB).forEach(function (k) { var t = LB[k]; for (var key in t) L[k][key] = t[key]; });

  /* ---------- 引擎 ---------- */
  var KEY = 'c7lang';
  var LANGS = ['zh', 'en', 'ja', 'ko'];
  var HTML_LANG = { zh: 'zh-Hant', en: 'en', ja: 'ja', ko: 'ko' };
  function detectLang() {
    var m = /[?&]lang=(zh|en|ja|ko)\b/.exec(location.search);
    if (m) return m[1];                              // 連結帶語言 → 最優先（跨頁邏輯硬通）
    try {
      var s2 = localStorage.getItem(KEY);
      if (LANGS.indexOf(s2) > -1) return s2;
    } catch (e) {}
    return 'zh';
  }
  var current = detectLang();

  // 動態字串先就位（index 的 IIFE 在本檔之後執行，讀得到）
  window.C7L = L[current];

  /* 條目格式：[selector, value] 換 innerHTML；[selector, value, 'ph'] 換 placeholder 屬性 */
  function getVal(el, t) { return t === 'ph' ? (el.getAttribute('placeholder') || '') : el.innerHTML; }
  function setVal(el, t, v) { if (t === 'ph') el.setAttribute('placeholder', v); else el.innerHTML = v; }

  var snapshot = null;   // 'selector|type' -> 原始(中文)值
  function takeSnapshot() {
    if (snapshot) return;
    snapshot = {};
    DICT.en.forEach(function (pair) {
      var t = pair[2] || 'html';
      var el = document.querySelector(pair[0]);
      if (el) snapshot[pair[0] + '|' + t] = getVal(el, t);
    });
  }
  function restoreZh() {
    Object.keys(snapshot).forEach(function (key) {
      var i = key.lastIndexOf('|');
      var el = document.querySelector(key.slice(0, i));
      if (el) setVal(el, key.slice(i + 1), snapshot[key]);
    });
  }

  function apply(lang) {
    if (LANGS.indexOf(lang) < 0) lang = 'zh';
    takeSnapshot();
    if (lang === 'zh') {
      restoreZh();
    } else {
      var dict = DICT[lang] && DICT[lang].length ? DICT[lang] : DICT.en;  // 字典缺 → 先用英文
      restoreZh();   // 先還原成中文快照再套（避免從別的語言疊加）
      dict.forEach(function (pair) {
        var el = document.querySelector(pair[0]);
        if (el) setVal(el, pair[2] || 'html', pair[1]);
      });
    }
    current = lang;
    window.C7L = L[lang];
    document.documentElement.lang = HTML_LANG[lang];
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    document.querySelectorAll('#langSwitch button').forEach(function (b) {
      b.classList.toggle('on', b.dataset.l === lang);
    });
    syncLinks();
    syncUrl();
    document.dispatchEvent(new CustomEvent('c7lang', { detail: { lang: lang } }));
  }

  // 站內互連（index ↔ book）的 <a> 一律帶上目前語言，跨頁不靠快取也通
  function syncLinks() {
    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (!/^(index|book)\.html/.test(href)) return;
      var base = href.split('#')[0].replace(/([?&])lang=[a-z]+&?/, '$1').replace(/[?&]$/, '');
      var hash = href.indexOf('#') > -1 ? href.slice(href.indexOf('#')) : '';
      if (current !== 'zh') base += (base.indexOf('?') > -1 ? '&' : '?') + 'lang=' + current;
      a.setAttribute('href', base + hash);
    });
  }
  // 網址列同步（重新整理、分享連結都保住語言）
  function syncUrl() {
    if (!window.history || !history.replaceState) return;
    var q = location.search.replace(/([?&])lang=[a-z]+&?/, '$1').replace(/[?&]$/, '');
    if (current !== 'zh') q += (q.indexOf('?') > -1 ? '&' : '?') + 'lang=' + current;
    history.replaceState(null, '', location.pathname + q + location.hash);
  }

  (function init() {
    var sw = document.getElementById('langSwitch');
    if (sw) sw.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-l]');
      if (b && b.dataset.l !== current) apply(b.dataset.l);
    });
    if (current !== 'zh') {
      apply(current);            // 立即換字，不閃中文
    } else {
      document.documentElement.lang = 'zh-Hant';
      syncLinks();
      syncUrl();
    }
  })();

  window.C7I18N = { apply: apply, get lang() { return current; } };
})();
