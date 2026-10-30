/* =====================================================================
   Sound engine — sab kuch Web Audio se generate hota hai (koi mp3 nahi chahiye).
   - bgm: slow, emotional music-box + pad (Pachelbel "Canon in D" progression, public domain)
   - birthday: Happy Birthday tune music-box waltz style
   - party: upbeat dance loop
   - sfx: pop, sparkle, blow, cut, fanfare ...
   Agar music/bgm.mp3 ya music/party.mp3 mil jaaye to wahi use hoti hai.
   ===================================================================== */
const Sound = (() => {
  let ctx, master, bgmBus, sfxBus, partyBus, reverb, wet, comp;
  let muted = false;
  let started = false;
  const custom = { bgm: null, party: null }; // HTMLAudio if file mila
  const NOTE = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
  const midi = (n) => { const m = /^([A-G]#?)(\d)$/.exec(n); return 12 * (+m[2] + 1) + NOTE[m[1]]; };
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  /* ------------------------------ setup ------------------------------ */
  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 3.5; comp.attack.value = 0.01; comp.release.value = 0.25;
    master = ctx.createGain(); master.gain.value = muted ? 0 : 0.9;
    master.connect(comp); comp.connect(ctx.destination);
    bgmBus = ctx.createGain(); bgmBus.gain.value = 0; bgmBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.gain.value = 0.8; sfxBus.connect(master);
    partyBus = ctx.createGain(); partyBus.gain.value = 0; partyBus.connect(master);
    reverb = ctx.createConvolver(); reverb.buffer = impulse(3.2, 2.4);
    wet = ctx.createGain(); wet.gain.value = 0.42;
    wet.connect(reverb); reverb.connect(master);
    started = true;
    // custom files (optional)
    tryCustom('bgm'); tryCustom('party');
    document.addEventListener('visibilitychange', () => {
      if (!ctx) return;
      if (document.hidden) ctx.suspend(); else if (!muted) ctx.resume();
    });
  }
  function impulse(sec, decay) {
    const len = Math.floor(ctx.sampleRate * sec);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }
  function tryCustom(kind) {
    const src = (typeof CONFIG !== 'undefined' && CONFIG.music && CONFIG.music[kind]) || null;
    if (!src) return;
    const a = new Audio();
    a.loop = true; a.preload = 'auto'; a.volume = 0;
    a.addEventListener('canplaythrough', () => { custom[kind] = a; if (kind === 'bgm' && bgmWanted) startBgm(); if (kind === 'party' && partyWanted) startParty(); }, { once: true });
    a.addEventListener('error', () => { custom[kind] = null; }, { once: true });
    a.src = src;
  }

  /* ---------------------------- primitives --------------------------- */
  let noiseBuffer;
  function noiseBuf() {
    if (noiseBuffer) return noiseBuffer;
    const len = ctx.sampleRate * 2;
    noiseBuffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuffer.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuffer;
  }
  function pluck(dest, m, t, dur = 1.8, vol = 0.16, send = 0.6) {
    const f = mtof(m);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(dest);
    if (send) { const s = ctx.createGain(); s.gain.value = send; g.connect(s); s.connect(wet); }
    [[1, 1], [2, 0.3], [3, 0.1], [4.02, 0.04]].forEach(([mul, amp], i) => {
      const o = ctx.createOscillator();
      o.type = 'sine'; o.frequency.value = f * mul;
      const og = ctx.createGain(); og.gain.value = amp;
      // higher partials die faster => bell/music-box feel
      if (i > 0) { og.gain.setValueAtTime(amp, t); og.gain.exponentialRampToValueAtTime(0.0001, t + dur * (0.55 / i + 0.1)); }
      o.connect(og); og.connect(g);
      o.start(t); o.stop(t + dur + 0.05);
    });
  }
  function pad(dest, ms, t, dur, vol = 0.045) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 1.2);
    g.gain.setValueAtTime(vol, t + dur - 1.4);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100;
    lp.connect(g); g.connect(dest);
    const s = ctx.createGain(); s.gain.value = 0.5; g.connect(s); s.connect(wet);
    ms.forEach((m, i) => {
      const o = ctx.createOscillator(); o.type = i % 2 ? 'sine' : 'triangle';
      o.frequency.value = mtof(m); o.detune.value = (i - 1) * 6;
      o.connect(lp); o.start(t); o.stop(t + dur + 0.1);
    });
  }
  function noise(dest, t, dur, { type = 'bandpass', f = 1500, f2 = null, q = 1, vol = 0.3, attack = 0.004 } = {}) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf();
    s.loop = true;
    const filt = ctx.createBiquadFilter(); filt.type = type; filt.Q.value = q;
    filt.frequency.setValueAtTime(f, t);
    if (f2) filt.frequency.exponentialRampToValueAtTime(f2, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(filt); filt.connect(g); g.connect(dest);
    s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }
  function tone(dest, t, f, f2, dur, { type = 'sine', vol = 0.3 } = {}) {
    const o = ctx.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + dur + 0.05);
  }
  const now = () => ctx.currentTime;

  /* ------------------------ emotional background ---------------------- */
  // Canon-in-D style progression: D A Bm F#m G D G A
  const PROG = [
    { bass: 'D3',  arp: ['D4', 'F#4', 'A4'],  pad: ['D3', 'A3', 'F#4'] },
    { bass: 'A2',  arp: ['A3', 'C#4', 'E4'],  pad: ['A2', 'E3', 'C#4'] },
    { bass: 'B2',  arp: ['B3', 'D4', 'F#4'],  pad: ['B2', 'F#3', 'D4'] },
    { bass: 'F#2', arp: ['F#3', 'A3', 'C#4'], pad: ['F#2', 'C#3', 'A3'] },
    { bass: 'G2',  arp: ['G3', 'B3', 'D4'],   pad: ['G2', 'D3', 'B3'] },
    { bass: 'D3',  arp: ['D4', 'F#4', 'A4'],  pad: ['D3', 'A3', 'F#4'] },
    { bass: 'G2',  arp: ['G3', 'B3', 'D4'],   pad: ['G2', 'D3', 'B3'] },
    { bass: 'A2',  arp: ['A3', 'C#4', 'E4'],  pad: ['A2', 'E3', 'C#4'] }
  ];
  const MELODY = ['F#5', 'E5', 'D5', 'C#5', 'B4', 'A4', 'B4', 'C#5'];
  const ARP_PATTERN = [null, 0, 1, 2, 1, 2, 1, 0]; // step 0 = bass
  const BGM_BPM = 64, EIGHTH = 60 / BGM_BPM / 2;
  let bgmTimer = null, bgmNext = 0, bgmStep = 0, bgmBar = 0, bgmWanted = false, bgmLevel = 0.55;

  function bgmStepPlay(step, bar, t) {
    const chord = PROG[bar % 8];
    const second = bar >= 8;
    if (step === 0) {
      pluck(bgmBus, midi(chord.bass), t, 3.4, 0.22, 0.4);
      pad(bgmBus, chord.pad.map(midi), t, EIGHTH * 8 + 0.8, 0.04);
    }
    const idx = ARP_PATTERN[step];
    if (idx !== null) pluck(bgmBus, midi(chord.arp[idx]), t, 2.2, 0.1, 0.7);
    const mel = midi(MELODY[bar % 8]);
    if (!second) {
      if (step === 0) pluck(bgmBus, mel, t, 4.2, 0.17, 0.9);
      if (step === 4) pluck(bgmBus, mel + 12, t, 2.2, 0.05, 0.9);
    } else {
      if (step === 0) pluck(bgmBus, mel + 12, t, 3.2, 0.12, 1);
      if (step === 3) pluck(bgmBus, mel, t, 2.8, 0.1, 0.9);
      if (step === 6) pluck(bgmBus, mel + 7, t, 2.4, 0.07, 1);
    }
  }
  function bgmSchedule() {
    while (bgmNext < now() + 0.5) {
      bgmStepPlay(bgmStep, bgmBar, bgmNext);
      bgmNext += EIGHTH;
      if (++bgmStep === 8) { bgmStep = 0; bgmBar = (bgmBar + 1) % 16; }
    }
  }
  function startBgm() {
    bgmWanted = true;
    if (!ctx) return;
    if (partyOn) return;
    if (custom.bgm) {
      stopSynthBgm();
      custom.bgm.play().catch(() => {});
      fadeCustom(custom.bgm, bgmLevel);
      return;
    }
    if (bgmTimer) return;
    bgmNext = now() + 0.15; bgmStep = 0; bgmBar = 0;
    bgmBus.gain.cancelScheduledValues(now());
    bgmBus.gain.setValueAtTime(bgmBus.gain.value, now());
    bgmBus.gain.linearRampToValueAtTime(bgmLevel, now() + 3);
    bgmTimer = setInterval(bgmSchedule, 120);
    bgmSchedule();
  }
  function stopSynthBgm() {
    if (!bgmTimer) return;
    clearInterval(bgmTimer); bgmTimer = null;
  }
  function stopBgm(fade = 1.2) {
    bgmWanted = false;
    if (!ctx) return;
    if (custom.bgm) { fadeCustom(custom.bgm, 0, () => custom.bgm.pause()); }
    bgmBus.gain.cancelScheduledValues(now());
    bgmBus.gain.setValueAtTime(bgmBus.gain.value, now());
    bgmBus.gain.linearRampToValueAtTime(0, now() + fade);
    const tm = bgmTimer; bgmTimer = null;
    setTimeout(() => { if (tm) clearInterval(tm); }, fade * 1000 + 200);
  }
  function setBgmLevel(v, secs = 0.8) {
    bgmLevel = v;
    if (!ctx) return;
    if (custom.bgm && !partyOn) fadeCustom(custom.bgm, v);
    if (bgmTimer) {
      bgmBus.gain.cancelScheduledValues(now());
      bgmBus.gain.setValueAtTime(bgmBus.gain.value, now());
      bgmBus.gain.linearRampToValueAtTime(v, now() + secs);
    }
  }
  function fadeCustom(a, to, done) {
    const from = a.volume; const steps = 20; let i = 0;
    const id = setInterval(() => {
      i++; a.volume = Math.max(0, Math.min(1, from + (to - from) * (i / steps)));
      if (i >= steps) { clearInterval(id); done && done(); }
    }, 40);
  }

  /* --------------------------- happy birthday ------------------------- */
  // 3/4 music-box waltz, transposed to D major so it sits with the bgm
  const HB = [
    ['G4', .75], ['G4', .25], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 2],
    ['G4', .75], ['G4', .25], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 2],
    ['G4', .75], ['G4', .25], ['G5', 1], ['E5', 1], ['C5', 1], ['B4', 1], ['A4', 1],
    ['F5', .75], ['F5', .25], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 2]
  ];
  const HB_BASS = [['D3', ['D4', 'F#4', 'A4']], ['A2', ['C#4', 'E4', 'A4']], ['A2', ['C#4', 'E4', 'A4']], ['D3', ['D4', 'F#4', 'A4']],
                   ['D3', ['D4', 'F#4', 'A4']], ['G2', ['B3', 'D4', 'G4']], ['G2', ['B3', 'D4', 'G4']], ['D3', ['D4', 'F#4', 'A4']]];
  function playBirthday() {
    if (!ctx) return 0;
    const beat = 0.5, T0 = now() + 0.2, tr = 2;
    const prev = 0.55;
    setBgmLevel(0.12, 0.4);
    if (custom.bgm) fadeCustom(custom.bgm, 0.08);
    let b = 0;
    HB.forEach(([n, d]) => { pluck(sfxBus, midi(n) + tr, T0 + b * beat, 1.5, 0.2, 0.7); b += d; });
    HB_BASS.forEach(([root, ch], i) => {
      const t = T0 + i * 3 * beat;
      pluck(sfxBus, midi(root), t, 1.6, 0.22, 0.4);
      ch.forEach((c) => { pluck(sfxBus, midi(c), t + beat, 1, 0.06, 0.5); pluck(sfxBus, midi(c), t + 2 * beat, 1, 0.05, 0.5); });
    });
    const total = b * beat;
    setTimeout(() => { if (!partyOn) setBgmLevel(prev, 2); }, (total + 1.5) * 1000);
    return total;
  }

  /* ------------------------------ party music ------------------------- */
  const PARTY_BPM = 116, S16 = 60 / PARTY_BPM / 4;
  const P_CHORDS = [
    { root: 'C2', tri: ['C4', 'E4', 'G4'], lead: ['E5', 'G5', 'E5', 'C5', 'E5', 'G5', 'A5', 'G5'] },
    { root: 'G2', tri: ['B3', 'D4', 'G4'], lead: ['D5', 'G5', 'B5', 'G5', 'D5', 'G5', 'B5', 'A5'] },
    { root: 'A2', tri: ['C4', 'E4', 'A4'], lead: ['C5', 'E5', 'A5', 'E5', 'C5', 'E5', 'A5', 'G5'] },
    { root: 'F2', tri: ['A3', 'C4', 'F4'], lead: ['A4', 'C5', 'F5', 'C5', 'A4', 'C5', 'F5', 'E5'] }
  ];
  let partyTimer = null, pNext = 0, pStep = 0, pBar = 0, partyOn = false, partyWanted = false;
  function partyStepPlay(step, bar, t) {
    const ch = P_CHORDS[bar % 4];
    if (step % 4 === 0) { tone(partyBus, t, 160, 42, 0.22, { vol: 0.9 }); }
    if (step === 4 || step === 12) {
      noise(partyBus, t, 0.14, { type: 'bandpass', f: 1800, q: 0.8, vol: 0.35 });
      noise(partyBus, t + 0.012, 0.1, { type: 'bandpass', f: 2400, q: 0.8, vol: 0.2 });
    }
    if (step % 2 === 0) noise(partyBus, t + (step % 4 === 2 ? 0 : 0), step % 4 === 2 ? 0.09 : 0.04, { type: 'highpass', f: 7500, vol: step % 4 === 2 ? 0.22 : 0.1 });
    if ([0, 3, 6, 8, 11, 14].includes(step)) {
      const o = ctx.createOscillator(); o.type = 'sawtooth';
      const m = midi(ch.root) + (step === 6 || step === 14 ? 12 : 0);
      o.frequency.value = mtof(m);
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(700, t); lp.frequency.exponentialRampToValueAtTime(180, t + 0.22);
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.34, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
      o.connect(lp); lp.connect(g); g.connect(partyBus); o.start(t); o.stop(t + 0.3);
    }
    if ([0, 6, 10].includes(step)) ch.tri.forEach((n) => pluck(partyBus, midi(n), t, 0.5, 0.06, 0.25));
    if (step % 2 === 0) {
      const n = ch.lead[step / 2];
      const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = mtof(midi(n));
      const o2 = ctx.createOscillator(); o2.type = 'square'; o2.frequency.value = mtof(midi(n)); o2.detune.value = 7;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
      const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + S16 * 3.2);
      const g2 = ctx.createGain(); g2.gain.value = 0.25;
      o.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g); g.connect(partyBus);
      const s = ctx.createGain(); s.gain.value = 0.3; g.connect(s); s.connect(wet);
      o.start(t); o2.start(t); o.stop(t + S16 * 3.4); o2.stop(t + S16 * 3.4);
    }
  }
  function partySchedule() {
    while (pNext < now() + 0.3) {
      partyStepPlay(pStep, pBar, pNext);
      pNext += S16;
      if (++pStep === 16) { pStep = 0; pBar = (pBar + 1) % 4; }
    }
  }
  function startParty() {
    partyWanted = true;
    if (!ctx) return;
    // bgm out
    if (custom.bgm) fadeCustom(custom.bgm, 0, () => custom.bgm.pause());
    bgmBus.gain.cancelScheduledValues(now());
    bgmBus.gain.setValueAtTime(bgmBus.gain.value, now());
    bgmBus.gain.linearRampToValueAtTime(0, now() + 1.2);
    stopSynthBgm();
    partyOn = true;
    if (custom.party) { custom.party.play().catch(() => {}); fadeCustom(custom.party, 0.85); return; }
    if (partyTimer) return;
    pNext = now() + 0.2; pStep = 0; pBar = 0;
    partyBus.gain.cancelScheduledValues(now());
    partyBus.gain.setValueAtTime(partyBus.gain.value, now());
    partyBus.gain.linearRampToValueAtTime(0.75, now() + 1);
    partyTimer = setInterval(partySchedule, 60);
    partySchedule();
  }
  function stopParty(resumeBgm = true) {
    partyWanted = false;
    if (!ctx) return;
    partyOn = false;
    if (custom.party) fadeCustom(custom.party, 0, () => custom.party.pause());
    partyBus.gain.cancelScheduledValues(now());
    partyBus.gain.setValueAtTime(partyBus.gain.value, now());
    partyBus.gain.linearRampToValueAtTime(0, now() + 0.8);
    const tm = partyTimer; partyTimer = null;
    setTimeout(() => { if (tm) clearInterval(tm); }, 1000);
    if (resumeBgm && bgmWanted) setTimeout(startBgm, 600);
  }
  const isPartyOn = () => partyOn;

  /* ------------------------------ sfx -------------------------------- */
  const sfx = {
    click() { if (!ctx) return; tone(sfxBus, now(), 900, 1400, 0.06, { type: 'sine', vol: 0.15 }); },
    pop() {
      if (!ctx) return; const t = now();
      noise(sfxBus, t, 0.1, { type: 'bandpass', f: 1400, f2: 500, q: 0.7, vol: 0.55 });
      tone(sfxBus, t, 260, 60, 0.12, { vol: 0.4 });
    },
    sparkle() {
      if (!ctx) return; const t = now(); const sc = [84, 88, 91, 95, 100];
      for (let i = 0; i < 3; i++) pluck(sfxBus, pick(sc) , t + i * 0.07, 0.8, 0.07, 0.8);
    },
    ding(n = 0) { if (!ctx) return; pluck(sfxBus, 79 + n * 2, now(), 1.2, 0.16, 0.8); },
    whoosh() { if (!ctx) return; noise(sfxBus, now(), 0.7, { type: 'bandpass', f: 300, f2: 2800, q: 0.9, vol: 0.28, attack: 0.25 }); },
    blow() { if (!ctx) return; noise(sfxBus, now(), 0.5, { type: 'lowpass', f: 900, f2: 400, q: 0.6, vol: 0.4, attack: 0.1 }); },
    puff() { if (!ctx) return; noise(sfxBus, now(), 0.18, { type: 'bandpass', f: 700, f2: 300, q: 0.8, vol: 0.2 }); },
    switchOn() {
      if (!ctx) return; const t = now();
      noise(sfxBus, t, 0.04, { type: 'highpass', f: 3500, vol: 0.5 });
      noise(sfxBus, t + 0.09, 0.05, { type: 'highpass', f: 2500, vol: 0.4 });
      [72, 76, 79, 84, 88].forEach((m, i) => pluck(sfxBus, m, t + 0.25 + i * 0.09, 1.4, 0.1, 0.8));
    },
    flip() { if (!ctx) return; noise(sfxBus, now(), 0.08, { type: 'highpass', f: 2800, f2: 5500, vol: 0.25 }); },
    cut() {
      if (!ctx) return; const t = now();
      noise(sfxBus, t, 0.35, { type: 'highpass', f: 3000, f2: 9000, vol: 0.45, attack: 0.05 });
      tone(sfxBus, t + 0.35, 180, 70, 0.18, { vol: 0.35 });
    },
    match() { if (!ctx) return; pluck(sfxBus, 84, now(), 1, 0.14, 0.7); pluck(sfxBus, 91, now() + 0.1, 1.2, 0.14, 0.7); },
    wrong() { if (!ctx) return; tone(sfxBus, now(), 220, 140, 0.18, { type: 'triangle', vol: 0.18 }); },
    catchHeart() { if (!ctx) return; pluck(sfxBus, 88 + Math.floor(Math.random() * 4), now(), 0.5, 0.12, 0.5); },
    ouch() { if (!ctx) return; tone(sfxBus, now(), 300, 90, 0.25, { type: 'sawtooth', vol: 0.12 }); },
    fanfare() {
      if (!ctx) return; const t = now();
      [72, 76, 79, 84, 79, 84, 88, 91].forEach((m, i) => pluck(sfxBus, m, t + i * 0.1, 1.6, 0.15, 0.8));
    },
    tick() { if (!ctx) return; noise(sfxBus, now(), 0.025, { type: 'bandpass', f: 4200, q: 3, vol: 0.12 }); },
    boom() {
      if (!ctx) return; const t = now();
      tone(sfxBus, t, 120, 40, 0.3, { vol: 0.5 });
      noise(sfxBus, t, 0.5, { type: 'lowpass', f: 2500, f2: 300, vol: 0.4 });
    },
    whistle() { if (!ctx) return; tone(sfxBus, now(), 600, 2200, 0.5, { type: 'sine', vol: 0.08 }); },
    scratch() { if (!ctx) return; noise(sfxBus, now(), 0.06, { type: 'bandpass', f: 3500, q: 1.5, vol: 0.1 }); }
  };

  /* ------------------------------ mute -------------------------------- */
  function setMuted(m) {
    muted = m;
    if (!ctx) return;
    master.gain.cancelScheduledValues(now());
    master.gain.setTargetAtTime(m ? 0 : 0.9, now(), 0.05);
    [custom.bgm, custom.party].forEach((a) => { if (a) a.muted = m; });
    if (!m && ctx.state === 'suspended') ctx.resume();
  }
  const toggleMute = () => { setMuted(!muted); return muted; };

  return { init, sfx, startBgm, stopBgm, setBgmLevel, playBirthday, startParty, stopParty, isPartyOn, toggleMute, setMuted,
           get ctx() { return ctx; }, get muted() { return muted; } };
})();
