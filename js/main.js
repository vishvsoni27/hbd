/* =====================================================================
   App: scene manager, navigation dots, mute button
   Dev shortcuts:  ?all=1  -> saare pages unlock     ?s=cake -> seedha us page se start
   ===================================================================== */
const App = {
  order: ['intro', 'welcome', 'decor', 'cake', 'story', 'gallery', 'games', 'letter', 'party'],
  names: { welcome: 'Welcome', decor: 'Decoration', cake: 'Cake', story: 'Kahani', gallery: 'Photos', games: 'Games', letter: 'Letter', party: 'Party' },
  current: null, busy: false, visited: new Set(['intro']),
  params: new URLSearchParams(location.search),

  init() {
    $$('[data-t]').forEach((n) => { n.innerHTML = T(n.innerHTML); });
    document.title = `Happy Birthday ${CONFIG.name} 🎀`;
    Fx.bgHearts();
    // dots
    const dots = $('#dots');
    this.order.slice(1).forEach((id) => {
      const d = el('button', 'dot locked'); d.dataset.id = id; d.title = this.names[id]; d.setAttribute('aria-label', this.names[id]);
      d.addEventListener('click', () => { Sound.sfx.click(); this.go(id); });
      dots.appendChild(d);
    });
    // mute
    $('#mute').addEventListener('click', () => { const m = Sound.toggleMute(); $('#mute').textContent = m ? '🔇' : '🔊'; if (!Sound.ctx) Sound.init(); });
    // flow buttons
    const flow = { welcomeNext: 'decor', decorNext: 'cake', cakeNext: 'story', storyNext: 'gallery', galleryNext: 'games', gamesNext: 'letter', letterNext: 'party' };
    Object.entries(flow).forEach(([btn, to]) => $('#' + btn).addEventListener('click', () => { Sound.sfx.click(); this.go(to); }));
    // $('#welcome') bubble: tap to skip typing
    $('#bubble').addEventListener('click', () => { Scenes.welcome.skip = true; });
    // first gesture => audio context
    window.addEventListener('pointerdown', () => {
      Sound.init();
      if (this.current && this.current !== 'intro' && this.current !== 'party') Sound.startBgm();
    }, { once: true });
    // start
    const s = this.params.get('s');
    if (this.params.get('all') === '1' || s) this.order.forEach((id) => this.visited.add(id));
    this.go(s && Scenes[s] ? s : 'intro');
  },

  go(id) {
    if (this.busy || id === this.current || !Scenes[id]) return;
    this.busy = true;
    const prevId = this.current;
    const prev = prevId ? $('#' + prevId) : null;
    const next = $('#' + id);
    if (prev) { prev.classList.remove('active'); prev.classList.add('leaving'); Scenes[prevId].exit && Scenes[prevId].exit(); }
    this.current = id; this.visited.add(id);
    next.scrollTop = 0;
    Scenes[id].enter();
    if (prevId) Sound.sfx.whoosh();
    if (Sound.ctx && id !== 'intro' && id !== 'party') Sound.startBgm();
    void next.offsetWidth;
    next.classList.add('active');
    this.updateNav();
    setTimeout(() => { if (prev) prev.classList.remove('leaving'); this.busy = false; }, 1100);
  },

  updateNav() {
    const show = this.current !== 'intro';
    $('#dots').hidden = !show; $('#mute').hidden = !show;
    $$('.dot').forEach((d) => {
      d.classList.toggle('on', d.dataset.id === this.current);
      d.classList.toggle('locked', !this.visited.has(d.dataset.id));
    });
  }
};

window.addEventListener('DOMContentLoaded', () => App.init());
