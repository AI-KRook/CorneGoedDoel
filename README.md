# Corné loopt voor onderzoek naar dunnevezelneuropathie

Persoonlijke doneerwebsite voor de deelname van Corné aan de TCS Amsterdam Marathon
(zondag 18 oktober 2026). De opbrengst gaat als geoormerkte gift via het
Universiteitsfonds Limburg naar het onderzoek naar dunnevezelneuropathie (DVN)
van Maastricht UMC+.

## Bestanden

- `index.html`: de volledige one-page website
- `css/style.css`: vormgeving (Helvetica, warme kleuren, rechthoekige knoppen)
- `js/main.js`: deelknoppen (WhatsApp, e-mail, link kopiëren) en scroll-animaties

De site is volledig statisch en werkt zonder build-step. Openen kan door
`index.html` in een browser te openen.

## Nog in te vullen (placeholders)

Zoek in `index.html` op de volgende blokken:

1. **Naam van het nichtje**: zoek op `[Naam]` in de sectie `#eerbetoon` en vervang
   door de echte naam. Zie ook de HTML-comment `NAAM NICHTJE`.
2. **Eerbetoon**: onder de comment `EERBETOON INVULLEN` staat een placeholder voor
   een persoonlijke tekst en foto van het nichtje.
3. **Foto van Corné**: onder de comment `FOTO CORNÉ` in de sectie `#verhaal`.
   Zet de foto in een map `images/` en vervang de placeholder door een `<img>`.
4. **Contactadres**: onderin de footer, zoek op `[e-mailadres]`.

## Doneeractie.nl widget plaatsen

Zodra de actie op doneeractie.nl is aangemaakt (rekeningnummer volgt nog):

1. Ga naar de actiepagina op doneeractie.nl
2. Klik op **"Website widget"**
3. Kies hoeveel recente donaties je wilt tonen
4. Kopieer de code
5. Plak die in `index.html` in de sectie `#doneren`, op de plek van
   `<div class="widget-placeholder">...</div>` (zie de comment `DONEERACTIE.NL WIDGET`)

Vervang daarna ook de tekst "Doneren kan binnenkort" of verwijder de placeholder-knop.

## Publiceren via GitHub Pages

1. Push deze repository naar GitHub (`main` branch)
2. Ga op GitHub naar **Settings → Pages**
3. Kies bij "Source": **Deploy from a branch**, branch `main`, map `/ (root)`
4. De site staat daarna op `https://ai-krook.github.io/CorneGoedDoel/`
