/* Blurpest — animazioni (GSAP 3 + ScrollTrigger, SplitText, ScrambleText, Flip, Draggable, Inertia, CustomEase)
   Demo di IkodaI Studio. Tutto si spegne se il dispositivo chiede movimento ridotto. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = matchMedia('(pointer: coarse)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- orologio ---------- */
  var clock = $('#clock');
  function tick() {
    var d = new Date();
    clock.textContent = [d.getHours(), d.getMinutes(), d.getSeconds()].map(function (n) { return String(n).padStart(2, '0'); }).join(':');
  }
  tick(); setInterval(tick, 1000);

  /* ---------- menu (versione base, senza animazioni) ---------- */
  var menu = $('#menu'), menuBtn = $('#menuBtn');
  var menuOpen = false, openMenu, closeMenu;
  openMenu = function () { menu.hidden = false; menuOpen = true; menuBtn.setAttribute('aria-expanded', 'true'); menuBtn.textContent = 'CHIUDI'; $('a', menu).focus({ preventScroll: true }); };
  closeMenu = function () { menu.hidden = true; menuOpen = false; menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.textContent = 'MENU'; };
  menuBtn.addEventListener('click', function () { menuOpen ? closeMenu() : openMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen) { closeMenu(); menuBtn.focus(); } });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { closeMenu(); }); });

  if (reduce || !window.gsap || !window.ScrollTrigger || !window.SplitText) { root.classList.remove('js'); window.__blurp = true; return; }
  window.__blurp = true;

  gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, Flip, Draggable, InertiaPlugin, CustomEase);
  ScrollTrigger.config({ ignoreMobileResize: true });
  CustomEase.create('slam', 'M0,0 C0.08,0.82 0.18,1.12 0.42,1.04 0.64,0.96 0.78,1 1,1');
  var R = gsap.utils.random;
  var GLYPHS = 'BLURPEST#*▲●■✶/\\';
  var css = getComputedStyle(root);
  var C = { paper: css.getPropertyValue('--paper').trim(), ink: css.getPropertyValue('--ink').trim(), blurp: css.getPropertyValue('--blurp').trim(), signal: css.getPropertyValue('--signal').trim() };

  /* Il menu animato sostituisce quello base */
  openMenu = function () {
    menu.hidden = false; menuOpen = true;
    menuBtn.setAttribute('aria-expanded', 'true');
    gsap.to(menuBtn, { scrambleText: { text: 'CHIUDI', chars: GLYPHS }, duration: .4 });
    var b = menuBtn.getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + b.height / 2;
    var r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    gsap.fromTo(menu, { clipPath: 'circle(0px at ' + x + 'px ' + y + 'px)' }, { clipPath: 'circle(' + r + 'px at ' + x + 'px ' + y + 'px)', duration: .8, ease: 'expo.inOut' });
    gsap.fromTo($$('.menu a'), { yPercent: 120, rotation: function () { return R(-25, 25); } }, { yPercent: 0, rotation: 0, duration: .9, ease: 'slam', stagger: .06, delay: .25 });
    $('a', menu).focus({ preventScroll: true });
  };
  closeMenu = function () {
    menuOpen = false;
    menuBtn.setAttribute('aria-expanded', 'false');
    gsap.to(menuBtn, { scrambleText: { text: 'MENU', chars: GLYPHS }, duration: .4 });
    var b = menuBtn.getBoundingClientRect(), x = b.left + b.width / 2, y = b.top + b.height / 2;
    gsap.to(menu, { clipPath: 'circle(0px at ' + x + 'px ' + y + 'px)', duration: .6, ease: 'expo.inOut', onComplete: function () { menu.hidden = true; } });
  };

  /* ---------- cursore (solo mouse) ---------- */
  if (!coarse) {
    var cur = $('#cursor');
    var cx = gsap.quickTo(cur, 'x', { duration: .35, ease: 'power3' }), cy = gsap.quickTo(cur, 'y', { duration: .35, ease: 'power3' });
    addEventListener('pointermove', function (e) { cx(e.clientX); cy(e.clientY); });
    $$('a, button, .srv, .stk, .fb').forEach(function (el) {
      el.addEventListener('pointerenter', function () { gsap.to(cur, { scale: 2.6, duration: .3 }); });
      el.addEventListener('pointerleave', function () { gsap.to(cur, { scale: 1, duration: .3 }); });
    });
  }

  function start() {
    /* ---------- divisioni del testo ---------- */
    var heroSplit = SplitText.create('.hero__line', { type: 'chars', charsClass: 'ch', aria: 'none' });
    var chars = heroSplit.chars;
    gsap.set(chars, { '--w': 100, '--g': 900 });

    /* ---------- caricamento ---------- */
    var num = { v: 0 }, numEl = $('#loaderNum');
    var tl = gsap.timeline();
    tl.to(num, { v: 100, duration: 1.4, ease: 'power3.inOut', onUpdate: function () { numEl.textContent = String(Math.round(num.v)).padStart(3, '0'); } })
      .to(numEl, { scrambleText: { text: 'GO', chars: '█▓▒░#*' }, duration: .3 })
      .to('.loader__num, .loader__label', { yPercent: -140, rotation: -12, duration: .45, ease: 'power3.in' })
      .to('.loader__cols i', { yPercent: -101, duration: .8, ease: 'expo.inOut', stagger: { each: .06, from: 'random' } }, '-=.2')
      .set('#loader', { display: 'none' })
      .add(heroIntro(), '-=.55');

    function heroIntro() {
      var t = gsap.timeline();
      t.fromTo(chars, {
        x: function () { return R(-innerWidth * .7, innerWidth * .7); },
        y: function () { return R(-innerHeight * .7, innerHeight * .5); },
        rotation: function () { return R(-200, 200); },
        scale: function () { return R(.2, 2.8); },
        '--w': 62, '--g': 100
      }, {
        x: 0, y: 0, rotation: 0, scale: 1, '--w': 100, '--g': 900,
        duration: 1.3, ease: 'expo.out', stagger: { each: .05, from: 'random' }
      })
        .from('.shape', { scale: 0, rotation: function () { return R(-180, 180); }, duration: 1, ease: 'slam', stagger: .1 }, .2)
        .from('#sticker', { scale: 0, rotation: -540, duration: 1.2, ease: 'expo.out' }, .3)
        .from('.hero__sub', { yPercent: 60, opacity: 0, duration: .8, ease: 'power3.out' }, .6)
        .from('.hero__hint', { scaleX: 0, transformOrigin: '0 50%', duration: .5, ease: 'power3.inOut' }, .9)
        .add(heroLife);
      return t;
    }

    /* ---------- hero: lettere vive ---------- */
    function heroLife() {
      // onda continua sulla larghezza delle lettere
      gsap.to(chars, { '--w': 62, duration: 1.1, ease: 'sine.inOut', stagger: { each: .14, repeat: -1, yoyo: true } });
      // quadrato e cerchio che galleggiano
      gsap.to('.shape--sq', { y: -30, rotation: 18, duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to('.shape--ci', { y: 24, x: 16, duration: 2.8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to('.shape--bar', { scaleX: .55, transformOrigin: '100% 50%', duration: 1.6, ease: 'expo.inOut', yoyo: true, repeat: -1 });
      makeQ(); ready = true;
    }

    var hero = $('#hero');
    var qx = [], qy = [], qr = [], qg = [];
    function makeQ() {
      chars.forEach(function (c, i) {
        qx[i] = gsap.quickTo(c, 'x', { duration: .5, ease: 'power3' }); qy[i] = gsap.quickTo(c, 'y', { duration: .5, ease: 'power3' });
        qr[i] = gsap.quickTo(c, 'rotation', { duration: .5, ease: 'power3' }); qg[i] = gsap.quickTo(c, '--g', { duration: .4, ease: 'power2' });
      });
    }
    var ready = false;
    var pending = null, raf = 0;
    function push(px, py) {
      if (!ready) return;
      pending = [px, py];
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var p = pending, rad = Math.max(innerWidth, 500) * .32;
        chars.forEach(function (c, i) {
          var b = c.getBoundingClientRect();
          var ox = b.left + b.width / 2 - gsap.getProperty(c, 'x');
          var oy = b.top + b.height / 2 - gsap.getProperty(c, 'y');
          var dx = ox - p[0], dy = oy - p[1], d = Math.hypot(dx, dy) || 1;
          var f = Math.max(0, 1 - d / rad);
          f = f * f * (3 - 2 * f);
          qx[i](dx / d * f * 90); qy[i](dy / d * f * 90);
          qr[i]((dx > 0 ? 1 : -1) * f * 28); qg[i](900 - f * 800);
        });
      });
    }
    function release() {
      if (!ready) return;
      chars.forEach(function (c, i) { gsap.to(c, { x: 0, y: 0, rotation: 0, '--g': 900, duration: 1.4, ease: 'elastic.out(1, .3)', overwrite: 'auto' }); });
      // quickTo va ricreato dopo un tween che ha sovrascritto le stesse proprietà
      gsap.delayedCall(1.4, makeQ);
    }
    hero.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') push(e.clientX, e.clientY); });
    hero.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') release(); });
    hero.addEventListener('touchstart', function (e) { var t = e.touches[0]; push(t.clientX, t.clientY); }, { passive: true });
    hero.addEventListener('touchmove', function (e) { var t = e.touches[0]; push(t.clientX, t.clientY); }, { passive: true });
    hero.addEventListener('touchend', release, { passive: true });

    // uscita dalla hero: le due righe si separano, le forme scappano
    gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .6 } })
      .to('.hero__line:first-child', { xPercent: -45, ease: 'none' }, 0)
      .to('.hero__line--2', { xPercent: 35, ease: 'none' }, 0)
      .to('.shape--sq', { yPercent: -260, rotation: 200, ease: 'none' }, 0)
      .to('.shape--ci', { yPercent: 180, scale: 2, ease: 'none' }, 0)
      .to('.hero__grid', { scale: 1.6, rotation: 8, ease: 'none' }, 0);

    // adesivo rotante: accelera con lo scorrimento
    var spin = gsap.to('#sticker', { rotation: '+=360', duration: 10, ease: 'none', repeat: -1 });

    /* ---------- nastri e inclinazione legati alla velocità ---------- */
    var marquees = $$('.marquee').map(function (m, i) {
      var t = $('.marquee__track', m);
      t.innerHTML += t.innerHTML;
      var dir = i % 2 ? 1 : -1;
      return gsap.fromTo(t, { xPercent: dir < 0 ? 0 : -50 }, { xPercent: dir < 0 ? -50 : 0, duration: 22, ease: 'none', repeat: -1 });
    });
    $$('.marquees, .manifesto__text, .services__list, .lab__title, .flip').forEach(function (el) { el.classList.add('skewable'); });
    var skewTo = gsap.quickTo('.skewable', 'skewY', { duration: .6, ease: 'power3' });
    var clampSkew = gsap.utils.clamp(-14, 14);
    var settle;
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: function (self) {
        var v = self.getVelocity();
        skewTo(clampSkew(v / -220));
        clearTimeout(settle); settle = setTimeout(function () { skewTo(0); }, 90);
        var boost = self.direction * (1 + Math.min(Math.abs(v) / 180, 9));
        marquees.forEach(function (m) {
          gsap.to(m, { timeScale: boost, duration: .2, overwrite: true });
          gsap.to(m, { timeScale: self.direction, duration: 1.4, delay: .2, ease: 'power2.out' });
        });
        gsap.to(spin, { timeScale: 1 + Math.min(Math.abs(v) / 90, 14), duration: .2, overwrite: true });
        gsap.to(spin, { timeScale: 1, duration: 1.6, delay: .2 });
      }
    });

    gsap.to('#progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } });

    /* ---------- etichette che si rimescolano entrando ---------- */
    $$('.label').forEach(function (l) {
      if (l.closest('.hero') || l.closest('.cta__layer--top')) return;
      var txt = l.firstChild.textContent;
      ScrollTrigger.create({ trigger: l, start: 'top 90%', onEnter: function () { gsap.to(l.firstChild, { scrambleText: { text: txt, chars: GLYPHS, speed: .5 }, duration: 1.1 }); } });
    });

    /* ---------- manifesto ---------- */
    var man = SplitText.create('#manifestoText', { type: 'words', wordsClass: 'w', aria: 'auto' });
    var hot = ['pezzo', 'peso.', 'scelta.', 'lontano.'];
    man.words.forEach(function (w) { if (hot.indexOf(w.textContent.trim()) > -1) { w.classList.add('hl'); w.style.setProperty('--hl', 0); } });
    gsap.timeline({ scrollTrigger: { trigger: '#manifestoText', start: 'top 85%', end: 'bottom 55%', scrub: .5 } })
      .fromTo(man.words, {
        opacity: .08, y: function () { return R(-60, 60); }, rotation: function () { return R(-25, 25); }, scaleX: function () { return R(.4, 1.8); }
      }, { opacity: 1, y: 0, rotation: 0, scaleX: 1, stagger: .08, ease: 'power2.out' })
      .fromTo('.manifesto__text .hl', { '--hl': 0 }, { '--hl': 1, stagger: .25, ease: 'expo.inOut', duration: .6 }, '-=1.2');

    /* ---------- dissezione ---------- */
    var B = ['1111110', '1100011', '1100011', '1111110', '1100011', '1100011', '1111110'];
    var STAR = ['0001000', '0001000', '1111111', '0111110', '0011100', '0110110', '1100011'];
    var grid = $('#tiles'), tiles = [];
    for (var r = 0; r < 7; r++) for (var c = 0; c < 7; c++) {
      var t = document.createElement('div');
      t.className = 'tile' + (B[r][c] === '1' ? ' on' : '');
      t.dataset.star = STAR[r][c];
      grid.appendChild(t); tiles.push(t);
    }
    var stateEl = $('#dissectState'), lastState = '';
    function setState(s) { if (s === lastState) return; lastState = s; gsap.to(stateEl, { scrambleText: { text: s, chars: GLYPHS }, duration: .5, overwrite: 'auto' }); }
    var vw = function () { return innerWidth; }, vh = function () { return innerHeight; };
    var dtl = gsap.timeline({
      scrollTrigger: {
        trigger: '#dissezione', pin: '.dissect__pin', start: 'top top', end: '+=240%', scrub: .8, invalidateOnRefresh: true,
        onUpdate: function (self) {
          var p = self.progress;
          setState(p < .1 ? 'FORMA INTEGRA' : p < .5 ? 'SMONTAGGIO IN CORSO' : p < .9 ? 'RICOSTRUZIONE' : 'NUOVA FORMA');
        }
      }
    });
    dtl.to(grid, { rotation: 45, scale: .8, duration: 1, ease: 'power2.inOut' }, 0)
      .to(tiles, {
        x: function () { return R(-vw() * .55, vw() * .55); },
        y: function () { return R(-vh() * .45, vh() * .45); },
        rotation: function () { return R(-720, 720); },
        scale: function () { return R(.2, 2.2); },
        duration: 1, ease: 'power3.inOut', stagger: { amount: .5, grid: [7, 7], from: 'center' }
      }, .1)
      .to(tiles, {
        backgroundColor: function (i, el) { return el.dataset.star === '1' ? C.signal : 'rgba(0,0,0,0)'; },
        outlineColor: function (i, el) { return el.dataset.star === '1' ? C.signal : '#2c2a36'; },
        duration: .3, stagger: { amount: .3, from: 'random' }
      }, 1.1)
      .to(grid, { rotation: 0, scale: 1, duration: 1, ease: 'power2.inOut' }, 1.4)
      .to(tiles, { x: 0, y: 0, rotation: 0, scale: 1, duration: 1, ease: 'expo.inOut', stagger: { amount: .5, grid: [7, 7], from: 'edges' } }, 1.4)
      .fromTo('.dissect__title em', { scaleX: .2, transformOrigin: '0 50%', display: 'inline-block' }, { scaleX: 1, duration: .6, ease: 'slam' }, 2.2);

    /* ---------- lavori in orizzontale ---------- */
    var track = $('#worksTrack');
    var dist = function () { return Math.max(0, track.scrollWidth - innerWidth); };
    var idxEl = $('#workIdx'), lastIdx = 1;
    var hTween = gsap.to(track, {
      x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: {
        trigger: '#lavori', pin: '.works__pin', start: 'top top', end: function () { return '+=' + dist() * 1.3; }, scrub: .8, invalidateOnRefresh: true,
        onUpdate: function (self) {
          var i = Math.min(5, Math.round(self.progress * 4) + 1);
          if (i !== lastIdx) { lastIdx = i; gsap.to(idxEl, { scrambleText: { text: '0' + i, chars: '0123456789' }, duration: .4, overwrite: 'auto' }); }
        }
      }
    });
    $$('.card').forEach(function (card, i) {
      if (i > 0) {
        gsap.fromTo(card, { rotation: R(-14, 14), yPercent: R(-18, 18), clipPath: 'inset(0% 0% 0% 100%)' }, {
          rotation: 0, yPercent: 0, clipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
          scrollTrigger: { trigger: card, containerAnimation: hTween, start: 'left 105%', end: 'left 45%', scrub: true }
        });
      }
      var spans = $$('.card__art span', card);
      gsap.fromTo(spans, { xPercent: function () { return R(20, 60); } }, {
        xPercent: function () { return R(-60, -20); }, ease: 'none',
        scrollTrigger: { trigger: card, containerAnimation: hTween, start: 'left right', end: 'right left', scrub: true }
      });
    });
    gsap.to('.a2-disc', { rotation: 360, duration: 3.6, ease: 'none', repeat: -1 });
    gsap.to('.a3-arrow', { x: 26, duration: .5, ease: 'power2.inOut', yoyo: true, repeat: -1 });
    gsap.to('.a1-bar', { scaleY: 3, yPercent: 300, duration: .9, ease: 'steps(4)', yoyo: true, repeat: -1 });
    gsap.to('.art-5 span', { rotation: function () { return R(-40, 40); }, scale: function () { return R(.7, 1.4); }, duration: .6, ease: 'steps(3)', repeat: -1, repeatRefresh: true, yoyo: true, stagger: .08 });

    /* ---------- titoli che esplodono in entrata ---------- */
    ['.services__title', '.lab__title', '.dissect__title'].forEach(function (sel) {
      var sp = SplitText.create(sel, { type: 'lines,chars', mask: 'lines', aria: 'auto' });
      gsap.from(sp.chars, {
        yPercent: function () { return R(110, 160); }, rotation: function () { return R(-40, 40); },
        duration: 1, ease: 'slam', stagger: { each: .03, from: 'random' },
        scrollTrigger: { trigger: sel, start: 'top 88%' }
      });
    });

    /* ---------- servizi ---------- */
    $$('.srv').forEach(function (row, i) {
      var fill = document.createElement('span'); fill.className = 'srv__fill'; row.prepend(fill);
      var title = $('.srv__t', row), txt = title.dataset.txt;
      gsap.from([title, $('.srv__d', row)], {
        xPercent: i % 2 ? 110 : -110, skewX: i % 2 ? -30 : 30, duration: 1.1, ease: 'expo.out', stagger: .08,
        scrollTrigger: { trigger: row, start: 'top 92%' }
      });
      function on(fromTop) {
        if (row.classList.contains('is-on')) return;
        row.classList.add('is-on');
        gsap.fromTo(fill, { clipPath: fromTop ? 'inset(0% 0% 100% 0%)' : 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .45, ease: 'expo.out', overwrite: true });
        gsap.to(title, { scrambleText: { text: txt, chars: GLYPHS, speed: .8 }, duration: .7, overwrite: 'auto' });
        gsap.fromTo($('.srv__n', row), { rotation: 0 }, { rotation: 360, duration: .6, ease: 'expo.out' });
      }
      function off(toTop) {
        row.classList.remove('is-on');
        gsap.to(fill, { clipPath: toTop ? 'inset(0% 0% 100% 0%)' : 'inset(100% 0% 0% 0%)', duration: .4, ease: 'expo.inOut', overwrite: true });
      }
      if (coarse) {
        // da telefono le righe si accendono quando passano al centro dello schermo
        ScrollTrigger.create({
          trigger: row, start: 'top 58%', end: 'bottom 42%',
          onEnter: function () { on(true); }, onEnterBack: function () { on(false); },
          onLeave: function () { off(true); }, onLeaveBack: function () { off(false); }
        });
      } else {
        row.addEventListener('pointerenter', function (e) { var b = row.getBoundingClientRect(); on(e.clientY < b.top + b.height / 2); });
        row.addEventListener('pointerleave', function (e) { var b = row.getBoundingClientRect(); off(e.clientY < b.top + b.height / 2); });
      }
    });

    /* ---------- laboratorio: griglia che si rimescola ---------- */
    var flip = $('#flip'), shuffleBtn = $('#shuffleBtn'), shuffling = false;
    function shuffle() {
      if (shuffling) return; shuffling = true;
      var items = $$('.fb', flip), state = Flip.getState(items);
      gsap.utils.shuffle(items.slice()).forEach(function (el) { flip.appendChild(el); });
      items.forEach(function (el) {
        el.style.gridColumn = Math.random() < .3 ? 'span 2' : '';
        el.style.gridRow = Math.random() < .25 ? 'span 2' : '';
      });
      Flip.from(state, {
        duration: .9, ease: 'expo.inOut', absolute: true, stagger: { each: .035, from: 'random' },
        spin: function () { return gsap.utils.random([-1, 0, 1]); },
        onComplete: function () { shuffling = false; }
      });
    }
    shuffleBtn.addEventListener('click', function () {
      gsap.fromTo(shuffleBtn, { scaleX: 1.25, scaleY: .7 }, { scaleX: 1, scaleY: 1, duration: .6, ease: 'elastic.out(1, .3)' });
      gsap.to(shuffleBtn, { scrambleText: { text: 'RIMESCOLA LA GRIGLIA', chars: GLYPHS }, duration: .5 });
      shuffle();
    });
    var auto = null;
    ScrollTrigger.create({
      trigger: flip, start: 'top 80%', end: 'bottom 20%',
      onToggle: function (self) { clearInterval(auto); if (self.isActive) auto = setInterval(shuffle, 2600); }
    });

    /* ---------- laboratorio: adesivi da lanciare ---------- */
    var z = 10;
    gsap.from('.stk', {
      y: function () { return -R(400, 700); }, rotation: function () { return R(-120, 120); },
      duration: 1.2, ease: 'bounce.out', stagger: { each: .09, from: 'random' },
      scrollTrigger: { trigger: '#throw', start: 'top 75%' }
    });
    Draggable.create('.stk', {
      type: 'x,y', bounds: '#throw', inertia: true, edgeResistance: .7, zIndexBoost: false,
      onPress: function () {
        this.target.style.zIndex = ++z;
        gsap.to(this.target, { scale: 1.18, rotation: '+=' + R(-25, 25), boxShadow: '12px 12px 0 ' + C.ink, duration: .2 });
      },
      onRelease: function () { gsap.to(this.target, { scale: 1, boxShadow: '5px 5px 0 ' + C.ink, duration: .6, ease: 'elastic.out(1, .4)' }); },
      onThrowUpdate: function () { gsap.set(this.target, { rotation: '+=' + (this.getVelocity('x') / 120) }); }
    });

    /* ---------- contatti: riflettore che rivela il secondo strato ---------- */
    var cta = $('#contatti'), top = $('#ctaTop');
    var spot = { x: 0, y: 0, r: 0 };
    function paint() { top.style.clipPath = 'circle(' + spot.r + 'px at ' + spot.x + 'px ' + spot.y + 'px)'; }
    var sx = gsap.quickTo(spot, 'x', { duration: .45, ease: 'power3', onUpdate: paint });
    var sy = gsap.quickTo(spot, 'y', { duration: .45, ease: 'power3', onUpdate: paint });
    function baseR() { return Math.min(cta.offsetWidth, cta.offsetHeight) * (coarse ? .34 : .26); }
    var wander = gsap.timeline({ paused: true, repeat: -1, repeatRefresh: true })
      .to(spot, { x: function () { return R(.15, .85) * cta.offsetWidth; }, y: function () { return R(.15, .7) * cta.offsetHeight; }, duration: 1.3, ease: 'sine.inOut', onUpdate: paint });
    var idleT;
    function userMove(x, y) {
      wander.pause();
      var b = cta.getBoundingClientRect(); sx(x - b.left); sy(y - b.top);
      clearTimeout(idleT); idleT = setTimeout(function () { wander.play(); }, 1600);
    }
    cta.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') userMove(e.clientX, e.clientY); });
    cta.addEventListener('touchmove', function (e) { var t = e.touches[0]; userMove(t.clientX, t.clientY); }, { passive: true });
    cta.addEventListener('touchstart', function (e) {
      var t = e.touches[0]; userMove(t.clientX, t.clientY);
      gsap.fromTo(spot, { r: baseR() * 1.6 }, { r: baseR(), duration: .8, ease: 'elastic.out(1, .4)', onUpdate: paint });
    }, { passive: true });
    ScrollTrigger.create({
      trigger: cta, start: 'top 60%', end: 'bottom top',
      onToggle: function (self) {
        if (self.isActive) {
          spot.x = cta.offsetWidth / 2; spot.y = cta.offsetHeight * .35;
          gsap.to(spot, { r: baseR(), duration: 1, ease: 'slam', onUpdate: paint }); wander.play();
        } else { wander.pause(); gsap.to(spot, { r: 0, duration: .5, onUpdate: paint }); }
      }
    });
    var ctaSplit = SplitText.create('.cta__layer--base .cta__big', { type: 'words,chars', aria: 'auto' });
    gsap.from(ctaSplit.chars, {
      yPercent: function () { return R(-200, 200); }, xPercent: function () { return R(-200, 200); }, rotation: function () { return R(-90, 90); }, opacity: 0,
      duration: 1, ease: 'expo.out', stagger: { each: .02, from: 'random' },
      scrollTrigger: { trigger: cta, start: 'top 70%' }
    });

    ScrollTrigger.refresh();
  }

  // si parte quando i caratteri sono pronti, così le misure sono giuste
  var started = false;
  function go() { if (started) return; started = true; start(); }
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(go); setTimeout(go, 1800); } else { go(); }
})();
