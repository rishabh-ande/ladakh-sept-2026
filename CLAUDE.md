# Ladakh, September 2026 — trip site

Two motorcycle itineraries for the same 11 days (2–13 Sept 2026), 5 riders, published as a static
site on GitHub Pages. The group is choosing between them; both pages are standalone.

## Files

| File | What it is |
|---|---|
| `index.html` | Neutral launcher. Links both plans, no persuasion. |
| `siachen.html` | **The Siachen Loop** — 1,644 km, includes Siachen Base Camp, no Tso Moriri. |
| `tso-moriri.html` | **The Tso Moriri Loop** — 1,646 km, includes Tso Moriri + Tso Kar, no Siachen. |
| `manifest.webmanifest`, `sw.js`, `icons/` | PWA. Installable on Android, works fully offline. |

No build step. Each page is ONE self-contained HTML file with an inline `<style>`. Edit the HTML
directly, commit, push — Pages redeploys in about a minute.

## Hard rules

1. **The two plan pages must stay standalone.** No comparison tables, no "Plan 1 of 2", no
   cross-links between them, no recommendation of one over the other. Each page describes only its
   own route. `Not covered` is the one place a page says what it omits, stated as fact.
2. **Nothing on these pages that isn't part of the itinerary.** No decision-making content.
3. Keep pages self-contained: no external JS/CSS. Google Fonts is the only allowed external origin.
4. `<meta name="robots" content="noindex,nofollow">` stays on every page.

## Design system — expedition poster + rally roadbook

Typefaces: **Anton** (display: h1, day numerals) · **Barlow Condensed** (headings, `.lede`) ·
**Source Serif 4** (body) · **IBM Plex Mono** (all data, labels, tables).

Colour is CSS custom properties only, theme-aware across **three** blocks that must stay in sync:
`:root` (light) · `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }` ·
`:root[data-theme="dark"]`.

Tokens: `--paper --surface --raised --sunken --ink --ink2 --muted --line --hair --hot --hot-ink
--hot-wash --danger --danger-wash --water --water-wash --poster-bg --poster-ink --poster-mut --poster-hot`

`--hot` is the bright fill yellow; `--hot-ink` is the darker text-weight amber. **Use `--hot-ink` for
anything with text-level contrast requirements** — `--hot` on light paper measures about 1.8:1 and is
unreadable.

## ⚠️ The trap that has bitten this repo

Both figures are hand-authored inline SVG that reference the CSS tokens via `var()`. A previous
restyle renamed the tokens (`--amber`→`--hot`, `--teal`→`--water`, `--red`→`--danger`) and **silently
destroyed both figures** — every `stroke="var(--amber)"` became invalid, so it resolved to `none` and
all roads, lakes and rivers vanished; every `fill` fell back to black and the map badges became blobs.
Nothing errored. It only showed up by looking.

**If you rename or remove a token, update the `var()` references inside the SVGs too.** Verify with:

```bash
python3 - <<'PY'
import re,glob
for f in glob.glob('*.html'):
    s=open(f).read()
    used=set(re.findall(r'var\((--[a-z0-9-]+)\)',s))
    defined=set(re.findall(r'(--[a-z0-9-]+)\s*:',s[:s.index('</style>')]))
    print(f, 'undefined:', used-defined or 'none')
PY
```

## Figures

**Figure 1** — schematic map. Real lon/lat, projected `x=(lon-76.5)*260+40`, `y=(35.05-lat)*260+40`,
viewBox `0 0 900 780`. Solid line = onward leg, dashed = out-and-back same day, red dashed = Umling La.
Rings = overnight stops, triangles = passes, solid teal diamond = petrol pump, hollow = loose petrol
only. Yellow badges are September dates. Labels are placed by a collision solver over a widening ring
of candidate positions, with leader lines when a label sits far from its dot.

**Figure 2** — altitude profile. Amber line = highest point reached that day, teal = where you sleep.
The gap between them is the acclimatisation argument; don't flatten it.

**Per-day roadbook strip** — elevation sparkline, surface bar (tarmac / gravel / water crossings) and
fuel gauge with the longest dry run called out. All generated from that day's real numbers; if you
change a distance or a fuel stop, update the strip to match or it will contradict the prose.

## Checks before pushing

- No undefined `var()` (script above)
- SVGs still parse: `python3 -c "import re,xml.etree.ElementTree as ET;[ET.fromstring(s) for f in __import__('glob').glob('*.html') for s in re.findall(r'<svg.*?</svg>',open(f).read(),re.S)]"`
- No horizontal page scroll (the full-bleed masthead uses `100vw`; `html,body{overflow-x:clip}` is what keeps it in check)
- Distances and dates in the prose, the map, and the roadbook strips still agree with each other
