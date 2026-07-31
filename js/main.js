// Deelknoppen en subtiele scroll-animaties

(function () {
  var pageUrl = window.location.href.split('#')[0];
  var shareText = 'Corné loopt de marathon van Amsterdam voor onderzoek naar dunnevezelneuropathie. Doe je mee? ';

  // WhatsApp en e-mail vullen met de actuele pagina-URL
  var whatsapp = document.getElementById('share-whatsapp');
  if (whatsapp) {
    whatsapp.href = 'https://wa.me/?text=' + encodeURIComponent(shareText + pageUrl);
  }

  var email = document.getElementById('share-email');
  if (email) {
    email.href = 'mailto:?subject=' + encodeURIComponent('Corné loopt de marathon voor onderzoek naar dunnevezelneuropathie')
      + '&body=' + encodeURIComponent(shareText + pageUrl);
  }

  // Link kopiëren
  var copyBtn = document.getElementById('copy-link');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(pageUrl).then(function () {
        var original = copyBtn.textContent;
        copyBtn.textContent = 'Link gekopieerd!';
        setTimeout(function () { copyBtn.textContent = original; }, 2000);
      });
    });
  }

  // Stand van de inzameling tonen.
  // data/voortgang.json wordt elk uur bijgewerkt door een GitHub Action.
  // Ontbreekt het bestand of is het verouderd, dan blijft het blok verborgen:
  // liever geen cijfer dan een verkeerd cijfer op een doneerpagina.
  var MAX_LEEFTIJD_UREN = 24;

  function toonVoortgang(stand) {
    var doel = Number(stand.streefbedrag);
    var opgehaald = Number(stand.opgehaald);
    if (!isFinite(doel) || doel <= 0 || !isFinite(opgehaald) || opgehaald < 0) return;

    var bijgewerkt = new Date(stand.bijgewerkt);
    var urenOud = (Date.now() - bijgewerkt.getTime()) / 36e5;
    if (!isFinite(urenOud) || urenOud > MAX_LEEFTIJD_UREN) return;

    var percentage = Math.round((opgehaald / doel) * 100);
    var euro = new Intl.NumberFormat('nl-NL', {
      style: 'currency', currency: 'EUR', maximumFractionDigits: 0
    });

    document.getElementById('voortgang-bedrag').textContent = euro.format(opgehaald);
    document.getElementById('voortgang-doel').textContent =
      'van ' + euro.format(doel) + ' · ' + percentage + '%';

    var balk = document.getElementById('voortgang-balk');
    balk.setAttribute('aria-valuenow', percentage);
    balk.setAttribute('aria-valuetext', euro.format(opgehaald) + ' van ' + euro.format(doel));

    var aantal = Number(stand.donaties) || 0;
    document.getElementById('voortgang-meta').textContent = aantal === 0
      ? 'Nog geen donaties. Jij kunt de eerste zijn.'
      : aantal + (aantal === 1 ? ' donatie' : ' donaties') + ' tot nu toe.';

    document.getElementById('voortgang').hidden = false;

    // Zelfde stand kort samengevat in de header
    document.getElementById('hero-status-bedrag').textContent = euro.format(opgehaald);
    document.getElementById('hero-status-rest').textContent =
      'opgehaald van ' + euro.format(doel) + ' · ' + percentage + '%';

    var heroBalk = document.getElementById('hero-status-balk');
    heroBalk.setAttribute('aria-valuenow', percentage);
    heroBalk.setAttribute('aria-valuetext', euro.format(opgehaald) + ' van ' + euro.format(doel));
    document.getElementById('hero-status').hidden = false;

    // Balken pas vullen nadat de blokken zichtbaar zijn, zodat de animatie loopt
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        var breedte = Math.min(100, percentage) + '%';
        document.getElementById('voortgang-vulling').style.width = breedte;
        document.getElementById('hero-status-vulling').style.width = breedte;
      });
    });
  }

  // Eerst het PHP-script proberen: dat haalt de actuele stand rechtstreeks bij
  // doneeractie.nl op en werkt dus zonder dat er iets bijgewerkt hoeft te worden.
  // Draait de site op een server zonder PHP, zoals GitHub Pages, dan valt hij
  // terug op het JSON-bestand.
  function haalStand(bronnen) {
    if (!bronnen.length) return;
    fetch(bronnen[0], { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (stand) {
        if (stand && stand.streefbedrag) { toonVoortgang(stand); }
        else { haalStand(bronnen.slice(1)); }
      })
      .catch(function () { haalStand(bronnen.slice(1)); });
  }

  haalStand(['data/voortgang.php', 'data/voortgang.json']);

  // Secties zacht laten verschijnen bij scrollen
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var sections = document.querySelectorAll('main .section > .container');
    sections.forEach(function (el) { el.classList.add('reveal-scroll'); });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    sections.forEach(function (el) { observer.observe(el); });
  }
})();
