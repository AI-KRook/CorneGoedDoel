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

  // Stand van de inzameling tonen. UM Crowd biedt de cijfers als JSON aan en
  // staat cross-origin verkeer toe, dus de browser haalt ze rechtstreeks op.
  // Lukt dat niet, dan blijft het blok verborgen: liever geen cijfer dan een
  // verkeerd cijfer op een doneerpagina.
  var STAND_URL = 'https://www.umcrowd.nl/fundraisers/corne-van-gils.json';

  function toonVoortgang(stand) {
    var doel = Number(stand.streefbedrag);
    var opgehaald = Number(stand.opgehaald);
    if (!isFinite(doel) || doel <= 0 || !isFinite(opgehaald) || opgehaald < 0) return;

    var percentage = Math.round((opgehaald / doel) * 100);
    // Een klein bedrag rondt af naar 0%, wat leest alsof er niets binnen is.
    var percentageTekst = (percentage === 0 && opgehaald > 0) ? 'minder dan 1%' : percentage + '%';
    // Idem voor de balk: geef een zichtbaar streepje zodra er iets staat.
    var balkBreedte = (opgehaald > 0 ? Math.max(1, Math.min(100, percentage)) : 0) + '%';

    var euro = new Intl.NumberFormat('nl-NL', {
      style: 'currency', currency: 'EUR', maximumFractionDigits: 0
    });

    document.getElementById('voortgang-bedrag').textContent = euro.format(opgehaald);
    document.getElementById('voortgang-doel').textContent =
      'van ' + euro.format(doel) + ' · ' + percentageTekst;

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
      'opgehaald van ' + euro.format(doel) + ' · ' + percentageTekst;

    var heroBalk = document.getElementById('hero-status-balk');
    heroBalk.setAttribute('aria-valuenow', percentage);
    heroBalk.setAttribute('aria-valuetext', euro.format(opgehaald) + ' van ' + euro.format(doel));
    document.getElementById('hero-status').hidden = false;

    // Balken pas vullen nadat de blokken zichtbaar zijn, zodat de animatie loopt
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.getElementById('voortgang-vulling').style.width = balkBreedte;
        document.getElementById('hero-status-vulling').style.width = balkBreedte;
      });
    });
  }

  fetch(STAND_URL, { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
    .then(function (data) {
      var a = data && data.action;
      if (!a) return;
      toonVoortgang({
        opgehaald: a.total_amount,        // komt als tekst binnen, Number() vangt dat
        streefbedrag: a.target_amount,
        donaties: a.total_donations
      });
    })
    .catch(function () { /* stil falen: de doneerknop werkt hoe dan ook */ });

  // Laatste donaties met een persoonlijk bericht. Loopt via een PHP-script,
  // omdat de donatielijst van UM Crowd geen cross-origin verkeer toestaat.
  // Berichten zijn door donateurs getypt, dus ze gaan uitsluitend via
  // textContent de pagina in en nooit via innerHTML.
  fetch('data/donaties.php', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
    .then(function (data) {
      var lijst = (data && data.donaties) || [];
      if (!lijst.length) return;

      var euro = new Intl.NumberFormat('nl-NL', {
        style: 'currency', currency: 'EUR', minimumFractionDigits: 0,
        maximumFractionDigits: 2
      });
      var doel = document.getElementById('steunbetuigingen-lijst');

      lijst.forEach(function (d) {
        var li = document.createElement('li');

        var q = document.createElement('p');
        q.className = 'steun-bericht';
        q.textContent = d.bericht;

        var wie = document.createElement('p');
        wie.className = 'steun-wie';
        var naam = document.createElement('span');
        naam.textContent = d.naam || 'Anoniem';
        var bedrag = document.createElement('strong');
        bedrag.textContent = euro.format(Number(d.bedrag) || 0);
        wie.appendChild(naam);
        wie.appendChild(document.createTextNode(' · '));
        wie.appendChild(bedrag);

        li.appendChild(q);
        li.appendChild(wie);
        doel.appendChild(li);
      });

      document.getElementById('steunbetuigingen').hidden = false;
    })
    .catch(function () { /* stil falen: zonder PHP blijft het blok verborgen */ });

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
