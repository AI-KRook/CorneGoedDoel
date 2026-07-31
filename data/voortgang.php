<?php
/**
 * Haalt de stand van de doneeractie op bij doneeractie.nl en geeft die als JSON.
 *
 * De browser mag dit niet rechtstreeks doen, omdat doneeractie.nl geen
 * CORS-header meestuurt. Vanaf de server speelt die beperking niet.
 *
 * Het antwoord wordt een uur bewaard in voortgang-cache.json, zodat niet elke
 * bezoeker een verzoek naar doneeractie.nl veroorzaakt. Er is geen cronjob
 * nodig: de eerste bezoeker na dat uur ververst de gegevens.
 */

// Bewust gewone variabelen en geen const: een const met __DIR__ erin wordt
// niet door elke PHP-versie geaccepteerd, en dit draait op gedeelde hosting.
$actieId     = '121531';
$bewaartijd  = 3600;                            // seconden
$cacheBestand = __DIR__ . '/voortgang-cache.json';
$widgetUrl   = 'https://www.doneeractie.nl/widget/v2/' . $actieId . '/2';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=300');

/** Zet een Nederlands bedrag als "1.234,56" om naar een getal. */
function naarBedrag(string $tekst): float
{
    return (float) str_replace(',', '.', str_replace('.', '', $tekst));
}

function haalPaginaOp(string $url): ?string
{
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT        => 15,
            CURLOPT_USERAGENT      => 'CorneGoedDoel-voortgang/1.0',
        ]);
        $inhoud = curl_exec($ch);
        $code   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return ($inhoud !== false && $code === 200) ? $inhoud : null;
    }

    if (ini_get('allow_url_fopen')) {
        $context = stream_context_create(['http' => [
            'timeout' => 15,
            'header'  => "User-Agent: CorneGoedDoel-voortgang/1.0\r\n",
        ]]);
        $inhoud = @file_get_contents($url, false, $context);
        return $inhoud !== false ? $inhoud : null;
    }

    return null;
}

function leesStand(string $html): ?array
{
    $opgehaald = null;
    $doel      = null;
    $donaties  = 0;

    if (preg_match('/class="[^"]*amountDonated[^"]*"[^>]*>\s*(?:&euro;|€)\s*([\d.,]+)/u', $html, $m)) {
        $opgehaald = naarBedrag($m[1]);
    }
    if (preg_match('/van\s*(?:&euro;|€)\s*([\d.,]+)\s*ingezameld/u', $html, $m)) {
        $doel = naarBedrag($m[1]);
    }
    if (preg_match('/(\d+)\s*donaties?/u', $html, $m)) {
        $donaties = (int) $m[1];
    }

    if ($opgehaald === null || $doel === null || $doel <= 0) {
        return null;
    }

    return [
        'opgehaald'    => $opgehaald,
        'streefbedrag' => $doel,
        'donaties'     => $donaties,
        'percentage'   => round($opgehaald / $doel * 100, 1),
        'bijgewerkt'   => gmdate('Y-m-d\TH:i:s\Z'),
    ];
}

// Verse cache? Dan die teruggeven.
if (is_readable($cacheBestand) && (time() - filemtime($cacheBestand)) < $bewaartijd) {
    readfile($cacheBestand);
    exit;
}

$html  = haalPaginaOp($widgetUrl);
$stand = $html !== null ? leesStand($html) : null;

if ($stand !== null) {
    $json = json_encode($stand, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    // Lukt schrijven niet, dan werkt de pagina nog steeds; alleen wordt er
    // dan bij elk bezoek opnieuw opgehaald.
    @file_put_contents($cacheBestand, $json, LOCK_EX);
    echo $json;
    exit;
}

// Ophalen mislukt. Liever een verouderde stand dan geen stand, mits die
// niet te oud is; main.js verbergt de balk zelf bij gegevens ouder dan 24 uur.
if (is_readable($cacheBestand)) {
    readfile($cacheBestand);
    exit;
}

http_response_code(503);
echo json_encode(['fout' => 'stand niet beschikbaar']);
