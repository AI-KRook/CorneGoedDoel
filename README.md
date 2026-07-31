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

Alle placeholders zijn ingevuld. De site bevat nu:

- **Rekeningnummer** `NL79 SNSB 8848 2067 19` (SNS Bank), in de doneersectie
- **Contactadres** `info@cornelooptvoordvnonderzoek.nl`, onderin de footer
- **Foto's** van Corné (`images/corne.jpg`) en Maud (`images/maud.jpg`)

Wijzigt het rekeningnummer, controleer een nieuw nummer dan altijd eerst op de
IBAN-checksum voordat je het publiceert. Een fout nummer op een openbare
doneerpagina betekent dat geld bij de verkeerde terechtkomt:

```bash
python -c "s='NL79SNSB8848206719'; print('geldig' if len(s)==18 and int(''.join(str(int(c,36)) for c in s[4:]+s[:4]))%97==1 else 'ONGELDIG')"
```

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

## Doneeractie.nl

De actie is aangemaakt en staat open:

<https://www.doneeractie.nl/ik-loop-42195-kilometer-voor-mijn-nichtje/-121531>

De knop **"Doneer nu"** in de sectie `#doneren` gaat rechtstreeks naar het
doneerformulier (`/donate`), zodat bezoekers niet eerst langs de actiepagina hoeven.

### Automatische voortgangsbalk

De site toont het opgehaalde bedrag, het streefbedrag en het percentage in de
eigen huisstijl. Dat werkt zo:

1. `scripts/haal-stand-op.py` leest de widget van doneeractie.nl uit en schrijft
   `data/voortgang.json`
2. `.github/workflows/voortgang.yml` draait dat script elk uur en commit het
   resultaat als de stand is gewijzigd
3. `js/main.js` leest de JSON en vult twee blokken: de compacte statusbalk in de
   header en de uitgebreide versie in de doneersectie

Handmatig verversen kan met:

```bash
python scripts/haal-stand-op.py
```

Het streefbedrag komt uit doneeractie.nl zelf, dus dat hoeft nergens handmatig
te worden bijgehouden.

**Belangrijk:** de workflow commit naar `main`. Dat lukt alleen als in de
repository onder *Settings → Actions → General → Workflow permissions* de optie
**Read and write permissions** aanstaat.

Als het bestand ontbreekt, het laden mislukt of de stand ouder is dan 24 uur,
blijft de balk verborgen en werkt de doneerknop gewoon. Liever geen bedrag dan
een verkeerd bedrag op een doneerpagina.

### Alternatief: de officiële widget van doneeractie.nl

Wil je liever de widget van het platform zelf (met eigen vormgeving), plak dan
dit in `index.html` op de plek van `<div class="widget-placeholder">`:

```html
<div id="doneeractie_donatiemodule" data-size="2" data-donationactionid="121531"></div>
<script type="text/javascript" src="https://www.doneeractie.nl/widgets/widget.js?2"></script>
```

`data-size` kan 1 (350x405, met actiefoto), 2 (350x245) of 3 (210x75, alleen
een knop) zijn.

1. Ga naar de actiepagina op doneeractie.nl
2. Klik op **"Website widget"**
3. Kies hoeveel recente donaties je wilt tonen
4. Kopieer de code
5. Plak die in `index.html` in de sectie `#doneren`, op de plek van
   `<div class="widget-placeholder">...</div>` (zie de comment `DONEERACTIE.NL WIDGET`)

De widget toont dan de doneerknop met de actuele stand van de teller en de
laatste donaties.

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

`.github/workflows/deploy-transip.yml` uploadt de site na elke wijziging. Dat is
belangrijker dan het lijkt: de voortgangsbalk wordt elk uur bijgewerkt door een
andere workflow, en zonder automatische publicatie zou de teller op TransIP
blijven staan op de stand van je laatste handmatige upload.

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
data/
```

`README.md`, `scripts/`, `.github/` en `.claude/` horen niet op de webserver.

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
