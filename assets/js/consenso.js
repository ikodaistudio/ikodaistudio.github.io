/* Consenso ai cookie e pixel di Meta per IkodaI Studio.
   Il pixel viene caricato solo dopo che il visitatore ha premuto "Accetta".
   La scelta resta salvata nel browser per 6 mesi, poi il banner ricompare. */
(function () {
  var PIXEL_ID = '3505622249598811';
  var CHIAVE = 'ikodai-consenso';
  var VERSIONE = 1;
  var DURATA_MS = 1000 * 60 * 60 * 24 * 182; // circa 6 mesi

  function leggi() {
    try {
      var s = JSON.parse(localStorage.getItem(CHIAVE));
      if (!s || s.v !== VERSIONE || Date.now() - s.t > DURATA_MS) return null;
      return s;
    } catch (e) { return null; }
  }

  function salva(marketing) {
    try { localStorage.setItem(CHIAVE, JSON.stringify({ v: VERSIONE, t: Date.now(), marketing: !!marketing })); } catch (e) {}
  }

  function cancellaCookieMeta() {
    var host = location.hostname;
    ['_fbp', '_fbc'].forEach(function (nome) {
      document.cookie = nome + '=; Max-Age=0; path=/';
      document.cookie = nome + '=; Max-Age=0; path=/; domain=' + host;
      document.cookie = nome + '=; Max-Age=0; path=/; domain=.' + host;
    });
  }

  var pixelAttivo = false;
  function caricaPixel() {
    if (pixelAttivo) return;
    pixelAttivo = true;
    /* codice base del pixel di Meta */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  /* eventi sui contatti: inviati solo se il pixel è attivo */
  document.addEventListener('click', function (e) {
    if (!pixelAttivo || !window.fbq) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('wa.me') !== -1) window.fbq('track', 'Contact', { content_name: 'WhatsApp' });
    else if (href.indexOf('tel:') === 0) window.fbq('track', 'Contact', { content_name: 'Telefono' });
    else if (href.indexOf('mailto:') === 0) window.fbq('track', 'Lead', { content_name: 'Email' });
  }, true);

  var banner;
  function creaBanner() {
    banner = document.createElement('div');
    banner.className = 'cc';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-labelledby', 'cc-titolo');
    banner.hidden = true;
    banner.innerHTML =
      '<button type="button" class="cc-chiudi" data-cc="no" aria-label="Chiudi e rifiuta i cookie non necessari">&times;</button>' +
      '<h2 id="cc-titolo">Cookie</h2>' +
      '<p>Il sito utilizza il pixel di Meta per misurare l’efficacia delle campagne pubblicitarie, solo con il consenso del visitatore. ' +
      'La scelta è modificabile in qualsiasi momento dal piè di pagina. <a href="/privacy.html">Informativa su privacy e cookie</a></p>' +
      '<div class="cc-btns"><button type="button" data-cc="no">Rifiuta</button><button type="button" data-cc="si">Accetta</button></div>';
    banner.addEventListener('click', function (e) {
      var b = e.target.closest('[data-cc]');
      if (!b) return;
      scegli(b.getAttribute('data-cc') === 'si');
    });
    document.body.appendChild(banner);
  }

  function mostra() {
    if (!banner) creaBanner();
    banner.hidden = false;
  }

  function scegli(marketing) {
    var prima = leggi();
    salva(marketing);
    banner.hidden = true;
    if (marketing) { caricaPixel(); return; }
    cancellaCookieMeta();
    /* se il pixel era già attivo, si ricarica la pagina per fermarlo */
    if (pixelAttivo || (prima && prima.marketing)) location.reload();
  }

  window.ikodaiPreferenzeCookie = mostra;

  function avvio() {
    document.querySelectorAll('[data-cc-apri]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); mostra(); });
    });
    var s = leggi();
    if (!s) { mostra(); return; }
    if (s.marketing) caricaPixel();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', avvio);
  else avvio();
})();
