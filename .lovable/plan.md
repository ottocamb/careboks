
Goal
- Make the “Print for Patient” output consistently pure white (no grey band), even when starting a new case/file.

What’s happening (why it “comes back” on a new file)
- The grey you see is coming from screen-only preview styling:
  - Print preview page wrapper uses a grey background (`bg-[hsl(215,20%,95%)]`).
  - `.print-container` also uses a grey background in `@media screen`.
- In some browsers / print flows (especially depending on device + timing), the print engine can partially use “screen” styles when generating the PDF, so the grey preview background leaks into the output.
- When you start a new case, the page/layout is re-mounted and the print dialog may capture the “screen” state again, which is why it looks like it fixed once but then returns.

Solution (robust, works across browsers)
- Keep the grey background for on-screen preview (so the preview still looks nice).
- But force a “printing mode” class on the page right before calling `window.print()` and remove it after printing.
- In CSS, when this printing mode is active, override backgrounds + transforms + min-heights to guarantee white pages regardless of whether the browser honors `@media print` perfectly.

Implementation details

1) Add a dedicated wrapper class for print pages
Files:
- `src/pages/PrintPreview.tsx`
- `src/pages/PatientDocument.tsx`

Changes:
- Add a stable class on the outermost wrapper (example name: `print-page`).
  - PrintPreview currently: `<div className="min-h-screen bg-[hsl(215,20%,95%)]">`
  - PatientDocument currently: `<div className="min-h-screen bg-muted">`
- Update both to include `print-page` so we can reliably target and override their backgrounds during printing.

2) Add “before/after print” handling to force print-safe styling
Files:
- `src/pages/PrintPreview.tsx`
- `src/pages/PatientDocument.tsx`

Changes:
- Add event listeners:
  - `beforeprint`: add a class to `<html>` (example: `is-printing`)
  - `afterprint`: remove it
- In the existing `handlePrint` function:
  - Add `document.documentElement.classList.add('is-printing')`
  - Trigger `window.print()` using a tiny timeout (e.g. 50–100ms) so the browser applies the class before it snapshots layout.
  - Rely on `afterprint` to clean up.

This ensures correctness even if `@media print` is flaky on a particular device/browser.

3) Extend print.css so white background is enforced in both print modes
File:
- `src/styles/print.css`

Changes:
A) Keep your existing `@media print { ... }` rules, but add page-wrapper coverage:
- Ensure `.print-page` is white in print:
  - `background: white !important;`
  - `min-height: auto !important;` (prevents `min-h-screen` from creating a tall grey block)

B) Add a second set of overrides for when `html.is-printing` is present (works even if the browser applies screen media during print):
- `html.is-printing, html.is-printing body, html.is-printing #root { background: white !important; }`
- `html.is-printing .print-page { background: white !important; min-height: auto !important; }`
- `html.is-printing .print-container { background: white !important; min-height: auto !important; transform: none !important; }`
- `html.is-printing .print-document { background: white !important; transform: none !important; box-shadow: none !important; }`
- `html.is-printing .print-content-grid { background: white !important; }`

This targets the real sources of the grey:
- The page wrapper background
- The `.print-container` screen background
- Any leftover scaling transforms

Verification steps (what you’ll do after I implement)
1) End-to-end test (important)
- Create a brand new case/file → go to Print Preview → click “Print for Patient” → save as PDF.
- Confirm there is no grey band on any page.

2) Regression checks
- Repeat the same flow for a second new case (this is where you currently see it “come back”).
- Test in at least one additional browser (Chrome + Safari/Edge if possible).

3) Visual confirmation
- On-screen preview should still have the grey surrounding background (that’s fine).
- Printed/PDF output should be fully white outside the cards and keep the intended colored card borders/footer.

Scope / files to be edited
- `src/pages/PrintPreview.tsx` (add `print-page` class, add before/after print handling, adjust `handlePrint`)
- `src/pages/PatientDocument.tsx` (same)
- `src/styles/print.css` (add `.print-page` print overrides + `html.is-printing ...` overrides)

Risks & mitigations
- Risk: `afterprint` isn’t reliably fired on some mobile browsers.
  - Mitigation: still remove the class on component unmount, and optionally also remove it with a fallback timeout (e.g., 5–10 seconds) if needed.
- Risk: Overriding too broadly could accidentally remove intended colors.
  - Mitigation: Only force white on wrappers/containers; keep section card styling untouched.

Expected outcome
- The grey area will stop reappearing when you start a new file because printing no longer depends on the browser correctly switching to `@media print`; we explicitly force the print-safe state.
