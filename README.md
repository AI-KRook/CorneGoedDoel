# Corné loopt voor onderzoek naar dunnevezelneuropathie

Persoonlijke doneerwebsite voor de deelname van Corné aan de TCS Amsterdam Marathon
(zondag 18 oktober 2026). De opbrengst gaat als geoormerkte gift via het
Universiteitsfonds Limburg naar het onderzoek naar dunnevezelneuropathie (DVN)
van Maastricht UMC+.

## Bestanden

- `index.html`: de volledige one-page website
- `css/style.css`: vormgeving (Rubik, blauwgroen palet, rechthoekige knoppen)
- `js/main.js`: deelknoppen (WhatsApp, e-mail, link kopiëren) en scroll-animaties

Het lettertype Rubik wordt geladen via Google Fonts. Het kleurenpalet staat als
CSS-variabelen bovenin `css/style.css` en kan daar in één blok worden aangepast.

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

## Doneeractie.nl koppelen

In de sectie `#doneren` staat nu een werkende knop **"Doneer nu via doneeractie.nl"**.
Die verwijst voorlopig naar de homepage van doneeractie.nl. Zodra de actie is
aangemaakt (het rekeningnummer volgt nog) zijn er twee stappen:

### 1. De knop naar de juiste actiepagina laten wijzen

Zoek in `index.html` op de comment `ACTIE-URL` en vervang
`https://www.doneeractie.nl/` door de directe URL van de actiepagina,
bijvoorbeeld `https://www.doneeractie.nl/naam-van-de-actie/-12345`.

Verwijder daarna de alinea met de klasse `widget-status` ("De actiepagina wordt
op dit moment opgezet").

### 2. De officiële widget met donatieteller plaatsen

1. Ga naar de actiepagina op doneeractie.nl
2. Klik op **"Website widget"**
3. Kies hoeveel recente donaties je wilt tonen
4. Kopieer de code
5. Plak die in `index.html` in de sectie `#doneren`, op de plek van
   `<div class="widget-placeholder">...</div>` (zie de comment `DONEERACTIE.NL WIDGET`)

De widget toont dan de doneerknop met de actuele stand van de teller en de
laatste donaties.

## Publiceren via GitHub Pages

1. Push deze repository naar GitHub (`main` branch)
2. Ga op GitHub naar **Settings → Pages**
3. Kies bij "Source": **Deploy from a branch**, branch `main`, map `/ (root)`
4. De site staat daarna op `https://ai-krook.github.io/CorneGoedDoel/`
