# About Me in Extras Panel

## Goal

Add a full-height About Me column to Extras: short bilingual blurb, editable hobbies placeholders, and affiliation rows (Victoria Park CI / IB, University of Waterloo, Vivid Seats) with local logo assets. Desktop: left of the mountain video. Mobile: stacked above the video.

## Current state

- Desktop `client/src/panels/ExtrasPanel.jsx`: Spotify | Socials over MAL | TMDB, then a full-height 9:16 video, separated by gray `1px` rules.
- Mobile `client/src/mobile/ExtrasPanel.jsx`: vertical stack of Spotify → TMDB → MAL → Socials → video.
- Intro already has a welcome blurb; About Me is a separate, deeper bio block in Extras.
- Logos for IB / Waterloo / Vivid Seats are not in the repo yet.

## Decisions

| Topic | Choice |
| --- | --- |
| Layout approach | Editorial column (title → blurb → hobbies → affiliations) |
| Desktop placement | Between extras grid and video, full viewport height |
| Width | Wider than a single MAL/TMDB half (~420–520px), not flex-grow into leftover space |
| Mobile | Same content stacked above the video |
| Blurb | New bilingual draft, Intro-adjacent tone; not education-only |
| Hobbies | Placeholder lines for the author to fill later |
| Logos | Download from the web into `client/public/assets/logos/`; IB mark for Victoria Park CI; Waterloo + Vivid Seats marks; muted/monochrome treatment |
| Data | Shared constants consumed by desktop + mobile components |

## Scope

**In scope**

- `AboutMeComponent` for desktop and mobile.
- Wire into both Extras panels.
- Shared about-me constants (blurb, hobbies placeholders, affiliations).
- Logo files under `client/public/assets/logos/`.
- Font subset regen if new `font-sh` / `font-tsm` CJK glyphs are introduced.

**Out of scope**

- Changing Intro’s existing about copy.
- Live data / CMS for bio content.
- Brand-color logo treatments or external hotlinking of logos.
- Implementation plan markdown files.

## Layout

### Desktop

```
[ Spotify | Socials ]
[ MAL     | TMDB    ] | About Me (full height) | video (9:16)
```

- Same gray vertical rules as existing Extras dividers.
- Column height: `h-screen` / `min-h-[800px]` aligned with the panel.
- Internal padding consistent with TMDB/MAL (`p-10`-class spacing).

### Mobile

- Insert About Me above the video (after Socials).
- Same section order; width full; height content-driven (not forced to `100vh` if that fights the vertical stack).

### Internal column (top → bottom)

1. Title: `ABOUT` + `关于我` (bilingual pattern like TOP TITLES / 最爱的影视).
2. Blurb: Chinese first (`font-sh`), then English (`bodoni-small`) — same order/emphasis as Intro.
3. Hobbies heading (`Hobbies` + `爱好`) + 2–3 placeholder lines (`—`).
4. Flex spacer so affiliations sit toward the bottom on desktop.
5. Affiliation rows: icon + primary label + optional secondary.

## Copy

**Chinese blurb**

> 你好，我叫姜昊周。我在多伦多写代码，也喜欢拍照、看片和画画。下面是一点关于我的事。

**English blurb**

> Nice to meet you — I'm Bryan. I write software in Toronto, and I care a lot about pictures, stories, and making things look right. Here's a little more about me.

**Hobbies**

- Section label: `Hobbies` + `爱好`.
- Content: placeholder lines only until the author edits constants.

**Affiliations**

| Logo asset | Primary | Secondary |
| --- | --- | --- |
| `ib.svg` (or png) | Victoria Park CI | IB Programme |
| `waterloo.svg` | University of Waterloo | |
| `vividseats.svg` | Vivid Seats | |

## Components & files

| Piece | Path |
| --- | --- |
| Desktop component | `client/src/components/AboutMeComponent.jsx` |
| Mobile component | `client/src/mobile/AboutMeComponent.jsx` |
| Shared data | export from `client/src/constants/data.js` (e.g. `ABOUT_ME`) |
| Desktop panel | `client/src/panels/ExtrasPanel.jsx` |
| Mobile panel | `client/src/mobile/ExtrasPanel.jsx` |
| Logos | `client/public/assets/logos/{ib,waterloo,vividseats}.{svg\|png}` |

No new APIs. Static content only.

## Visual notes

- Reuse existing type roles: large bilingual title, `font-sh` for Chinese body, `bodoni-small` for English.
- Affiliation rows: quiet horizontal rhythm; logos ~24–32px, muted (grayscale / reduced opacity) so they don’t overpower the column.
- No card chrome; dividers only where they match Extras (hairline borders if needed between affiliation rows).

## Font subsets

If the Chinese blurb (or hobby labels) introduce glyphs missing from Source Han / TSM subsets, regenerate per `CLAUDE.md` before shipping.

## Success criteria

- Desktop: About Me visible left of the video, full height, wider than neighboring extras cells.
- Mobile: About Me appears above the video with the same content.
- Blurb, hobby placeholders, and three affiliation rows with local logos render without layout overflow at `min-h-[800px]`.
- Author can edit hobbies / blurb in one constants place.
