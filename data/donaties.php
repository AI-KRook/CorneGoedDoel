<?php
/**
 * Geeft de laatste donaties met een persoonlijk bericht als JSON.
 *
 * De donatielijst van UM Crowd zit achter frontend-api.kentaa.nl en vereist de
 * header X-Site-Id. Die API stuurt geen CORS-headers mee, dus de browser mag
 * hem niet rechtstreeks aanroepen. Vandaar deze omweg via de server.
 *
 * De totalen op de site komen wel rechtstreeks uit de browser; alleen deze
 * lijst heeft PHP nodig. Draait er geen PHP, dan blijft het blok verborgen.
 */

$siteId    = 'mH9ARTHYekJu';
$actieId   = 'MAYDrxYe6fKK';
$aantal    = 3;
$bewaartijd = 600;                                    // seconden
$cache     = __DIR__ . '/donaties-cache.json';
$api       = 'https://frontend-api.kentaa.nl/donations?action_id=' . $actieId;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=300');

function haalOp(string $url, string $siteId): ?string
{
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT        => 15,
            CURLOPT_HTTPHEADER     => ['X-Site-Id: ' . $siteId, 'Accept: application/json'],
            CURLOPT_USERAGENT      => 'CorneGoedDoel-donaties/1.0',
        ]);
        $inhoud = curl_exec($ch);
        $code   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return ($inhoud !== false && $code === 200) ? $inhoud : null;
    }

    if (ini_get('allow_url_fopen')) {
        $ctx = stream_context_create(['http' => [
            'timeout' => 15,
            'header'  => "X-Site-Id: $siteId\r\nAccept: application/json\r\n",
        ]]);
        $inhoud = @file_get_contents($url, false, $ctx);
        return $inhoud !== false ? $inhoud : null;
    }

    return null;
}

// Verse cache? Die teruggeven.
if (is_readable($cache) && (time() - filemtime($cache)) < $bewaartijd) {
    readfile($cache);
    exit;
}

$ruw = haalOp($api, $siteId);
$data = $ruw !== null ? json_decode($ruw, true) : null;

if (is_array($data) && isset($data['data']) && is_array($data['data'])) {
    $uit = [];
    foreach ($data['data'] as $d) {
        $bericht = trim((string) ($d['message'] ?? ''));
        if ($bericht === '') {
            continue;                                  // alleen donaties met een bericht
        }
        $uit[] = [
            'naam'    => trim((string) ($d['name'] ?? 'Anoniem')),
            'bedrag'  => (float) ($d['amount'] ?? 0),
            'bericht' => $bericht,
            'datum'   => (string) ($d['created_at'] ?? ''),
        ];
        if (count($uit) >= $aantal) {
            break;                                     // de API levert nieuwste eerst
        }
    }

    $json = json_encode(['donaties' => $uit], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    @file_put_contents($cache, $json, LOCK_EX);
    echo $json;
    exit;
}

// Ophalen mislukt: liever de laatst bekende lijst dan niets.
if (is_readable($cache)) {
    readfile($cache);
    exit;
}

http_response_code(503);
echo json_encode(['donaties' => []]);
