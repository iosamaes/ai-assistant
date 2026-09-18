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

Today remains the largest presentation-consolidation target. It still contains several local action/control treatments for One Move decisions, alternative actions, ratings, and feedback input in addition to feature-specific state/recommendation composition. CP9 should migrate only repeated visual semantics that are proven across other screens; recommendation/feedback behavior and business logic must remain local/application-owned and must not be moved into generic UI abstractions.

## Current design-swap assessment

The global visual levers for palette, typography, control sizing, spacing/radii, interaction opacity, and responsive screen layout are now more centralized. Life Map, WHY, and Check-in demonstrate that repeated navigation/action treatment can move behind primitives without moving feature behavior.

This is **not yet the final CP9 design-swap proof**. The required proof still needs Today plus the representative screens to be reviewed against a substantially different visual direction and must be recorded without keeping duplicate production themes.

## Remaining CP9 slices

1. Audit Today and other primary screens for repeated control/surface/input treatments and migrate only proven global semantics.
2. Audit every primary screen for screen-local hard-coded colors, typography sizes, standard radii/control heights, and repeated pressed/disabled values; leave feature geometry/visualization math local.
3. Audit responsive behavior at narrow phone, common phone, tablet portrait/landscape, and wide web widths when owner runtime/visual validation is available.
4. Audit Arabic RTL mirroring/alignment, semantic icon direction, truncation, dynamic type, keyboard/focus behavior, screen-reader labels, and light/dark treatment.
5. Complete the TASK-required design-swap proof on Today, Life Map, WHY, and an interaction-heavy flow, documenting which files changed and proving no core/application-data/Supabase/provider changes were necessary.

## Verification policy

No app tests, builds, typechecks, browser/device visual runs, database scripts, cloud CI, or GitHub Actions were executed by workers for this CP9 slice because the active task policy reserves execution-dependent gates for owner validation. The architectural audit and code changes are implementation evidence only, not runtime-pass claims.
