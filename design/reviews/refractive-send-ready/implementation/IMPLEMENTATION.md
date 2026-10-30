# Refractive Engine implementation

Base: `origin/main` at `0a7783d06b6403eaaddc0d53cb0534c00d88b77a`.
Implementation branch: `codex/refractive-polish`. Delivery target: `main`, with Refractive Engine retained as the default `/` route and the legacy draft URLs redirected to it.

The home leads with delivery across web, backend and mobile, a real Offday screen, and interactive interface/server/data explanations. The particle field is quieter behind the introduction. Backend evidence and the AI workflow are separate reading sections. The project index remains visible; optional Lab exploration is a disclosure.

Offday, LeakScan and the care platform have decision stories with context, decisions, evidence and limits. New assertions are sourced in CONTENT.md section 11. Offday is explicitly co-built and an MVP; LeakScan retains its name and pre-launch status. Care backend facts come from previously approved portfolio content because the original Laravel repository was not available. The 16-to-2 query example applies to one report, not the entire system.

The LeakScan Free check screenshot was refreshed from its main commit `fb78c2c` on 2026-10-30. The current card shows individual check results instead of the old layer diagram. See `../leakscan-free-check-refresh.json` for capture provenance and `leakscan-free-check-updated.jpg` for the implemented case view.

## Verification

- Production build passes.
- Targeted lint passes with four pre-existing React warnings in AreaMap/Draft; no new warnings.
- `git diff --check` passes.
- Portfolio production checker passes at 1440 x 900 and 390 x 844: zero layout shift in these runs, scroll frame p95 16.8 ms desktop / 16.8 ms phone, and reduced-motion animation-frame activity 0/s. Headless measurements are indicative, not physical-device GPU validation. Desktop and phone intro frame p95 was 16.8 ms in the final pre-push run.
- Manually exercised layer selection, Offday navigation and return, all three decision stories, visible index, optional Lab, and legacy URL query/hash preservation. Checked narrow-screen overflow.
- Image density exceptions retain the available original store screenshots. Familiar navigation labels and technical project metadata are intentional checker exceptions. See report.md for the exact allowances and measurements.

## Tradeoffs

Graphics and optional exploration now load separately from the initial interface. The homepage still has a broad visible project index, as requested; it is a long page. The largest desktop introduction can still produce slower startup frames than steady scrolling. The new implementation reuses the existing Archivo file and does not include the concurrent font-subsetting commits.

The original checkout and its other sessions' work were preserved. The review images show the implemented production build, not a generated concept.
