/* =====================================================================
   6. GAMES — Hearts catch, Memory match, Love quiz, Scratch coupons
   ===================================================================== */
const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const GAMES = [
  { id: 'catch',   icon: '🧺', title: 'Hearts Pakdo',   desc: 'Girte hearts basket me lo' },
  { id: 'memory',  icon: '🧠', title: 'Memory Match',   desc: 'Jodi milao, dil jeeto' },
  { id: 'quiz',    icon: '💘', title: 'Love Quiz',      desc: 'Kitna jaanti ho mujhe?' },
  { id: 'scratch', icon: '🎟️', title: 'Scratch Coupons', desc: 'Surprise gifts kholo' }
];

/* ---------- 1. catch hearts ---------- */
function catchGame(body, finish) {
  const GOAL = 20;
  body.innerHTML = `<h3 class="g-title">Hearts Pakdo 💗</h3>
    <p class="g-sub">Basket hilao, ${GOAL} points banao. 💔 se bachna!</p>
    <div class="g-hud"><span>Score: <b id="cgScore">0</b>/${GOAL}</span><span>⏱️ <b id="cgTime">35</b>s</span></div>
    <div class="catch-area" id="cgArea"><div class="basket" id="cgBasket">🧺</div></div>`;
  const area = $('#cgArea'), basket = $('#cgBasket');
  let bx = area.clientWidth / 2, score = 0, time = 35, items = [], spawnT = 0, run = true, raf = 0, last = performance.now();
  basket.style.left = bx + 'px';
  const setX = (cx) => { const r = area.getBoundingClientRect(); bx = Math.max(26, Math.min(r.width - 26, cx - r.left)); basket.style.left = bx + 'px'; };
  area.addEventListener('pointermove', (e) => setX(e.clientX));
  area.addEventListener('pointerdown', (e) => setX(e.clientX));
  const key = (e) => { if (e.key === 'ArrowLeft') setX(bx + area.getBoundingClientRect().left - 34); if (e.key === 'ArrowRight') setX(bx + area.getBoundingClientRect().left + 34); };
  window.addEventListener('keydown', key);
  const types = [
    { e: ['💗', '💖', '💝', '💕'], p: 1, w: 0.64 },
    { e: ['⭐', '🌟'], p: 3, w: 0.14 },
    { e: ['💔'], p: -2, w: 0.22 }
  ];
  function spawn() {
    let r = Math.random(), t = types[0];
    for (const ty of types) { if (r < ty.w) { t = ty; break; } r -= ty.w; }
    const d = el('div', 'fall', pick(t.e));
    const x = rand(24, area.clientWidth - 24);
    d.style.left = x + 'px';
    area.appendChild(d);
    items.push({ d, x, y: -30, vy: rand(130, 190) + (35 - time) * 3.2, p: t.p });
  }
  function tick(now) {
    if (!run) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    time -= dt; spawnT -= dt;
    if (spawnT <= 0) { spawn(); spawnT = rand(0.35, 0.6); }
    const H = area.clientHeight;
    for (let i = items.length - 1; i > 0 - 1; i--) {
      const it = items[i];
      it.y += it.vy * dt;
      it.d.style.top = it.y + 'px';
      if (it.y > H - 62 && it.y < H - 14 && Math.abs(it.x - bx) < 46) {
        score = Math.max(0, score + it.p);
        if (it.p > 0) { Sound.sfx.catchHeart(); Fx.floatUp(area.getBoundingClientRect().left + it.x, area.getBoundingClientRect().top + H - 70, '+' + it.p, { size: 20, dist: 60 }); }
        else { Sound.sfx.ouch(); basket.style.transform = 'translateX(-50%) rotate(-12deg)'; setTimeout(() => { basket.style.transform = 'translateX(-50%)'; }, 160); }
        it.d.remove(); items.splice(i, 1);
        $('#cgScore').textContent = score;
      } else if (it.y > H) { it.d.remove(); items.splice(i, 1); }
    }
    $('#cgTime').textContent = Math.max(0, Math.ceil(time));
    if (score >= GOAL) return end(true);
    if (time <= 0) return end(false);
    raf = requestAnimationFrame(tick);
  }
  function end(win) {
    run = false;
    if (win) {
      Sound.sfx.fanfare(); Fx.cannons();
      body.innerHTML = `<div class="g-result"><div style="font-size:64px">🏆</div><h3>Jeet gayi! 🎉</h3>
        <p>Itne saare hearts pakad liye... waise dil toh tum pehle hi chura chuki ho 😌💗</p>
        <button class="btn" id="cgDone">Wapas chalo</button></div>`;
      $('#cgDone').onclick = () => GamesUI.close();
      finish(true);
    } else {
      Sound.sfx.wrong();
      body.innerHTML = `<div class="g-result"><div style="font-size:64px">🥺</div><h3>Bas thoda sa reh gaya!</h3>
        <p>Score: ${score}/${GOAL}. Ek baar aur try karo, tum kar sakti ho 💪</p>
        <button class="btn" id="cgRetry">Phir se khelo</button></div>`;
      $('#cgRetry').onclick = () => { catchGame(body, finish); };
    }
    window.removeEventListener('keydown', key);
  }
  raf = requestAnimationFrame(tick);
  return () => { run = false; cancelAnimationFrame(raf); window.removeEventListener('keydown', key); };
}

/* ---------- 2. memory match ---------- */
function memoryGame(body, finish) {
  const faces = ['🎂', '💌', '🧸', '🌸', '✈️', '🍫'];
  const deck = shuffle([...faces, ...faces]);
  body.innerHTML = `<h3 class="g-title">Memory Match 🧠</h3><p class="g-sub">Jodi milao! Moves: <b id="mmMoves">0</b></p><div class="mem-grid" id="mmGrid"></div>`;
  const grid = $('#mmGrid');
  let first = null, lock = false, moves = 0, matched = 0;
  deck.forEach((f) => {
    const c = el('div', 'mcard', `<div class="mi"><div class="f">💗</div><div class="b">${f}</div></div>`);
    c.dataset.f = f;
    c.addEventListener('click', () => {
      if (lock || c.classList.contains('up') || c.classList.contains('ok')) return;
      c.classList.add('up'); Sound.sfx.flip();
      if (!first) { first = c; return; }
      moves++; $('#mmMoves').textContent = moves;
      if (first.dataset.f === c.dataset.f) {
        first.classList.replace('up', 'ok'); c.classList.replace('up', 'ok');
        Sound.sfx.match(); const p = centerOf(c); Fx.heartBurst(p.x, p.y, 4);
        first = null; matched++;
        if (matched === faces.length) setTimeout(win, 700);
      } else {
        lock = true; const a = first; first = null;
        setTimeout(() => { a.classList.remove('up'); c.classList.remove('up'); lock = false; Sound.sfx.wrong(); }, 850);
      }
    });
    grid.appendChild(c);
  });
  function win() {
    Sound.sfx.fanfare(); Fx.cannons();
    body.innerHTML = `<div class="g-result"><div style="font-size:64px">🧠💗</div><h3>Sab jodi mil gayi!</h3>
      <p>${moves} moves me ho gaya. Bilkul hamari jodi ki tarah, perfect match 😌</p>
      <button class="btn" id="mmDone">Wapas chalo</button></div>`;
    $('#mmDone').onclick = () => GamesUI.close();
    finish(true);
  }
  return () => {};
}

/* ---------- 3. love quiz ---------- */
function quizGame(body, finish) {
  const Q = CONFIG.quiz; let i = 0;
  function show() {
    const q = Q[i];
    body.innerHTML = `<h3 class="g-title">Love Quiz 💘</h3><p class="g-sub">Sawaal ${i + 1}/${Q.length}</p>
      <div class="qq">${T(q.q)}</div><div id="qOpts"></div><div class="qfeed" id="qFeed"></div>`;
    const box = $('#qOpts');
    q.a.forEach(([label, reply]) => {
      const b = el('button', 'qopt', T(label));
      b.addEventListener('click', () => {
        $$('.qopt', box).forEach((x) => { x.disabled = true; });
        b.classList.add('picked'); Sound.sfx.ding(i);
        $('#qFeed').textContent = T(reply);
        const p = centerOf(b); Fx.heartBurst(p.x, p.y, 4);
        setTimeout(() => { i++; if (i < Q.length) show(); else result(); }, 1900);
      });
      box.appendChild(b);
    });
  }
  function result() {
    Sound.sfx.fanfare(); Fx.cannons();
    body.innerHTML = `<div class="g-result"><h3>Love Score 💯</h3><div class="meter"><i id="meterFill"></i></div>
      <p>100%! Tum pass nahi hui, tum topper ho 🏆<br>Waise bhi mere liye tum hamesha number 1 ho 💗</p>
      <button class="btn" id="qDone">Wapas chalo</button></div>`;
    setTimeout(() => { const m = $('#meterFill'); if (m) m.style.width = '100%'; }, 100);
    $('#qDone').onclick = () => GamesUI.close();
    finish(true);
  }
  show();
  return () => {};
}

/* ---------- 4. scratch coupons ---------- */
function scratchGame(body, finish) {
  body.innerHTML = `<h3 class="g-title">Scratch Coupons 🎟️</h3><p class="g-sub">Silver wali patti ragdo aur apne gifts dekho ✨</p><div id="scList"></div><p class="g-sub" id="scMsg" style="margin-top:10px"></p>`;
  const list = $('#scList'); let opened = 0;
  CONFIG.coupons.forEach((cp) => {
    const box = el('div', 'coupon', `<div class="coupon-in"><span class="ce">${cp.emoji}</span><div><b>${T(cp.title)}</b><span>${T(cp.sub)}</span></div></div>`);
    const cv = el('canvas'); box.appendChild(cv); list.appendChild(box);
    requestAnimationFrame(() => {
      const r = box.getBoundingClientRect(); const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = r.width * dpr; cv.height = r.height * dpr;
      const c = cv.getContext('2d'); c.scale(dpr, dpr);
      const g = c.createLinearGradient(0, 0, r.width, r.height);
      g.addColorStop(0, '#d9dce6'); g.addColorStop(0.5, '#f4f5fa'); g.addColorStop(1, '#b9bdcc');
      c.fillStyle = g; c.fillRect(0, 0, r.width, r.height);
      c.fillStyle = 'rgba(120,120,150,.55)'; c.font = '700 18px Quicksand, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText('✨ yaha scratch karo ✨', r.width / 2, r.height / 2);
      let down = false, lastS = 0, done = false;
      const scratch = (e) => {
        if (!down || done) return;
        const b = cv.getBoundingClientRect();
        c.globalCompositeOperation = 'destination-out';
        c.beginPath(); c.arc(e.clientX - b.left, e.clientY - b.top, 20, 0, 6.3); c.fill();
        if (e.timeStamp - lastS > 70) { Sound.sfx.scratch(); lastS = e.timeStamp; }
      };
      const check = () => {
        if (done) return;
        const d = c.getImageData(0, 0, cv.width, cv.height).data; let clear = 0, tot = 0;
        for (let k = 3; k < d.length; k += 64) { tot++; if (d[k] < 40) clear++; }
        if (clear / tot > 0.45) {
          done = true; cv.classList.add('gone'); Sound.sfx.fanfare();
          const p = centerOf(box); Fx.confetti(p.x, p.y, { count: 70, power: 9 });
          if (++opened === CONFIG.coupons.length) { $('#scMsg').textContent = 'Saare coupons tumhare! Milte hi redeem karungi 🥰'; finish(true); }
        }
      };
      cv.addEventListener('pointerdown', (e) => { down = true; cv.setPointerCapture(e.pointerId); scratch(e); });
      cv.addEventListener('pointermove', scratch);
      cv.addEventListener('pointerup', () => { down = false; check(); });
      cv.addEventListener('pointercancel', () => { down = false; });
    });
  });
  return () => {};
}

/* ---------- panel + hub ---------- */
const GamesUI = {
  cleanup: null,
  open(id) {
    $('#panel').hidden = false;
    const body = $('#panelBody');
    const finish = (ok) => { if (ok) Scenes.games.complete(id); };
    const fn = { catch: catchGame, memory: memoryGame, quiz: quizGame, scratch: scratchGame }[id];
    this.cleanup = fn(body, finish) || null;
    Sound.sfx.click();
  },
  close() {
    if (this.cleanup) { this.cleanup(); this.cleanup = null; }
    $('#panel').hidden = true; $('#panelBody').innerHTML = '';
  }
};

Scenes.games = {
  inited: false, done: new Set(),
  init() {
    this.inited = true;
    const grid = $('#gameGrid');
    GAMES.forEach((g) => {
      const b = el('button', 'game-card', `<span class="gi">${g.icon}</span><h3>${g.title}</h3><p>${g.desc}</p>`);
      b.dataset.id = g.id;
      b.addEventListener('click', () => GamesUI.open(g.id));
      grid.appendChild(b);
    });
    $('#panelClose').addEventListener('click', () => GamesUI.close());
  },
  complete(id) {
    this.done.add(id);
    this.refresh();
  },
  refresh() {
    $$('.game-card').forEach((c) => c.classList.toggle('done', this.done.has(c.dataset.id)));
    const n = this.done.size;
    $('#gameProgress').textContent = n === GAMES.length ? 'Sab games jeet liye! 🏆 Ab love letter ka time' : `${n}/${GAMES.length} games complete. Kam se kam 2 khelo, phir letter 😉`;
    $('#gamesNext').classList.toggle('glowy', n >= 2);
  },
  enter() {
    if (!this.inited) this.init();
    $('#games').scrollTop = 0;
    $('#panel').hidden = true;
    this.refresh();
  },
  exit() { GamesUI.close(); }
};
