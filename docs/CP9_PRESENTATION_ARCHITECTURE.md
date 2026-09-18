# CP9 Presentation Architecture / Design-Swappability Audit

Status: implementation in progress; runtime/visual validation and the final design-swap proof remain pending owner validation.

## Target boundary

The CP9 target is not a runtime theming product. It is a compact presentation boundary that lets MIZAN change visual direction through app-local semantic tokens, justified shared primitives, the navigation/layout shell, and feature composition without changing `packages/core`, application intelligence/data contracts, Supabase/data-access, or provider adapters.

The audit deliberately rejects wrapper pyramids, generic component factories, styling DSLs, and a catch-all theme framework.

## Shared foundation now present

`apps/app/src/constants/theme.ts` now centralizes the repeated global visual decisions that were previously partly embedded in components/screens:

- semantic light/dark palette roles, including `onAccent` rather than screen/component hard-coded foreground colors;
- spacing and radius scales;
- typography roles (`display`, `title`, `body`, `label`, `caption`, `control`);
- standard touch/control heights and border width;
- interaction opacity values for pressed/disabled states;
- content width, compact/wide breakpoints, and responsive screen padding through `Layout`.

Compatibility aliases for the prior max-width/breakpoint exports are temporarily retained so CP9 can migrate screens incrementally instead of forcing an unrelated whole-app rewrite.

## Shared primitives now present

`apps/app/src/components/mizan-ui.tsx` owns only demonstrated recurring semantics:

- `MizanText`
- `Card`
- `MizanTextInput`
- `PrimaryButton`
- `SecondaryButton`, with a compact pill form for recurring top-level navigation controls
- `ChoiceChip`

These primitives consume the semantic theme tokens rather than owning independent copies of typography, control heights, pressed/disabled opacity, or accent foreground color.

`apps/app/src/components/screen.tsx` now consumes the shared `Layout` rules for max content width, compact/wide breakpoints, and horizontal padding.

## Representative screen audit

### Life Map

Before this CP9 slice, Life Map duplicated a local primary action style, a local pill-style back control, pressed opacity values, radii/control heights, and a hard-coded white accent foreground. The screen now uses `PrimaryButton` and compact `SecondaryButton` while keeping feature-specific domain/metric composition local. Metric separators still consume the semantic palette border role, which is a feature-level composition use rather than a duplicated global design system.

### WHY

WHY had the same duplicated primary action and pill-back control pattern as Life Map. Those controls now use the same shared primitives. Factor-card evidence rows remain local because their composition is specific to the WHY surface; their separator color still comes from the semantic palette.

### Check-in (interaction-heavy proof surface)

Check-in already used `PrimaryButton` and `ChoiceChip`; its duplicated secondary navigation control has now moved to `SecondaryButton`. Its rating/scale composition remains local. This preserves the distinction between reusable visual semantics and feature-specific interaction composition.

### Today

Today now uses the shared `PrimaryButton` for One Move acceptance and feedback submission, `SecondaryButton` for alternative/defer/decline controls, and `MizanTextInput` for the reflection note. The remaining Link-backed settings/check-in controls stay local because Expo Router `Link asChild` owns their navigation behavior, but their control heights, border width, pressed opacity, and accent foreground now consume semantic tokens instead of local magic values. The usefulness rating stays feature-local because it is a numbered outcome scale rather than a general navigation/action primitive, while its sizing/border/interaction treatment also uses semantic control tokens.

Recommendation selection, decision persistence, feedback persistence, confidence/evidence display, and state composition remain in the Today/application layers. No recommendation/business behavior was moved into generic UI components.

## Current design-swap assessment

The global visual levers for palette, typography, control sizing, spacing/radii, interaction opacity, and responsive screen layout are now centralized across the representative Today, Life Map, WHY, and Check-in surfaces. The representative screens demonstrate that repeated control/input treatment can move behind app-local primitives without changing `packages/core`, application intelligence/data contracts, Supabase/data-access, or provider adapters.

This is **not yet the final CP9 design-swap proof**. A substantially different visual direction still needs owner-side visual/runtime review; workers must not claim that runtime proof from static implementation inspection alone.

## Remaining CP9 slices

1. Audit remaining primary screens for screen-local hard-coded colors, typography sizes, standard radii/control heights, and repeated pressed/disabled values; leave feature geometry/visualization math local.
2. Audit responsive behavior at narrow phone, common phone, tablet portrait/landscape, and wide web widths when owner runtime/visual validation is available.
3. Audit Arabic RTL mirroring/alignment, semantic icon direction, truncation, dynamic type, keyboard/focus behavior, screen-reader labels, and light/dark treatment.
4. Complete the TASK-required design-swap proof on Today, Life Map, WHY, and the interaction-heavy Check-in flow during owner visual/runtime validation, documenting the substantially different visual direction without keeping duplicate production themes.

## Verification policy

No app tests, builds, typechecks, browser/device visual runs, database scripts, cloud CI, or GitHub Actions were executed by workers for this CP9 slice because the active task policy reserves execution-dependent gates for owner validation. The architectural audit and code changes are implementation evidence only, not runtime-pass claims.
