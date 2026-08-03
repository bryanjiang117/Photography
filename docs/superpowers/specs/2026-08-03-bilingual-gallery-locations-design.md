# Bilingual Gallery Locations

## Goal

Make Mexico, China, and Japan gallery `location` labels consistently bilingual (`English · Local`), and fill missing broader geographic parts on Canada / China / Japan where the specific place is known.

## Current state

- Locations live as strings on gallery rows / per-photo overrides in `client/src/constants/data.js`.
- Hover overlay (`GalleryImage`) and lightbox (`GalleryLightbox`) render the string as-is with `bodoni-small` (Latin face; CJK falls back to system fonts).
- Depth and naming are uneven (e.g. Mexico neighborhoods vs one full `Mexico City, Mexico`; China `Chongqing` vs `Yangshuo, Guilin, Guangxi`; Japan city-only vs prefecture).

## Decisions

| Topic | Choice |
| --- | --- |
| Format | `English · Local` (middle dot ` · `, U+00B7) when the two sides differ; China / Japan always bilingual |
| Mexico bilingual | Only when English ≠ Spanish (e.g. `Historic Center · Centro Histórico`). Same-name places stay single (`Roma Norte`, `La Condesa`) |
| Mexico hierarchy | Place / neighborhood only — no “Mexico City” or country |
| Canada / China / Japan hierarchy | If a concrete place is known, include missing broader parts (city → province/prefecture). Keep vague labels (`Somewhere in …`) as-is |
| Canada language | English only |
| UI / fonts | No component changes in v1; accept system CJK fallback under Bodoni |

## Scope

**In scope**

- Update all Mexico, China, Japan `location` strings in `data.js` to bilingual form.
- Consistency renames where the same place is labeled differently (e.g. Garibaldi Plaza / Plaza Garibaldi; Baixiangju vs Baixiang Street Historical Scene).
- Fill missing hierarchy on Canada / China / Japan concrete places only.

**Out of scope**

- Changing overlay/lightbox layout or switching location typography to a CJK webfont.
- Regenerating font subsets (locations do not use `font-tsm` / `font-sh`).
- Inventing precise spots for vague “Somewhere in …” labels.
- Translating Canada locations.

## Label rules

1. **Shape:** `{english} · {local}` with a single space on each side of `·`.
2. **English side:** Keep existing English where good; add translated English for Spanish/CJK-primary names; keep established English landmark names (e.g. Atomic Bomb Dome, People's Park).
3. **Local side:**
   - Mexico → Spanish
   - China → Simplified Chinese
   - Japan → Japanese (kanji/kana as conventional for the place)
4. **Punctuation on each side:** Use that language’s normal list punctuation (English commas; Chinese `，`; Japanese `、` between place parts).
5. **Parentheticals:** Prefer incorporating meaning into English rather than nesting (e.g. `Ainoshima Cat Island, Fukuoka · 藍島、福岡` rather than English parentheticals inside the bilingual string), unless the nickname is essential.

## Examples

```
Northern Roma · Roma Norte
Historic Center · Centro Histórico
Medellín Market, Southern Roma · Mercado Medellín, Roma Sur
Chongqing · 重庆
People's Park, Chongqing · 人民公园，重庆
Yangshuo, Guilin, Guangxi · 阳朔，桂林，广西
Fukuoka · 福岡
Asakusa, Tokyo · 浅草、東京
Shichirigahama Beach, Kamakura, Kanagawa · 七里ヶ浜，鎌倉，神奈川
```

## Implementation notes

- Single-file data edit: `client/src/constants/data.js`.
- Update comment examples at the top of the file if they show monolingual Mexico/Japan samples.
- After edits, spot-check hover + lightbox on one photo per region for glyph fallback and line wrapping.

## Success criteria

- Every Mexico / China / Japan location uses `English · Local` (or is intentionally blank — none today).
- No Mexico label appends Mexico City / Mexico.
- Concrete Canada / China / Japan labels that previously omitted province/prefecture/city include those parts where known.
- Vague “Somewhere in …” labels unchanged in spirit (may stay English-only for Canada; China vague spots bilingual if already place-level).
