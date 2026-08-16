# CWAN Data Grid — presentation deck

A self-contained HTML deck for the 20-minute Component Bridge Task presentation, built in the
same design system as the portfolio deck (`~/Documents/Portfolio/index.html`): 16:9 stage,
thumbnail navigator, chapter accents, dark theme with a light toggle.

## Present

```bash
open /Users/gulshan/Documents/CWAN/Presentation/index.html
```

| Key | Action |
| --- | --- |
| `→` `↓` `space` `j` | Next slide |
| `←` `↑` `k` | Previous slide |
| `Home` / `End` | First / last slide |
| `N` or `S` | Toggle **speaker notes** (also the note button in the HUD) |
| `F` | Fullscreen |
| `P` | Print / export to PDF |
| click a screenshot | Lightbox · `Esc` closes |

The HUD carries a live thumbnail of every slide — click to jump. Thumbnails are grouped by
chapter, and each chapter has its own accent hue (why → cyan, Figma → amber, Storybook →
violet, Claude Code → green, wrap-up → pink). The sun/moon button switches to light mode for
a bright room. The URL carries the slide slug (`index.html#drift`), so you can deep-link or
reload without losing your place.

**Fonts and icons load from Google Fonts and unpkg** — same as the portfolio deck. Offline the
deck still works; it falls back to system type and the HUD icons go blank.

## The two Figma screenshots

Two slots are intentionally empty — Figma pages can't be captured headlessly. Export each page
as a PNG into `assets/` with these exact names:

| File | Slide | What to capture |
| --- | --- | --- |
| `assets/figma-components.png` | 7 · Built to resist breaking | *Data Grid Components* page — component sets and variant matrices |
| `assets/figma-examples.png` | 9 · Responsive behaviour | *Examples* page — desktop / tablet / mobile frames |

Until then each shows a labelled drop zone naming the path. Nothing else needs changing — the
image appears automatically once the file exists. (The *Spec & M3 Audit* page has no still; it's
covered in the live demo on slide 6.)

## Screenshots of Storybook and the app

Already captured in `assets/`. To refresh after either deployment changes:

```bash
bash /Users/gulshan/Documents/CWAN/Presentation/capture.sh
```

## Export a PDF backup

Press `P` (or ⌘P) → **Save as PDF**, landscape, margins **None**, **Background graphics** on.
Each slide prints on its own page. Worth doing the morning of the panel as a fallback.

## Structure — 20 slides against the panel's five windows

| Slides | Window |
| --- | --- |
| 1 | Title |
| 2–5 | **Minutes 1–4 · The why** — reference screen, M3 audit, token strategy, density |
| 6–9 | **Minutes 5–9 · Figma architecture** — live-demo cover, components, properties, responsive |
| 10–13 | **Minutes 10–13 · Storybook & handoff** — the contract, prop↔Control map, states, accessibility |
| 14–16 | **Minutes 14–17 · Claude Code** — the prompt, where it drifted, guardrails |
| 17–19 | **Minutes 18–20 · Wrap-up** — lessons & trade-offs, one template, thank you |
| 20 | **Appendix** — a neutral slide to sit on during Q&A |

Speaker notes carry the narration and a per-slide time budget, including a 3-minute script for
the live Figma demo (slide 6), a 90-second Storybook demo (slide 10), and likely Q&A answers on
the last slide.
Edit the text inside any `<div class="notes">` block to make it yours.
