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
