# CP9 Design-Swap Runtime Proof Procedure

Status: procedure prepared; **runtime proof has not been executed**. The production visual direction remains the owner-approved calm MIZAN design.

## Purpose

CP9 requires evidence that MIZAN can adopt a substantially different visual direction through the presentation boundary without changing core intelligence, application/data contracts, Supabase/data-access, or provider infrastructure. This proof is deliberately temporary: it must not create a second production theme, runtime theme engine, or speculative abstraction.

## Required proof surfaces

The runtime comparison must cover:
- Today;
- Life Map;
- WHY;
- Check-in in an interaction state, not only its untouched initial state.

Use the existing `npm run test:e2e:visual` matrix for production-direction evidence. Its Check-in capture selects a local Energy rating without saving it, so the evidence includes a real interaction state without mutating backend data.

## Allowed temporary swap boundary

For the temporary owner-side proof, changes may touch only presentation-owned files when needed, principally:
- `apps/app/src/constants/theme.ts`;
- `apps/app/src/components/mizan-ui.tsx`;
- `apps/app/src/components/screen.tsx`;
- `apps/app/src/components/app-navigation.tsx`;
- `apps/app/src/components/app-icon.tsx`;
- `apps/app/src/components/branded-illustration.tsx`;
- feature-local composition in `today.tsx`, `life-map.tsx`, `why.tsx`, and `check-in.tsx` only when the alternate visual composition genuinely requires it.

The proof must show **no edits** to:
- `packages/core/**`;
- application intelligence/data contracts under `apps/app/src/application/**`;
- Supabase/data-access or migrations/functions;
- integration/provider contracts/adapters;
- persisted schema or business/scoring rules.

## Deliberately different direction

The temporary direction must be visibly substantial, not a one-color tweak. A valid proof can combine changes such as:
- a more editorial/structured typography hierarchy;
- materially different spacing density and card/surface treatment;
- squared or substantially changed radius language;
- a distinct accent/neutral palette through semantic tokens;
- a different navigation emphasis and icon/surface presentation using the existing shell;
- changed feature composition on the four proof surfaces while preserving the same data and actions.

Do not change labels, evidence semantics, unknown handling, recommendation logic, chart values, accessibility meaning, or persistence merely to make the swap look different.

## Owner-side execution sequence

1. Start from the exact current production commit and record its SHA.
2. Run/capture the normal production visual evidence first with persisted-English and persisted-Arabic completed fixtures.
3. In a disposable local validation copy or temporary validation commit, apply the substantially different visual direction **only** inside the allowed presentation boundary above.
4. Re-run the same Today/Life Map/WHY/Check-in evidence widths and both locales; include light/dark if both remain shipped.
5. Inspect the alternate direction visually and interact with Check-in by selecting a rating without saving; verify routing, labels, known/unknown semantics, radar values, and actions remain the same product behavior.
6. Record `git diff --name-only <production-sha>..<swap-sha-or-working-tree>` (or equivalent owner evidence) and confirm no forbidden core/application/data/provider path changed.
7. Discard/revert the temporary alternate direction. The owner-approved production visual direction remains the shipped source; do not keep duplicate production themes solely for this proof.
8. Record the proof result in `docs/PROJECT_STATE.md`: production SHA, temporary proof identifier, changed presentation files, representative evidence locations, locales/viewports inspected, and confirmation that no forbidden boundary changed.

## Acceptance conditions

The design-swap proof passes only when all of the following are true:
- the alternate direction is visibly substantial on all four required surfaces;
- Today, Life Map, WHY, and an interacted Check-in remain usable and semantically equivalent;
- Arabic RTL and English remain intentional rather than merely mirrored mechanically;
- missing evidence remains unknown and no chart/meter fabricates values;
- accessibility labels, touch/focus behavior, and reduced-motion expectations remain intact;
- the diff contains presentation-boundary changes only;
- the temporary visual direction is removed after evidence is recorded.

A source-code architecture review, screenshot-harness presence, or simple palette substitution alone is **not** the required runtime proof.
