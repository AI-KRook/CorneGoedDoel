# Corné loopt voor onderzoek naar dunnevezelneuropathie

Persoonlijke doneerwebsite voor de deelname van Corné aan de TCS Amsterdam Marathon
(zondag 18 oktober 2026). De opbrengst gaat via het
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

## Gegevens op de site

- **Contactadres** `info@cornelooptvoordvnonderzoek.nl`, onderin de footer
- **Foto's** van Corné (`images/corne.jpg`) en Maud (`images/maud.jpg`)
- **Doneren** loopt via UM Crowd, zie hieronder

Het rekeningnummer en het losse kenmerk voor giften aan het fonds zijn vervallen:
alle donaties lopen nu via de actiepagina op UM Crowd.

## Foto's toevoegen of vervangen

De pagina laadt `images/corne.jpg` automatisch. Ontbreekt het bestand, dan
verschijnt in plaats daarvan de placeholder, zodat de site nooit een kapotte
afbeelding toont. De foto van Maud in `#eerbetoon` heeft die terugval niet en
moet dus aanwezig zijn.

Zet foto's altijd verkleind in de repo, niet op volle resolutie. Een origineel
uit de camera is al gauw 10 MB en maakt de site traag. Verkleinen naar een
staande uitsnede van 1000 bij 1250 pixels kan met:

```bash
python -c "from PIL import Image; im=Image.open('origineel.jpg'); W,H=im.size; w=int(H*4/5); l=max(0,min(W-w,int(W*0.47)-w//2)); im.crop((l,0,l+w,H)).resize((1000,1250), Image.LANCZOS).save('images/corne.jpg','JPEG',quality=82,optimize=True,progressive=True)"
```

Originele bestanden met de naam `Profielfoto*.jpg` worden via `.gitignore`
buiten de repo gehouden.

## Doneren via UM Crowd

Doneren loopt via UM Crowd, de crowdfundingsite van Stichting Universiteitsfonds
Limburg / SWOL:

- Actiepagina: <https://www.umcrowd.nl/fundraisers/corne-van-gils>
- Doneerknop: <https://www.umcrowd.nl/fundraisers/corne-van-gils/donate>

### De voortgangsbalk

UM Crowd draait op Kentaa en biedt de stand aan als JSON op de actiepagina met
`.json` erachter:

    https://www.umcrowd.nl/fundraisers/corne-van-gils.json

Daar staan `total_amount`, `target_amount` en `total_donations` in. Die bron
staat cross-origin verkeer toe, dus `js/main.js` haalt de cijfers rechtstreeks
uit de browser op. Er is dus **geen** PHP, cronjob of GitHub Action nodig: de
teller is altijd actueel, op elke webserver.

Lukt het ophalen niet, dan blijft de balk verborgen en werkt de doneerknop
gewoon. Liever geen bedrag dan een verkeerd bedrag op een doneerpagina.

Wijzigt de actiepagina ooit van adres, pas dan `STAND_URL` bovenin
`js/main.js` aan.

### Laatste donaties met een bericht

Onder de doneerknop staan de drie meest recente donaties die een persoonlijk
bericht hebben. Die lijst komt van een andere bron dan de totalen:

    https://frontend-api.kentaa.nl/donations?action_id=MAYDrxYe6fKK

Die API vereist de header `X-Site-Id: mH9ARTHYekJu` en stuurt géén CORS-headers
mee, dus de browser mag hem niet rechtstreeks aanroepen. Daarom loopt dit via
`data/donaties.php`, dat het antwoord tien minuten bewaart.

Gevolg: dit blok werkt alleen op een server met PHP. Op GitHub Pages blijft het
verborgen, de rest van de pagina werkt daar gewoon.

Berichten zijn door donateurs zelf getypt. `js/main.js` zet ze uitsluitend via
`textContent` op de pagina, nooit via `innerHTML`, zodat er geen HTML of
JavaScript uit een bericht kan worden uitgevoerd. Laat dat zo.

Anonieme donateurs heten bij UM Crowd al "Anoniem"; er is geen apart veld dat
uitgelezen hoeft te worden.

## Publiceren naar TransIP

De site is volledig statisch en gebruikt alleen relatieve paden, dus hij draait
op elke webserver zonder aanpassingen. Er is geen PHP, database of build-step nodig.

### Wat je nodig hebt in het TransIP-controlepaneel

| Instelling | Waarde |
|---|---|
| DocumentRoot | `/www` (de standaard) |
| Protocol | SFTP op poort 22 (TransIP ondersteunt geen FTPS) |
| SSL | Let's Encrypt aanzetten bij *Domeinen & SSL* |
| PHP | niet nodig |
| Database | niet nodig |

Zet daarnaast een omleiding van `http` naar `https` aan, en kies of `www.` naar
de kale domeinnaam wijst of andersom. Eén van de twee moet doorverwijzen, anders
staat dezelfde site op twee adressen.

### Automatisch publiceren vanuit GitHub

`.github/workflows/deploy-transip.yml` uploadt de site naar TransIP. De workflow
staat nu op handmatig starten, omdat SFTP-inloggen nog niet werkte; de
oorspronkelijke triggers staan als commentaar in het bestand.

De voortgangsbalk hangt hier niet meer aan vast: die haalt de stand rechtstreeks
bij UM Crowd op, dus die blijft actueel ook zonder publicatie.

De gegevens vind je in het TransIP-controlepaneel onder
*Webhosting → je domein → Website → SFTP/SSH*. Voeg ze in GitHub toe onder
*Settings → Secrets and variables → Actions*. Vul ze zelf in; ze zijn daarna
niet meer leesbaar.

- `TRANSIP_FTP_HOST`: de host uit het SFTP/SSH-scherm, alleen de naam zonder
  `sftp://` ervoor en zonder poortnummer erachter
- `TRANSIP_FTP_USER`: de gebruikersnaam uit datzelfde scherm
- `TRANSIP_FTP_PASSWORD`: het bijbehorende wachtwoord

Wijkt je DocumentRoot af van `/www`, zet dan onder hetzelfde menu bij *Variables*
een `TRANSIP_DOCUMENTROOT` met het juiste pad.

Test daarna één keer handmatig via *Actions → Website publiceren naar TransIP →
Run workflow*.

De workflow verwijdert bewust geen bestanden op de server. Wil je dat oude
bestanden wél opgeruimd worden, voeg dan `--delete` toe aan het `mirror`-commando.
Controleer eerst of er niets anders in `/www` staat.

### Handmatig uploaden

Kan ook, bijvoorbeeld met FileZilla via SFTP. Upload dan naar `/www`:

```
index.html
css/
js/
images/
```

`README.md`, `.github/` en `.claude/` horen niet op de webserver.

### Alternatief: alleen de domeinnaam bij TransIP

Wil je vooral een eigen domeinnaam en niet per se TransIP als webserver, dan kun
je het domein bij TransIP registreren en laten wijzen naar GitHub Pages. Dan
blijft alles werken zoals het nu doet, zonder FTP-koppeling. Zet in de DNS van
TransIP vier A-records voor `@` naar de adressen van GitHub Pages en een
CNAME voor `www` naar `ai-krook.github.io`, en vul het domein in onder
*Settings → Pages → Custom domain*. De actuele IP-adressen staan in de
[documentatie van GitHub](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site).

## Publiceren via GitHub Pages

1. Push deze repository naar GitHub (`main` branch)
2. Ga op GitHub naar **Settings → Pages**
3. Kies bij "Source": **Deploy from a branch**, branch `main`, map `/ (root)`
4. De site staat daarna op `https://ai-krook.github.io/CorneGoedDoel/`
