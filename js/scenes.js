/* =====================================================================
   Scenes: intro, welcome, decor, cake, story, gallery, letter, party
   (games alag file me: games.js)
   Har scene ke paas enter() / exit() hota hai. App.go('id') se chalte hain.
   ===================================================================== */
const Scenes = {};
const centerOf = (node) => { const r = node.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };

/* ============================== 0. INTRO ============================== */
Scenes.intro = {
  inited: false,
  target() {
    const n = new Date(); const { month, day } = CONFIG.birthday;
    const endOfDay = new Date(n.getFullYear(), month - 1, day, 23, 59, 59);
    const y = n > endOfDay ? n.getFullYear() + 1 : n.getFullYear();
    return new Date(y, month - 1, day, 0, 0, 0);
  },
  renderCountdown() {
    const box = $('#countdown');
    const diff = this.target() - new Date();
    if (diff <= 0) { box.innerHTML = '<div class="cd-today">Aaj tumhara din hai! 🎉</div>'; return; }
    if (!this.cells) {
      box.innerHTML = ['Din', 'Ghante', 'Minute', 'Second'].map((l) => `<div class="cd-box"><b>00</b><span>${l}</span></div>`).join('');
      this.cells = $$('.cd-box b', box);
    }
    const s = Math.floor(diff / 1000);
    const vals = [Math.floor(s / 86400), Math.floor(s % 86400 / 3600), Math.floor(s % 3600 / 60), s % 60];
    vals.forEach((v, i) => { this.cells[i].textContent = String(v).padStart(2, '0'); });
  },
  enter() {
    if (this.inited) return;
    this.inited = true;
    const st = $('#stars');
    for (let i = 0; i < 80; i++) {
      const s = el('i');
      s.style.cssText = `left:${rand(0, 100)}%;top:${rand(0, 100)}%;animation-delay:${-rand(0, 3)}s;animation-duration:${rand(2, 5)}s;transform:scale(${rand(0.5, 1.5)})`;
      st.appendChild(s);
    }
    this.renderCountdown();
    this.timer = setInterval(() => this.renderCountdown(), 1000);
    $('#openGift').addEventListener('click', (e) => {
      if (this.opened) return;
      this.opened = true;
      Sound.init(); Sound.startBgm();
      Sound.sfx.sparkle(); Sound.sfx.fanfare();
      $('#openGift').classList.add('opening');
      const c = centerOf($('.gift-emoji'));
      Fx.confetti(c.x, c.y, { count: 140, power: 13 });
      setTimeout(() => { App.go('welcome'); this.opened = false; $('#openGift').classList.remove('opening'); }, 1000);
    });
  },
  exit() {}
};

/* ============================== 1. WELCOME ============================ */
Scenes.welcome = {
  token: 0, skip: false,
  async enter() {
    const slot = $('#welcomeBear');
    slot.innerHTML = Chars.bear({ hat: true, heart: true });
    slot.classList.add('waving');
    const typer = $('#typer'); typer.innerHTML = '';
    $('#welcomeNext').hidden = true;
    this.skip = false;
    const token = ++this.token;
    await wait(1100);
    for (const line of CONFIG.welcome) {
      if (token !== this.token) return;
      const p = el('p', 'typing'); typer.appendChild(p);
      const chars = [...T(line)];
      for (let i = 1; i <= chars.length; i++) {
        if (token !== this.token) return;
        p.textContent = chars.slice(0, i).join('');
        if (i % 4 === 0 && !this.skip) Sound.sfx.tick();
        if (!this.skip) await wait(36);
      }
      p.classList.remove('typing');
      if (!this.skip) { Sound.sfx.sparkle(); await wait(380); }
    }
    if (token !== this.token) return;
    $('#welcomeNext').hidden = false;
    Fx.heartBurst(Fx.W / 2, Fx.H * 0.35, 10);
  },
  exit() { this.token++; }
};

/* ============================== 2. DECOR ============================== */
Scenes.decor = {
  inited: false, lit: false, pops: 0,
  init() {
    this.inited = true;
    const COLS = ['#ff4d94', '#ff9ec8', '#ffd27a', '#d9b8ff', '#9fe7ff', '#ff74ad', '#fff'];
    // fairy lights
    const fairy = $('#fairy');
    const N = 17, pts = [];
    const yAt = (f) => 8 + 38 * Math.sin(Math.PI * ((f * 2) % 1));
    for (let i = 0; i <= 80; i++) { const f = i / 80; pts.push(`${(f * 100).toFixed(2)},${yAt(f).toFixed(2)}`); }
    fairy.innerHTML = `<svg viewBox="0 0 100 90" preserveAspectRatio="none"><path d="M${pts.join(' L')}"/></svg>`;
    for (let i = 0; i < N; i++) {
      const f = (i + 0.5) / N;
      const b = el('i', 'bulb');
      b.style.cssText = `left:${(f * 100).toFixed(2)}%;top:${yAt(f).toFixed(1)}px;--c:${COLS[i % COLS.length]};--d:${-rand(0, 1.7).toFixed(2)}s`;
      fairy.appendChild(b);
    }
    // bunting
    const FL = ['#ff4d94', '#ffd27a', '#d9b8ff', '#9fe7ff', '#ff9ec8', '#fff'];
    const bunt = (id, word) => {
      const box = $(id); const row = el('div', 'brow'); const n = word.length;
      const pathPts = [];
      for (let i = 0; i <= 40; i++) pathPts.push(`${(i / 40 * 100).toFixed(1)},${(24 * Math.sin(Math.PI * i / 40)).toFixed(1)}`);
      row.innerHTML = `<svg class="bline" viewBox="0 0 100 26" preserveAspectRatio="none"><path d="M${pathPts.join(' L')}"/></svg>`;
      [...word].forEach((ch, i) => {
        const f = (i + 0.5) / n;
        const y = 24 * Math.sin(Math.PI * f);
        const slope = Math.atan((24 * Math.PI / n) * Math.cos(Math.PI * f) / 44) * 180 / Math.PI * 0.55;
        const fl = el('span', 'flag', ch);
        fl.style.cssText = `--c:${FL[(i + (id === '#bunting2' ? 2 : 0)) % FL.length]};--i:${i + (id === '#bunting2' ? 5 : 0)};--y:${y.toFixed(1)}px;--r:${slope.toFixed(1)}deg`;
        if (fl.style.getPropertyValue('--c') === '#fff') fl.style.color = '#ff4d94';
        row.appendChild(fl);
      });
      box.appendChild(row);
    };
    bunt('#bunting1', 'HAPPY'); bunt('#bunting2', 'BIRTHDAY');
    // streamers
    const sBox = $('#streamers');
    for (let i = 0; i < 16; i++) {
      const s = el('i');
      s.style.cssText = `left:${(i / 16 * 100 + rand(0, 4)).toFixed(1)}%;--h:${rand(40, 130).toFixed(0)}px;--c:${pick(COLS)};animation-delay:${-rand(0, 3).toFixed(1)}s;animation-duration:${rand(2.6, 4).toFixed(1)}s`;
      sBox.appendChild(s);
    }
    // interaction
    const dark = $('#darkness');
    dark.addEventListener('pointermove', (e) => { dark.style.setProperty('--mx', e.clientX + 'px'); dark.style.setProperty('--my', e.clientY + 'px'); });
    $('#cord').addEventListener('click', () => this.lightOn());
  },
  enter() {
    if (!this.inited) this.init();
    this.lit = false; this.pops = 0;
    $('#room').classList.remove('lit');
    const dark = $('#darkness'); dark.classList.remove('off');
    dark.style.removeProperty('--mx'); dark.style.removeProperty('--my');
    $('#cord').classList.remove('pulled');
    $('#balloons').innerHTML = '';
    $('#decorNext').hidden = true; $('#popCount').hidden = true; $('#decorLine').hidden = true;
    clearTimeout(this.t1); clearTimeout(this.t2); clearTimeout(this.t3);
  },
  lightOn() {
    if (this.lit) return;
    this.lit = true;
    $('#cord').classList.add('pulled');
    Sound.sfx.switchOn();
    this.t1 = setTimeout(() => {
      $('#darkness').classList.add('off');
      $('#room').classList.add('lit');
      Fx.cannons();
      for (let i = 0; i < 8; i++) setTimeout(() => this.spawnBalloon(), i * 420);
    }, 400);
    this.t2 = setTimeout(() => this.say('Balloons pe tap karke phodo! 🎈'), 3400);
    this.t3 = setTimeout(() => { $('#decorNext').hidden = false; }, 6500);
  },
  say(msg) { const l = $('#decorLine'); l.textContent = msg; l.hidden = false; },
  spawnBalloon() {
    if (App.current !== 'decor') return;
    const cols = [['#ff4d94', '#df2977'], ['#ff9ec8', '#f06aa4'], ['#ffd27a', '#f5b041'], ['#d9b8ff', '#b388ff'], ['#9fe7ff', '#5cc8f0'], ['#ffffff', '#e8cfdc'], ['#ff8a8a', '#e04848']];
    const [c, c2] = pick(cols);
    const b = el('div', 'balloon', '<div class="bi"></div>');
    b.style.left = rand(2, 86) + '%';
    b.style.animationDuration = rand(10, 17).toFixed(1) + 's';
    b.style.setProperty('--c', c); b.style.setProperty('--c2', c2);
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); this.pop(b); });
    b.addEventListener('animationend', () => { b.remove(); this.spawnBalloon(); });
    $('#balloons').appendChild(b);
  },
  pop(b) {
    const r = b.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + 36;
    Sound.sfx.pop();
    Fx.confetti(x, y, { count: 30, power: 7 });
    if (Math.random() < 0.5) Fx.heartBurst(x, y, 3);
    b.remove();
    this.pops++;
    const pc = $('#popCount'); pc.hidden = false; pc.textContent = `🎈 ${this.pops} balloons phode`;
    if (this.pops === 5) this.say('Itne balloons nahi, mere paas tumhare liye infinite pyaar hai 💗');
    if (this.pops === 12) this.say('Aur phodo! Mazaa aa raha hai na? 😜');
    setTimeout(() => this.spawnBalloon(), 500);
  },
  exit() { clearTimeout(this.t1); clearTimeout(this.t2); clearTimeout(this.t3); }
};

/* =============================== 3. CAKE ============================== */
Scenes.cake = {
  stage: 'light', lit: new Set(), alive: [], strength: 0, blowT: 0, holding: false, raf: 0, micOk: false,
  markup() {
    const n = CONFIG.candles;
    const sp = Math.min(24, 118 / n), cx0 = 156;
    const cols = ['#ffd27a', '#ffffff', '#9fe7ff', '#d9b8ff', '#ff9ec8', '#bff0d0', '#ffb3b3'];
    const scallop = (x, y, w, nSc, base) => {
      const sw = w / nSc; let d = `M${x} ${y} H${x + w} v${base}`;
      for (let i = 0; i < nSc; i++) { const dep = 14 + ((i * 7) % 3) * 9; d += ` q${(-sw / 2).toFixed(1)} ${dep} ${(-sw).toFixed(1)} 0`; }
      return d + ' Z';
    };
    // deterministic sprinkles
    let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    let sprinkles = '';
    const scol = ['#ff4d94', '#ffd27a', '#9fe7ff', '#ffffff', '#d9b8ff'];
    for (let i = 0; i < 34; i++) {
      const top = i < 12;
      const x = top ? 90 + rnd() * 160 : 52 + rnd() * 236;
      const y = top ? 150 + rnd() * 34 : 222 + rnd() * 40;
      sprinkles += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="9" height="3.4" rx="1.7" fill="${scol[i % 5]}" transform="rotate(${(rnd() * 180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
    }
    let pearls = '';
    for (let x = 52; x < 300; x += 17) pearls += `<circle cx="${x}" cy="276" r="4.2" fill="#fff"/>`;
    let candles = '';
    for (let i = 0; i < n; i++) {
      const cx = cx0 + (i - (n - 1) / 2) * sp;
      candles += `<g class="candle" data-i="${i}">
        <rect x="${cx - 16}" y="44" width="32" height="84" fill="transparent"/>
        <rect x="${cx - 5}" y="82" width="10" height="44" rx="3" fill="${cols[i % cols.length]}"/>
        <path d="M${cx - 5} 94 l10 -6 M${cx - 5} 106 l10 -6 M${cx - 5} 118 l10 -6" stroke="#ff74ad" stroke-width="2.4" opacity=".55"/>
        <line x1="${cx}" y1="82" x2="${cx}" y2="75" stroke="#6b4a3a" stroke-width="2" stroke-linecap="round"/>
        <circle class="candle-tap" cx="${cx}" cy="73" r="5" fill="#ffd27a"/>
        <g transform="translate(${cx} 75)">
          <path class="smoke" d="M0 -4 q7 -12 0 -22 q-7 -10 2 -20" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>
          <g class="flame"><g class="fl-lean"><g class="fl-flick">
            <circle cx="0" cy="-13" r="26" fill="url(#gGlow)"/>
            <path d="M0 -28 C10 -13 11 -2 0 5 C-11 -2 -10 -13 0 -28 Z" fill="url(#gFlame)"/>
            <path d="M0 -12 C4.5 -6 4.5 -1 0 2 C-4.5 -1 -4.5 -6 0 -12 Z" fill="#fffbe0" opacity=".85"/>
          </g></g></g>
        </g>
      </g>`;
    }
    return `
    <defs>
      <linearGradient id="gSB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb3d2"/><stop offset="1" stop-color="#ff8bba"/></linearGradient>
      <linearGradient id="gST" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd6e8"/><stop offset="1" stop-color="#ffb5d4"/></linearGradient>
      <radialGradient id="gFlame" cx="50%" cy="72%" r="62%"><stop offset="0" stop-color="#fff7c2"/><stop offset=".5" stop-color="#ffc83d"/><stop offset="1" stop-color="#ff7a1a"/></radialGradient>
      <radialGradient id="gGlow"><stop offset="0" stop-color="#ffe9a0" stop-opacity=".75"/><stop offset="1" stop-color="#ffe9a0" stop-opacity="0"/></radialGradient>
      <clipPath id="clipMain"><rect x="-40" y="0" width="272" height="330"/></clipPath>
      <clipPath id="clipSlice"><rect x="232" y="0" width="140" height="330"/></clipPath>
      <g id="cakeG">
        <rect x="40" y="190" width="260" height="92" rx="16" fill="url(#gSB)"/>
        <path d="${scallop(40, 190, 260, 10, 8)}" fill="#fff6fa"/>
        <rect x="80" y="122" width="180" height="76" rx="14" fill="url(#gST)"/>
        <rect x="80" y="170" width="180" height="9" fill="#ff74ad" opacity=".85"/>
        <path d="${scallop(80, 122, 180, 8, 8)}" fill="#fff6fa"/>
        ${sprinkles}
        <rect x="46" y="270" width="248" height="12" rx="6" fill="#fff6fa" opacity=".9"/>
        ${pearls}
        <text x="170" y="252" text-anchor="middle" font-family="Pacifico,'Brush Script MT',cursive" font-size="29" fill="#fff" stroke="#e8337f" stroke-width="5" paint-order="stroke" stroke-linejoin="round">${CONFIG.name} 💗</text>
        <g transform="translate(108 118)"><path d="M0 0 c-12 -2 -17 12 -9 23 c4 5 13 5 17 0 c8 -11 4 -25 -8 -23z" fill="#ff3d6e"/><path d="M-7 -2 l7 7 l7 -7 l-7 -5z" fill="#3ea66b"/><circle cx="-3" cy="10" r="1.3" fill="#ffd0dc"/><circle cx="4" cy="14" r="1.3" fill="#ffd0dc"/></g>
        <g transform="translate(244 118)"><path d="M0 0 c-12 -2 -17 12 -9 23 c4 5 13 5 17 0 c8 -11 4 -25 -8 -23z" fill="#ff3d6e"/><path d="M-7 -2 l7 7 l7 -7 l-7 -5z" fill="#3ea66b"/><circle cx="-3" cy="10" r="1.3" fill="#ffd0dc"/><circle cx="4" cy="14" r="1.3" fill="#ffd0dc"/></g>
      </g>
    </defs>
    <ellipse cx="170" cy="294" rx="168" ry="20" fill="rgba(176,18,95,.16)"/>
    <ellipse cx="170" cy="285" rx="160" ry="18" fill="#fff"/>
    <ellipse cx="170" cy="285" rx="132" ry="11" fill="#ffe3ef"/>
    <use href="#cakeG" clip-path="url(#clipMain)"/>
    <rect class="cut-gap" x="229" y="124" width="4" height="158" fill="#c43c78" opacity=".35"/>
    <g id="sliceG"><use href="#cakeG" clip-path="url(#clipSlice)"/></g>
    ${candles}`;
  },
  enter() {
    this.reset();
  },
  reset() {
    this.cleanup();
    this.stage = 'light'; this.lit = new Set(); this.strength = 0; this.blowT = 0; this.holding = false;
    const svg = $('#cakeSvg');
    svg.innerHTML = this.markup();
    svg.style.setProperty('--lean', 0);
    $('#cakeStage').classList.remove('cut');
    $('#knife').classList.remove('go');
    $('#sliceNote').hidden = true; $('#bigHB').hidden = true; $('#wish').hidden = true;
    ['blowBtn', 'cutBtn', 'cakeNext'].forEach((id) => { $('#' + id).hidden = true; });
    this.title('Pehle candles jalao 🕯️', 'Har candle pe tap karo 👆');
    $$('.candle', svg).forEach((c) => c.addEventListener('pointerdown', (e) => { e.stopPropagation(); this.light(+c.dataset.i, c); }));
    $('#cakeStage').onpointerdown = () => { if (this.stage === 'cut') this.doCut(); };
    const bb = $('#blowBtn');
    bb.onpointerdown = (e) => { e.preventDefault(); this.holding = true; };
    ['onpointerup', 'onpointerleave', 'onpointercancel'].forEach((k) => { bb[k] = () => { this.holding = false; }; });
    $('#cutBtn').onclick = () => this.doCut();
    this.alive = [];
  },
  title(t, h) { $('#cakeTitle').textContent = t; $('#cakeHint').textContent = h || ''; },
  light(i, node) {
    if (this.stage !== 'light' || this.lit.has(i)) return;
    this.lit.add(i);
    node.classList.add('lit');
    Sound.sfx.ding(this.lit.size);
    const c = centerOf(node); Fx.heartBurst(c.x, c.y - 30, 2, ['✨', '💛']);
    const left = CONFIG.candles - this.lit.size;
    if (left > 0) $('#cakeHint').textContent = `${left} candle${left > 1 ? 's' : ''} aur 🕯️`;
    else setTimeout(() => this.startWish(), 800);
  },
  async startWish() {
    this.stage = 'wish';
    const w = $('#wish'), cnt = $('#wishCount');
    w.hidden = false;
    Sound.setBgmLevel(0.3, 0.6);
    for (let n = 3; n >= 1; n--) { cnt.textContent = n; Sound.sfx.ding(n); await wait(1100); if (App.current !== 'cake') return; }
    w.hidden = true;
    this.stage = 'blow';
    this.alive = $$('.candle', $('#cakeSvg')).filter((c) => c.classList.contains('lit'));
    this.title('Ab phoonk maaro! 🌬️', 'Mic allow karo aur phoonk maaro, ya neeche button hold karo');
    $('#blowBtn').hidden = false;
    Sound.setBgmLevel(0.14, 0.6);
    this.startMic();
    this.base = 0; this.baseN = 0; this.last = performance.now(); this.lastSfx = 0;
    this.raf = requestAnimationFrame((t) => this.tick(t));
  },
  async startMic() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('no mic api');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      if (this.stage !== 'blow') { stream.getTracks().forEach((t) => t.stop()); return; }
      this.stream = stream;
      const AC = window.AudioContext || window.webkitAudioContext;
      this.mac = new AC();
      const src = this.mac.createMediaStreamSource(stream);
      this.an = this.mac.createAnalyser(); this.an.fftSize = 1024;
      src.connect(this.an);
      this.buf = new Uint8Array(this.an.fftSize);
      this.micOk = true;
      $('#cakeHint').textContent = 'Mic ON 🎤 — ab phoonk maaro (ya button hold karo)';
    } catch (e) {
      this.micOk = false;
      $('#cakeHint').textContent = 'Mic nahi chala — neeche wala button hold karke phoonk maaro 👇';
    }
  },
  tick(ts) {
    if (this.stage !== 'blow') return;
    const dt = Math.min(0.05, (ts - this.last) / 1000 || 0.016); this.last = ts;
    let s = 0;
    if (this.micOk && this.an) {
      this.an.getByteTimeDomainData(this.buf);
      let sum = 0;
      for (let i = 0; i < this.buf.length; i++) { const x = (this.buf[i] - 128) / 128; sum += x * x; }
      const rms = Math.sqrt(sum / this.buf.length);
      if (this.baseN < 40) { this.base = Math.min(0.08, (this.base * this.baseN + rms) / (this.baseN + 1)); this.baseN++; }
      else { const thr = this.base * 2.4 + 0.045; s = Math.max(0, Math.min(1, (rms - thr) / 0.12)); }
    }
    if (this.holding) s = Math.max(s, 0.8);
    this.strength += (s - this.strength) * 0.35;
    $('#cakeSvg').style.setProperty('--lean', this.strength.toFixed(2));
    if (this.strength > 0.2) {
      this.blowT += dt * this.strength;
      if (ts - this.lastSfx > 550) { Sound.sfx.blow(); this.lastSfx = ts; }
      const need = 0.3;
      while (this.blowT > need && this.alive.length) {
        this.blowT -= need;
        const k = Math.floor(Math.random() * this.alive.length);
        const c = this.alive.splice(k, 1)[0];
        c.classList.remove('lit'); c.classList.add('out');
        Sound.sfx.puff();
      }
    } else this.blowT = Math.max(0, this.blowT - dt * 0.5);
    if (!this.alive.length) { this.finishBlow(); return; }
    this.raf = requestAnimationFrame((t) => this.tick(t));
  },
  stopMic() {
    if (this.stream) { this.stream.getTracks().forEach((t) => t.stop()); this.stream = null; }
    if (this.mac) { try { this.mac.close(); } catch (e) {} this.mac = null; }
    this.an = null; this.micOk = false;
  },
  finishBlow() {
    this.stage = 'celebrate';
    this.stopMic();
    $('#cakeSvg').style.setProperty('--lean', 0);
    $('#blowBtn').hidden = true;
    Sound.sfx.fanfare();
    Fx.cannons(); Fx.confetti(Fx.W / 2, Fx.H * 0.4, { count: 160, power: 14 });
    Fx.firework(2);
    const dur = Sound.playBirthday();
    const hb = $('#bigHB'); hb.hidden = false; hb.classList.remove('bye');
    this.title('Happy Birthday! 🎉', 'Wish zaroor poori hogi 🤍');
    setTimeout(() => { hb.classList.add('bye'); setTimeout(() => { hb.hidden = true; }, 800); }, 5200);
    setTimeout(() => {
      if (App.current !== 'cake') return;
      this.stage = 'cut';
      this.title('Ab cake kaato ✂️', 'Cake pe tap karo ya button dabao');
      $('#cutBtn').hidden = false;
      Fx.rain(2500);
    }, 3200);
    this.dur = dur;
  },
  async doCut() {
    if (this.stage !== 'cut') return;
    this.stage = 'cutting';
    $('#cutBtn').hidden = true;
    const kn = $('#knife'); kn.classList.remove('go'); void kn.offsetWidth; kn.classList.add('go');
    Sound.sfx.cut();
    await wait(720);
    $('#cakeStage').classList.add('cut');
    const c = centerOf($('#cakeStage'));
    Fx.confetti(c.x + 60, c.y, { count: 80, power: 10 });
    Fx.heartBurst(c.x + 70, c.y + 20, 8);
    Sound.sfx.sparkle();
    await wait(900);
    $('#sliceNote').hidden = false;
    this.title('Yummy! 🍰', 'Ye piece tumhare liye, doosra mere liye (jab mile tab) 😌');
    this.stage = 'done';
    setTimeout(() => { $('#cakeNext').hidden = false; }, 1200);
  },
  cleanup() {
    cancelAnimationFrame(this.raf);
    this.stopMic();
  },
  exit() {
    this.cleanup();
    $('#wish').hidden = true; $('#bigHB').hidden = true;
    Sound.setBgmLevel(0.55, 1.5);
  }
};

/* =============================== 4. STORY ============================== */
Scenes.story = {
  inited: false,
  init() {
    this.inited = true;
    $('#pinHim').innerHTML = Chars.bear({ hat: false, heart: true }) + `<div>${CONFIG.from}</div>`;
    $('#pinHer').innerHTML = Chars.bunny({ bow: true, heart: true }) + `<div>${CONFIG.name}</div>`;
    const tl = $('#timeline');
    CONFIG.story.forEach((s) => {
      const item = el('div', 'tl-item');
      const card = el('div', 'tl-card');
      card.appendChild(photoEl(s.photo, s.title)).classList.add('tl-photo');
      card.insertAdjacentHTML('beforeend', `<h3>${T(s.title)}</h3><p>${T(s.text)}</p>`);
      item.appendChild(card); tl.appendChild(item);
    });
    const st = $('#stats');
    CONFIG.stats.forEach((s) => st.insertAdjacentHTML('beforeend', `<div class="stat"><b data-v="${s.value}">${typeof s.value === 'number' ? 0 : s.value}</b><span>${s.label}</span></div>`));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('show');
        if (e.target.classList.contains('stats')) this.countUp();
        else { Sound.sfx.sparkle(); const c = centerOf(e.target); Fx.heartBurst(c.x, c.y, 3); }
        io.unobserve(e.target);
      });
    }, { root: $('#story'), threshold: 0.3 });
    $$('.tl-card', tl).forEach((c) => io.observe(c));
    io.observe(st);
  },
  countUp() {
    $$('.stat b').forEach((b) => {
      const v = +b.dataset.v; if (isNaN(v)) return;
      const t0 = performance.now();
      const step = (t) => { const k = Math.min(1, (t - t0) / 1200); b.textContent = Math.round(v * k); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  },
  enter() { if (!this.inited) this.init(); $('#story').scrollTop = 0; },
  exit() {}
};

/* ============================== 5. GALLERY ============================= */
Scenes.gallery = {
  inited: false,
  enter() {
    $('#gallery').scrollTop = 0;
    if (this.inited) return;
    this.inited = true;
    const wall = $('#wall');
    CONFIG.photos.forEach((p, i) => {
      const d = el('div', 'polaroid');
      d.style.cssText = `--r:${rand(-4.5, 4.5).toFixed(1)}deg;--i:${i}`;
      const front = el('div', 'pol-face'); front.appendChild(photoEl(i, p.caption));
      front.insertAdjacentHTML('beforeend', `<div class="pol-cap">${T(p.caption)}</div>`);
      const back = el('div', 'pol-face pol-back', T(p.note));
      const inner = el('div', 'pol-inner'); inner.append(front, back);
      d.appendChild(inner);
      d.addEventListener('click', (e) => {
        d.classList.toggle('flipped'); Sound.sfx.flip();
        if (d.classList.contains('flipped')) Fx.heartBurst(e.clientX, e.clientY, 5);
      });
      wall.appendChild(d);
    });
  },
  exit() {}
};

/* =============================== 7. LETTER ============================= */
Scenes.letter = {
  opened: false,
  enter() {
    this.opened = false;
    const env = $('#envelope');
    env.classList.remove('open', 'gone');
    $('#letterCard').hidden = true; $('#letterCard').innerHTML = '';
    $('#letterNext').hidden = true;
    $('#letterHint').hidden = false; $('#letterHint').textContent = 'Ek chitthi aayi hai tumhare liye 💌 (tap karo)';
    $('#letter').scrollTop = 0;
    env.onclick = () => this.open();
  },
  async open() {
    if (this.opened) return; this.opened = true;
    const env = $('#envelope');
    Sound.sfx.whoosh();
    env.classList.add('open');
    $('#letterHint').hidden = true;
    await wait(1900);
    if (App.current !== 'letter') return;
    env.classList.add('gone');
    const card = $('#letterCard'); card.hidden = false;
    const L = CONFIG.letter;
    card.innerHTML = L.map((p, i) => `<p class="lp${i >= L.length - 2 ? ' sign' : ''}" style="--i:${i}">${T(p)}</p>`).join('');
    Sound.sfx.sparkle();
    const c = centerOf(card); Fx.heartBurst(c.x, c.y - 60, 10);
    for (let i = 0; i < L.length; i++) {
      setTimeout(() => { if (App.current === 'letter') { Sound.sfx.tick(); if (i % 2 === 0) Fx.heartBurst(Fx.W * rand(0.2, 0.8), Fx.H * rand(0.3, 0.7), 1); } }, (i * 0.7 + 0.8) * 1000);
    }
    setTimeout(() => {
      if (App.current !== 'letter') return;
      $('#letterNext').hidden = false;
      $('#letter').scrollTo({ top: 99999, behavior: 'smooth' });
    }, (L.length * 0.7 + 2) * 1000);
  },
  exit() {}
};

/* =============================== 8. PARTY ============================== */
Scenes.party = {
  inited: false, timers: [],
  init() {
    this.inited = true;
    const fg = $('#floorGrid');
    for (let i = 0; i < 48; i++) { const t = el('i', 'tile'); t.style.setProperty('--d', `${-(Math.random() * 2.4).toFixed(2)}s`); fg.appendChild(t); }
    const eq = $('#eq');
    for (let i = 0; i < 34; i++) { const b = el('i'); b.style.cssText = `--t:${rand(0.3, 0.8).toFixed(2)}s;--h:${rand(25, 100).toFixed(0)}%;animation-delay:${-rand(0, 0.8).toFixed(2)}s`; eq.appendChild(b); }
    $('#dancers').innerHTML = `<div class="dancer d1">${Chars.bear({ hat: true, heart: false })}</div><div class="dancer d2">${Chars.bunny({ bow: true, heart: false })}</div>`;
    $$('.dancer').forEach((d) => d.addEventListener('pointerdown', (e) => { Fx.heartBurst(e.clientX, e.clientY, 8); Sound.sfx.sparkle(); }));
    $('#boom').onclick = () => { Fx.cannons(); Fx.rain(2500); };
    $('#fw').onclick = () => Fx.firework(5);
    $('#musicBtn').onclick = () => {
      if (Sound.isPartyOn()) { Sound.stopParty(false); $('#eq').classList.add('off'); }
      else { Sound.startParty(); $('#eq').classList.remove('off'); }
    };
    $('#keepDancing').onclick = () => { $('#finale').hidden = true; Fx.cannons(); };
    $('#replay').onclick = () => { $('#finale').hidden = true; App.go('welcome'); };
    $('#toLetter').onclick = () => { $('#finale').hidden = true; App.go('letter'); };
  },
  enter() {
    if (!this.inited) this.init();
    $('#finale').hidden = true; $('#eq').classList.remove('off');
    $('#finaleText').textContent = T(CONFIG.finale);
    Sound.startParty();
    const at = (ms, fn) => this.timers.push(setTimeout(() => { if (App.current === 'party') fn(); }, ms));
    at(900, () => Fx.cannons());
    at(2400, () => Fx.firework(3));
    at(6500, () => Fx.cannons());
    at(9000, () => Fx.firework(4));
    at(13000, () => { Fx.rain(3000); });
    at(16000, () => { $('#finale').hidden = false; Fx.heartBurst(Fx.W / 2, Fx.H / 2, 12); });
    this.loop = setInterval(() => { if (App.current === 'party') Fx.confetti(rand(0, Fx.W), -10, { count: 5, spread: 0.5, angle: Math.PI / 2, power: 3 }); }, 700);
  },
  exit() {
    this.timers.forEach(clearTimeout); this.timers = [];
    clearInterval(this.loop);
    Sound.stopParty(true);
  }
};
