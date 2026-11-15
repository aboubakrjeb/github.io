# Chamali Web Solutions – zakelijke one-pager

Statische bedrijfswebsite van Chamali Web Solutions (webbureau van Aboubakr Jebbari, Rotterdam), live op https://chamaliwebsolutions.nl/.
Gewone HTML, CSS en JavaScript, zonder dependencies. De enige build-stap is een klein Node-script dat de Engelse en Arabische pagina's maakt.

## Draaien
```
node tools/build-i18n.mjs     # maakt en/index.html en ar/index.html
python3 -m http.server 8000   # daarna http://localhost:8000, /en/ en /ar/
```

## Structuur
- `index.html`: de Nederlandse one-pager en meteen de bron voor de andere talen.
  - Secties: hero, diensten, werkwijze, projecten, pakketten, over, contact, footer.
  - **Pakketten** bestaat uit drie delen:
    - een budgetslider, die JS zichtbaar maakt
    - drie bouwpakketten (Basis, Webshop, Maatwerk)
    - het blok "Optioneel: onderhoud & hosting"
- `en/index.html`, `ar/index.html`: **gegenereerd**, niet met de hand aanpassen. Ze staan in `.gitignore`; de deploy-workflow maakt ze opnieuw.
- `js/i18n.js`: alle teksten in nl, ar en en (`translations`). De waarden zijn HTML.
- `js/app.js`: thema-toggle, taalmenu, offcanvas-menu, voor/na-slider, budgetslider, actieve nav-link, en het jaartal in de footer.
- `tools/build-i18n.mjs`: maakt `/en/` en `/ar/` uit `index.html` en `js/i18n.js`.
  - Het script stopt bij een ontbrekende vertaling.
  - Het waarschuwt als de Nederlandse tekst in `index.html` afwijkt van `i18n.js`.
- `css/style.css`: alle stijlen. De tokens voor licht/donker staan bovenaan in `:root` en `:root[data-theme="dark"]`.
- `fonts/`: self-hosted woff2-bestanden met hun OFL-licenties.
- `img/`: web-klare beelden.
  - `og-image.jpg` (1200×630) is de deelafbeelding voor social media.
  - `logo-512.png` is het logo voor de JSON-LD.
  - De projectscreenshots staan ook als decoratie in de hero.
- Brandkit-bestanden in de root:
  - `favicon.ico`, `icon.svg`, `apple-touch-icon.png`
- SEO-bestanden in de root:
  - `robots.txt` en `sitemap.xml`
  - `google48f6128cf8fbf01c.html`: Search Console-verificatie, **niet verwijderen**
  - `CNAME`
- `.github/workflows/static.yml`: bouwt de taalpagina's en deployt naar GitHub Pages bij elke push naar `main`.
- `assets/`: **bronmateriaal, niet aanpassen en niet in git** (staat in `.gitignore`).
  - `Chamali-Brand-Kit/`: de brandkit, met `HOW-TO-USE.txt` als richtlijn
  - `afp/`: kopie van de assets van het oude portfolio

  Heb je een nieuw beeld nodig? Maak het web-klaar (webp, beperkte maat) en zet het in `img/`.

## Teksten aanpassen
1. Pas de Nederlandse tekst aan in `index.html` **en** in `translations.nl` in `js/i18n.js`.
2. Pas dezelfde sleutel aan in `ar` en `en`.
3. Draai `node tools/build-i18n.mjs` en controleer dat er geen waarschuwingen zijn.

Wat er in de `<head>` per taal verandert, regelt het build-script:
- title, description, og/twitter-teksten, `og:locale`
- canonical en `og:url`
- `lang`/`dir`, en `aria-current` in het taalmenu

Houd die head-tags elk op één regel, anders vindt het script ze niet.

## Huisstijl
- **Uitstraling: zakelijk.** De eigenaar wil een professionele bedrijfssite, geen culturele.
  - Geen zellige-patronen, sterdecoraties, Arabische slogan of Hijri-jaar op de site.
  - De Marokkaanse roots komen alleen terug in het logo en in de uitleg van de naam bij "Over ons".
- Kleuren:
  - Merkkleuren: rood `#B3121E` (hoofdkleur), donkerrood `#8F0C16`, groen `#0B5440`, crème `#FAF7F0`, goud `#F2C45A`.
  - Mix van rood en groen, zodat het niet eentonig wordt:
    - rood is het hoofdaccent: knoppen, links en labels
    - groen is de tweede kleur: de Werkwijze-band, de dienst-icoontjes en de vinkjes
  - Licht thema: wit en warm grijs (`--bg-alt: #F6F5F2`), donkere tekst `#16181D`.
  - Donker thema: diepgroen (`#0D3B30`), crème tekst en goud voor tekstaccenten.
  - Geen zwart of antraciet: de eigenaar vindt dat deprimerend.
  - Goud staat in het logo en is het accent in het donkere thema.
- Thema: de site opent altijd licht en volgt `prefers-color-scheme` bewust niet. Donker kan alleen via de ◐-knop en wordt dan bewaard in `localStorage`.
- Fonts:
  - Plus Jakarta Sans (variabel, 200–800): alle tekst en koppen
  - IBM Plex Sans Arabic (400 en 700): Arabische tekst, via `unicode-range`
  - Fraunces Black en Unbounded Medium: alleen het woordmerk "Chamali / WEB SOLUTIONS". Unbounded is gesubset zonder `locl`, anders wordt "IJ" de ligatuur Ĳ.
- Het logo-icoon is een inline `<symbol id="chamali-star">`. De kleuren stel je in met `--star-outer`, `--star-inner`, `--star-line`, `--star-line-opacity` en `--star-glyph`.
- Secties:
  - De hero is licht.
  - De werkwijze is groen (`.band-green`). In het donkere thema, dat al groen is, wordt die donkerrood.
  - Het contactblok is in beide thema's rood (`.band-red`).
- De brandkit heeft een slogan (`كود بنكهة شمالية، الخاوا!`), maar die staat bewust niet op de site.

## Regels
- **Talen en SEO:**
  - Elke taal heeft een eigen URL: `/` (nl, ook x-default), `/en/` en `/ar/`, met hreflang-links in de head en in `sitemap.xml`.
  - Er is geen automatische taal-redirect.
  - Voeg je een sectie of pagina toe? Werk dan ook `sitemap.xml` (`lastmod`) bij.
- **RTL:**
  - Gebruik logische CSS-eigenschappen (`inset-inline-*`, `margin-inline-*`, `text-align: start`).
  - Gebruik geen letter-spacing of `text-transform` op Arabische tekst (zie het blok `[dir="rtl"]`).
- **Privacy:**
  - Laad niets van externe CDN's en geen Google Fonts.
  - De JSON-LD bevat alleen bedrijfsgegevens, geen persoonsgegevens.
  - LinkedIn: de bedrijfspagina (`linkedin.com/company/chamali-web-solutions/`) hoort in het contactblok, de footer en de JSON-LD. Het persoonlijke profiel staat alleen op de kaart van de oprichter.
- **Stem:** het merk voorop ("we", aanspreekvorm "je"). Alleen het citaat van de oprichter staat in de ik-vorm.
- **Prijzen** (inclusief btw):
  - bouwpakketten: Basis vanaf €250, Webshop vanaf €500, Maatwerk vanaf €750, eenmalig
  - onderhoud: €50 en €100 per maand

  Ze staan op vier plekken. Pas ze altijd overal aan:
  - de HTML
  - `js/i18n.js` (drie talen)
  - `BUDGET_TIERS` in `js/app.js`
  - de `hasOfferCatalog` in de JSON-LD in `index.html`
- **Telefoon**: `06 38 61 35 18`, link `tel:+31638613518`. Het nummer zelf staat niet in `i18n.js`.
  - Het staat op vijf plekken: de header, de hero, het contactblok, de footer en `telephone` in de JSON-LD.
  - Zet het nummer altijd in een element met `dir="ltr"`, anders draait de Arabische pagina de cijfergroepen om.

## Deploy
- **Repo**: `github.com/aboubakrjeb/github.io`, branch `main`.
- **Automatisch**: een push naar `main` deployt automatisch via GitHub Actions naar https://chamaliwebsolutions.nl/.
- **Geschiedenis**: de geschiedenis van het oude portfolio staat nog in de repo, in de commits vóór deze site.
- **Lokaal portfolio**: de lokale map `~/Desktop/claude-code-projecten/portfolio/` is een aparte kopie van dat portfolio. Die blijft ongemoeid.

## Open punten
- **KvK-nummer:** dat is verplicht op een NL-bedrijfssite. In de footer staat een TODO-commentaar.
