// Animazioni del sito IkodaI Studio (GSAP + ScrollTrigger).
// Si attivano solo se il dispositivo non chiede movimento ridotto.
(function () {
  var root = document.documentElement;

  // Se GSAP non si carica, il contenuto della prima schermata deve comparire comunque.
  if (!window.gsap || !window.ScrollTrigger) { root.classList.remove('anim'); return; }
  gsap.registerPlugin(ScrollTrigger);

  var mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', function () {

    // 1. Prima schermata: il titolo entra riga per riga, poi testo e pulsanti.
    var h1 = document.querySelector('.hero h1');
    var original = h1.innerHTML;
    var words = h1.textContent.trim().split(/\s+/);
    h1.innerHTML = words.map(function (w) { return '<span class="w" style="display:inline-block">' + w + '</span>'; }).join(' ');
    var lines = [], last = null;
    h1.querySelectorAll('.w').forEach(function (w) {
      if (w.offsetTop !== last) { lines.push([]); last = w.offsetTop; }
      lines[lines.length - 1].push(w.textContent);
    });
    h1.innerHTML = lines.map(function (l) { return '<span class="ln"><span>' + l.join(' ') + '</span></span>'; }).join('');

    var intro = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: function () { h1.innerHTML = original; } // torna al testo semplice: nessun problema se la finestra cambia misura
    });
    intro
      .set(['.hero .eyebrow', '.hero h1', '.hero p:not(.eyebrow)', '.hero .ctas'], { visibility: 'visible' })
      .from('.hero .eyebrow', { autoAlpha: 0, y: 12, duration: .5 })
      .from('.hero h1 .ln > span', { yPercent: 110, duration: .9, stagger: .12 }, '-=.25')
      .from('.hero p:not(.eyebrow)', { autoAlpha: 0, y: 16, duration: .6 }, '-=.45')
      .from('.hero .ctas .btn', { autoAlpha: 0, y: 16, duration: .5, stagger: .08 }, '-=.35');

    // 2. Come lavoriamo: la linea di ogni fase si disegna e il numero compare, una fase dopo l'altra.
    gsap.set('.step', { '--line': '0%', '--num': 0 });
    gsap.set('.step h3, .step p', { autoAlpha: 0, y: 14 });
    ScrollTrigger.batch('.step', {
      start: 'top 85%',
      once: true,
      onEnter: function (batch) {
        batch.forEach(function (step, i) {
          gsap.timeline({ delay: i * .28, defaults: { ease: 'power2.out' } })
            .to(step, { '--line': '100%', duration: .7, ease: 'power2.inOut' })
            .to(step, { '--num': 1, duration: .4 }, '-=.35')
            .to(step.querySelectorAll('h3, p'), { autoAlpha: 1, y: 0, duration: .5, stagger: .06 }, '-=.25');
        });
      }
    });

    // 3. Showreel: il riquadro si allarga mentre entra nella pagina, seguendo lo scorrimento.
    gsap.fromTo('.reel',
      { scale: .86, borderRadius: 40 },
      { scale: 1, borderRadius: 22, ease: 'none',
        scrollTrigger: { trigger: '.reel', start: 'top bottom', end: 'center 60%', scrub: .6 } });

    return function () { h1.innerHTML = original; };
  });
})();
