# RPB Engineering Portfolio

Interactive React + TypeScript prototype for the interview story **From Troubleshooting to Team Success**. The current pass is intentionally compact and keyword-led, with two STAR cases.

## Start locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Structure

```text
src/
  App.tsx              seven keyword-led story sections and interaction components
  data/story.ts        replaceable story copy and keyword data
  styles.css           Swiss × Engineering visual system and responsive layout
```

The current prototype keeps the data layer in `src/data/story.ts` and the interaction modules in `src/App.tsx`. The content structure is documented in `STRUCTURE-TREE.md`.

## Interactive coverage

- Explore / Presentation mode toggle
- Presentation mode previous / next controls, keyboard arrows, Home, End, and chapter rail
- Clickable capability tags
- Compact keyword cards on every Task, Action, and Result section
- Result buttons for operation variable, observation, change, and outcome
- Separate Overflow STAR and Team STAR cases
- Clear contribution boundary between my work and the student’s research and award
- Reduced-motion fallback and visible keyboard focus states

## Replaceable research data

- Replace section copy and keyword cards in `src/data/story.ts`.
- Replace the conceptual hero RPB drawing after the confirmed equipment drawing is available.
- Keep the `Conceptual` label until the equipment drawing is confirmed.

## Evidence boundary

The prototype uses only confirmed project material for the narrative. The overflow root cause is presented as a hypothesis boundary. The student’s report and competition award are displayed as the student’s outcome.

## Offline single-file packaging

Use `npm run build` to produce `rpb-engineering-portfolio.html` in the project root. This file embeds the built CSS, JavaScript, and PNG images so it can open directly with `file://` on another device.

The packaging script in `scripts/make-single-file.mjs` must replace `</script>` sequences inside the bundled JavaScript with escaped forms. A plain string replacement can also interpret `$` sequences in the bundled code, so HTML replacements use callback functions. Without these safeguards, Safari may display the source code instead of rendering the page.

The Vite `dist/index.html` build still expects a local HTTP server because browser module loading from `file://` is restricted. Use the single-file HTML for direct double-click opening.
