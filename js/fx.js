/* =====================================================================
   Visual effects: confetti, fireworks, floating emojis, sparkle trail,
   background hearts, cute SVG characters (bear + bunny)
   ===================================================================== */
const Fx = (() => {
  const cv = $('#fx');
  const c = cv.getContext('2d');
  let W = 0, H = 0;
  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  const COLORS = ['#ff4d94', '#ff9ec8', '#ffd27a', '#d9b8ff', '#ffffff', '#ff74ad', '#9fe7ff', '#ffb3d9'];
  const parts = [];
  let running = false;

  function heartPath(x, y, s) {
    c.beginPath();
    c.moveTo(x, y + s * 0.3);
    c.bezierCurveTo(x, y - s * 0.3, x - s, y - s * 0.3, x - s, y + s * 0.3);
    c.bezierCurveTo(x - s, y + s * 0.8, x, y + s * 1.1, x, y + s * 1.4);
    c.bezierCurveTo(x, y + s * 1.1, x + s, y + s * 0.8, x + s, y + s * 0.3);
    c.bezierCurveTo(x + s, y - s * 0.3, x, y - s * 0.3, x, y + s * 0.3);
    c.closePath();
  }

  function loop() {
    c.clearRect(0, 0, W, H);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life++;
      if (p.k === 'c') {
        p.vx *= p.drag; p.vy = p.vy * p.drag + p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        const a = p.life > p.max - 30 ? Math.max(0, (p.max - p.life) / 30) : 1;
        c.save(); c.globalAlpha = a; c.translate(p.x, p.y); c.rotate(p.rot);
        c.fillStyle = p.col;
        if (p.shape === 'rect') c.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.life * 0.15)) + 1);
        else if (p.shape === 'circ') { c.beginPath(); c.arc(0, 0, p.w / 2, 0, 6.3); c.fill(); }
        else { heartPath(0, -p.w / 2, p.w * 0.5); c.fill(); }
        c.restore();
        if (p.life >= p.max || p.y > H + 40) parts.splice(i, 1);
      } else if (p.k === 'r') { // rocket
        p.x += p.vx; p.y += p.vy; p.vy += 0.07;
        c.globalCompositeOperation = 'lighter';
        c.fillStyle = '#fff'; c.beginPath(); c.arc(p.x, p.y, 2, 0, 6.3); c.fill();
        c.globalCompositeOperation = 'source-over';
        if (p.vy > -1.2 || p.y < p.target) { explode(p.x, p.y); parts.splice(i, 1); }
      } else { // spark
        p.px = p.x; p.py = p.y;
        p.vx *= p.drag; p.vy = p.vy * p.drag + p.g; p.x += p.vx; p.y += p.vy;
        const a = Math.max(0, 1 - p.life / p.max);
        c.globalCompositeOperation = 'lighter';
        c.strokeStyle = p.col; c.globalAlpha = a; c.lineWidth = p.size; c.lineCap = 'round';
        c.beginPath(); c.moveTo(p.px, p.py); c.lineTo(p.x, p.y); c.stroke();
        c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
        if (p.life >= p.max) parts.splice(i, 1);
      }
    }
    if (parts.length) requestAnimationFrame(loop); else { running = false; c.clearRect(0, 0, W, H); }
  }
  function start() { if (!running) { running = true; requestAnimationFrame(loop); } }

  function confetti(x = W / 2, y = H / 2, { count = 110, spread = Math.PI * 2, angle = -Math.PI / 2, power = 11 } = {}) {
    for (let i = 0; i < count; i++) {
      const a = angle + (Math.random() - 0.5) * spread;
      const v = power * (0.35 + Math.random() * 0.9);
      const r = Math.random();
      parts.push({
        k: 'c', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 0.26, drag: 0.985,
        rot: Math.random() * 6.3, vr: (Math.random() - 0.5) * 0.4, w: 6 + Math.random() * 7, h: 8 + Math.random() * 8,
        col: pick(COLORS), life: 0, max: 130 + Math.random() * 90, shape: r < 0.28 ? 'heart' : r < 0.65 ? 'rect' : 'circ'
      });
    }
    start();
  }
  function cannons() {
    confetti(0, H, { count: 90, spread: 0.7, angle: -1.15, power: 17 });
    confetti(W, H, { count: 90, spread: 0.7, angle: -Math.PI + 1.15, power: 17 });
    Sound.sfx.boom();
  }
  function rain(ms = 3500) {
    const end = performance.now() + ms;
    (function drop() {
      confetti(Math.random() * W, -10, { count: 6, spread: 0.6, angle: Math.PI / 2, power: 3 });
      if (performance.now() < end) setTimeout(drop, 90);
    })();
  }
  function explode(x, y) {
    const col = pick(COLORS), col2 = pick(COLORS);
    const n = 70;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 6.283 + Math.random() * 0.2;
      const v = 1.5 + Math.random() * 5;
      parts.push({ k: 's', x, y, px: x, py: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 0.055, drag: 0.972, col: i % 3 ? col : col2, life: 0, max: 55 + Math.random() * 35, size: 1.6 + Math.random() * 1.6 });
    }
    start();
  }
  function firework(n = 1) {
    for (let i = 0; i < n; i++) {
      setTimeout(() => {
        parts.push({ k: 'r', x: W * (0.15 + Math.random() * 0.7), y: H + 5, vx: (Math.random() - 0.5) * 1.2, vy: -(10 + Math.random() * 3), target: H * (0.12 + Math.random() * 0.3) });
        Sound.sfx.whistle();
        start();
        setTimeout(Sound.sfx.boom, 900);
      }, i * 380);
    }
  }

  /* DOM floaters ---------------------------------------------------- */
  function floatUp(x, y, txt = '💗', { size = 26, dist = 120 } = {}) {
    const e = el('span', 'floater', txt);
    e.style.cssText = `left:${x}px;top:${y}px;font-size:${size}px;--dx:${rand(-40, 40)}px;--dy:${-dist}px`;
    document.body.appendChild(e);
    e.addEventListener('animationend', () => e.remove());
  }
  function heartBurst(x, y, n = 8, set = ['💗', '💖', '✨', '🌸', '💕']) {
    for (let i = 0; i < n; i++) floatUp(x + rand(-20, 20), y + rand(-10, 10), pick(set), { size: rand(16, 32), dist: rand(80, 190) });
  }

  /* Sparkle cursor trail --------------------------------------------- */
  let lastT = 0;
  window.addEventListener('pointermove', (e) => {
    const t = performance.now();
    if (t - lastT < 55) return;
    lastT = t;
    const s = el('span', 'trail', pick(['✦', '✧', '♥', '✨']));
    s.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;color:${pick(['#ff4d94', '#ffd27a', '#fff', '#d9b8ff'])};font-size:${rand(9, 18)}px`;
    document.body.appendChild(s);
    s.addEventListener('animationend', () => s.remove());
  }, { passive: true });

  /* Background floating hearts --------------------------------------- */
  function bgHearts() {
    const box = $('.bg-hearts');
    const set = ['💗', '💕', '🌸', '✨', '🎀', '💖', '🌷'];
    for (let i = 0; i < 16; i++) {
      const s = el('span', 'bgh', pick(set));
      s.style.cssText = `left:${rand(0, 100)}%;font-size:${rand(14, 34)}px;animation-duration:${rand(14, 28)}s;animation-delay:${-rand(0, 28)}s;opacity:${rand(0.25, 0.6)}`;
      box.appendChild(s);
    }
  }

  return { confetti, cannons, rain, firework, floatUp, heartBurst, bgHearts, get W() { return W; }, get H() { return H; } };
})();

/* =====================================================================
   Cute characters (original SVG): Teddy (him) and Bunny (her)
   ===================================================================== */
const Chars = {
  bear({ hat = true, heart = true } = {}) {
    return `<svg class="char bear" viewBox="0 -24 200 250" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="100" cy="222" rx="62" ry="7" fill="rgba(120,20,70,.15)"/>
    <circle cx="55" cy="45" r="24" fill="#d99a6c"/><circle cx="55" cy="45" r="13" fill="#ffb8cf"/>
    <circle cx="145" cy="45" r="24" fill="#d99a6c"/><circle cx="145" cy="45" r="13" fill="#ffb8cf"/>
    <g class="arm l"><ellipse cx="52" cy="150" rx="14" ry="27" transform="rotate(25 52 150)" fill="#e6ad80"/></g>
    <ellipse cx="70" cy="208" rx="22" ry="12" fill="#d99a6c"/><ellipse cx="130" cy="208" rx="22" ry="12" fill="#d99a6c"/>
    <ellipse cx="100" cy="165" rx="52" ry="48" fill="#e6ad80"/>
    <ellipse cx="100" cy="172" rx="33" ry="32" fill="#ffe3cc"/>
    ${heart ? `<path class="held" d="M100 176 c-15 -16 -34 0 -17 15 l17 15 l17 -15 c17 -15 -2 -31 -17 -15z" fill="#ff4d94"/>` : ''}
    <g class="arm r"><ellipse cx="148" cy="150" rx="14" ry="27" transform="rotate(-25 148 150)" fill="#e6ad80"/></g>
    <circle cx="100" cy="85" r="52" fill="#e6ad80"/>
    <ellipse cx="100" cy="102" rx="25" ry="19" fill="#ffe3cc"/>
    <g class="eyes"><circle cx="80" cy="78" r="6.5" fill="#4a2030"/><circle cx="120" cy="78" r="6.5" fill="#4a2030"/>
    <circle cx="82" cy="76" r="2.2" fill="#fff"/><circle cx="122" cy="76" r="2.2" fill="#fff"/></g>
    <ellipse cx="100" cy="96" rx="7.5" ry="5.5" fill="#4a2030"/>
    <path d="M91 106 Q100 115 109 106" stroke="#4a2030" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="66" cy="97" r="9" fill="#ff9fc6" opacity=".65"/><circle cx="134" cy="97" r="9" fill="#ff9fc6" opacity=".65"/>
    ${hat ? `<g class="hat"><path d="M70 46 L100 -14 L130 46 Z" fill="#ff74ad"/>
      <path d="M79 30 L121 30 L116 40 L84 40 Z" fill="#fff" opacity=".55"/>
      <circle cx="100" cy="-15" r="8" fill="#ffd27a"/>
      <circle cx="90" cy="14" r="3.5" fill="#fff"/><circle cx="108" cy="8" r="3.5" fill="#ffd27a"/></g>` : ''}
    </svg>`;
  },
  bunny({ bow = true, heart = true } = {}) {
    return `<svg class="char bunny" viewBox="0 -44 200 270" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="100" cy="222" rx="62" ry="7" fill="rgba(120,20,70,.15)"/>
    <g class="ear l"><ellipse cx="70" cy="14" rx="17" ry="46" fill="#fff"/><ellipse cx="70" cy="18" rx="8" ry="32" fill="#ffb8cf"/></g>
    <g class="ear r"><ellipse cx="130" cy="14" rx="17" ry="46" fill="#fff"/><ellipse cx="130" cy="18" rx="8" ry="32" fill="#ffb8cf"/></g>
    <g class="arm l"><ellipse cx="54" cy="152" rx="13" ry="26" transform="rotate(25 54 152)" fill="#fff"/></g>
    <ellipse cx="72" cy="208" rx="22" ry="12" fill="#ffe6f0"/><ellipse cx="128" cy="208" rx="22" ry="12" fill="#ffe6f0"/>
    <ellipse cx="100" cy="165" rx="48" ry="46" fill="#fff"/>
    <ellipse cx="100" cy="172" rx="30" ry="30" fill="#ffe0ee"/>
    ${heart ? `<path class="held" d="M100 176 c-14 -15 -32 0 -16 14 l16 14 l16 -14 c16 -14 -2 -29 -16 -14z" fill="#ff4d94"/>` : ''}
    <g class="arm r"><ellipse cx="146" cy="152" rx="13" ry="26" transform="rotate(-25 146 152)" fill="#fff"/></g>
    <circle cx="100" cy="88" r="50" fill="#fff"/>
    <g class="eyes"><circle cx="80" cy="84" r="6.5" fill="#4a2030"/><circle cx="120" cy="84" r="6.5" fill="#4a2030"/>
    <circle cx="82" cy="82" r="2.2" fill="#fff"/><circle cx="122" cy="82" r="2.2" fill="#fff"/></g>
    <path d="M94 98 L106 98 L100 106 Z" fill="#ff74ad"/>
    <path d="M100 106 L100 111 M100 111 Q93 118 87 112 M100 111 Q107 118 113 112" stroke="#4a2030" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <circle cx="64" cy="102" r="9.5" fill="#ff9fc6" opacity=".7"/><circle cx="136" cy="102" r="9.5" fill="#ff9fc6" opacity=".7"/>
    ${bow ? `<g class="bow"><path d="M138 52 L162 40 L162 66 Z" fill="#ff4d94"/><path d="M138 52 L114 40 L114 66 Z" fill="#ff4d94"/><circle cx="138" cy="53" r="7" fill="#ff74ad"/></g>` : ''}
    </svg>`;
  }
};
