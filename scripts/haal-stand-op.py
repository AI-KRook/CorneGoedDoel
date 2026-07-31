#!/usr/bin/env python3
"""
Haalt de actuele stand van de doneeractie op en schrijft die naar data/voortgang.json.

De widget van doneeractie.nl levert het opgehaalde bedrag, het streefbedrag en het
aantal donaties als gewone HTML. Dit script leest die pagina uit, zodat de website
een voortgangsbalk in de eigen huisstijl kan tonen.

Wordt automatisch uitgevoerd door .github/workflows/voortgang.yml.
Handmatig draaien kan ook:  python scripts/haal-stand-op.py
"""

import json
import pathlib
import re
import sys
import urllib.request
from datetime import datetime, timezone

ACTIE_ID = "121531"
WIDGET_URL = f"https://www.doneeractie.nl/widget/v2/{ACTIE_ID}/2"
UITVOER = pathlib.Path(__file__).resolve().parent.parent / "data" / "voortgang.json"


def haal_html(url: str) -> str:
    verzoek = urllib.request.Request(
        url, headers={"User-Agent": "CorneGoedDoel-voortgang/1.0"}
    )
    with urllib.request.urlopen(verzoek, timeout=30) as antwoord:
        return antwoord.read().decode("utf-8", errors="replace")


def naar_bedrag(tekst: str) -> float:
    """Zet een Nederlands bedrag als '1.234,56' om naar een float."""
    schoon = tekst.replace(".", "").replace(",", ".")
    return float(schoon)


def lees_stand(html: str) -> dict:
    opgehaald = re.search(
        r'class="[^"]*amountDonated[^"]*"[^>]*>\s*(?:&euro;|€)\s*([\d.,]+)', html
    )
    doel = re.search(r"van\s*(?:&euro;|€)\s*([\d.,]+)\s*ingezameld", html)
    donaties = re.search(r"(\d+)\s*donaties?", html)

    if not opgehaald or not doel:
        raise ValueError("Bedrag of streefbedrag niet gevonden in de widget-HTML")

    return {
        "opgehaald": naar_bedrag(opgehaald.group(1)),
        "streefbedrag": naar_bedrag(doel.group(1)),
        "donaties": int(donaties.group(1)) if donaties else 0,
    }


def main() -> int:
    try:
        stand = lees_stand(haal_html(WIDGET_URL))
    except Exception as fout:
        print(f"Ophalen mislukt: {fout}", file=sys.stderr)
        return 1

    if stand["streefbedrag"] <= 0:
        print("Streefbedrag is nul of negatief, dat kan niet kloppen", file=sys.stderr)
        return 1

    stand["percentage"] = round(stand["opgehaald"] / stand["streefbedrag"] * 100, 1)
    stand["bijgewerkt"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    UITVOER.parent.mkdir(parents=True, exist_ok=True)
    UITVOER.write_text(
        json.dumps(stand, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )

    aantal = stand["donaties"]
    print(
        f"€ {stand['opgehaald']:.2f} van € {stand['streefbedrag']:.2f} "
        f"({stand['percentage']}%), {aantal} {'donatie' if aantal == 1 else 'donaties'}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
