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

### Authentication and password recovery

The sign-in/sign-up/reset-password entry screen and the password-update recovery screen previously duplicated the same input surface treatment locally: standard height, border width/radius, horizontal padding, typography size, light/dark palette colors, and RTL text alignment. Both now use the shared `MizanTextInput` primitive while preserving their auth/session behavior, labels, keyboard configuration, secure-entry behavior, and validation logic. This removes another repeated global visual decision from feature screens without moving authentication behavior into the presentation primitive.

### Capacity and Cost of Yes

The Life Buffer/Life Debt and Cost of Yes screens used plain pressable `MizanText` labels for their bottom navigation back to Settings. Those text-only controls depended on feature-local padding for their hit area and did not carry the explicit button accessibility semantics of the shared control primitive. Both now use `SecondaryButton`, so minimum touch sizing, border/radius treatment, pressed state, dynamic text behavior, and button accessibility semantics remain centralized. Their metric grids and decision math stay feature-local.

### Insights

Insights intentionally retains Expo Router `Link asChild` for its top back control and check-in action because navigation ownership belongs to the router. The screen no longer owns magic values for minimum control height, border width, pressed opacity, or accent foreground color: those values now come from `Controls`, `Interaction`, and the semantic palette including `onAccent`. Insight-card evidence rows remain feature-specific composition and continue to use only the semantic border role.

### Human ROI

Human ROI already used shared `ChoiceChip` and `MizanTextInput` primitives for its explicit-evidence controls. Its remaining text-only back navigation depended on local padding and text press behavior; that path now uses compact `SecondaryButton`. Human ROI assessment logic, protected-meaning behavior, confidence/evidence output, and feature-specific metric composition remain local/application-owned.

### Life Seasons

Life Seasons already used shared chips for season/target selection and `PrimaryButton` for persistence. Its remaining bottom text-only back action now uses compact `SecondaryButton`, removing the local hit-area/presentation exception without moving target selection, persistence, history rendering, or Balance-related domain behavior into generic UI primitives.

### Recovery / Save My Day

Recovery previously used text-only pressable labels for both “skip this step” and bottom navigation. The skip action now uses standard `SecondaryButton`, while the bottom navigation uses its compact form. Step sequencing, voluntary skip semantics, recovery-plan evidence, and non-medical decision behavior remain feature-local. This standardizes accessibility role, touch sizing, border/radius, and interaction treatment without changing recovery logic.

### Invisible Wins

Invisible Wins previously duplicated the standard multiline input treatment locally: light/dark palette lookup, border color/width/radius, horizontal/vertical padding, typography size/line height, and placeholder color. The reflection field now uses `MizanTextInput`, keeping only its feature-specific multiline height and top alignment local. The bottom text-only Settings navigation now uses compact `SecondaryButton`. Reflection persistence, offline queue behavior, category semantics, and no-gamification rules remain outside the shared primitive.

### Values & identity alignment

Value Alignment previously used a custom `Pressable` back control with screen-local padding. It now uses compact `SecondaryButton`, centralizing touch target, border/radius, pressed state, dynamic text behavior, and accessibility role without moving evidence interpretation, confidence, or identity-drift semantics into presentation code.

### External integrations

Integrations keeps provider lifecycle, permissions, consent, sync status, and disconnect behavior in its application/infrastructure layers. Its remaining text-only Settings navigation now uses compact `SecondaryButton`, removing another screen-local navigation treatment while preserving provider-boundary separation and normalized integration state.

### Personal experiments

Experiments previously duplicated the standard multiline input surface and used text-only pressable actions for stopping an active experiment and returning to Settings. The hypothesis editor now uses `MizanTextInput`; only the feature-specific multiline height, top alignment, and explicit RTL writing direction remain local. Stopping an experiment uses the standard `SecondaryButton`, and Settings navigation uses its compact form. Experiment lifecycle, consent, usefulness capture, and evaluation math remain outside presentation primitives.

### What If / scenarios

The scenario chooser now mirrors its chip row with `row-reverse` in RTL instead of relying on a fixed left-to-right row. Returning to Settings now uses compact `SecondaryButton` rather than a primary action. Scenario definitions, personal-effect loading, uncertainty labels, conservative projection math, and evidence handling remain unchanged.

### Settings

Settings already used shared `ChoiceChip` and `PrimaryButton` controls for language, spiritual preference, and feature entry points. Its final text-only return-to-Today control now uses compact `SecondaryButton`, so the recurring navigation hit target, radius, pressed state, and accessibility role are centralized without changing settings behavior.

### Personal learning

Personal Learning retains feature-local evidence/history separators that consume the semantic palette border role, while its custom `Pressable` return control has moved to compact `SecondaryButton`. Benefit-learning logic, explicit-outcome rules, confidence labels, and history rendering remain feature-owned.

### Personalization maturity

Personalization keeps its feature-specific stage cards and semantic palette usage for active/inactive evidence stages. Its custom back `Pressable` has moved to compact `SecondaryButton`, removing one more screen-local navigation treatment without changing maturity calculation or evidence semantics.

### Onboarding

A static audit found the onboarding flow already uses the shared `ChoiceChip`, `MizanText`, `PrimaryButton`, and `Screen` boundary. Horizontal language/value/baseline chip groups explicitly mirror with `row-reverse` in RTL, while vertically stacked domain/season/privacy/spiritual groups are intentionally direction-neutral. Arabic and English copy for the onboarding-specific controls is present. No presentation rewrite was justified in this slice, so the existing onboarding composition was left intact.

### Navigation shell / reduced motion

The root Expo Router stack previously always used a fade transition. The navigation shell now reads the platform reduced-motion accessibility preference through `AccessibilityInfo`, listens for preference changes during the session, and disables stack animation when reduced motion is enabled. Session routing, offline mutation flushing, status-bar contrast, and semantic background colors remain unchanged.

### Entry redirect and root error fallback

The entry redirect route was statically audited and already uses the shared `Screen`/`MizanText` boundary plus the translated loading key before routing to Auth, Onboarding, or Today; no rewrite was justified.

The root `AppErrorBoundary` is intentionally outside `AppStateProvider` so it can still catch bootstrap/provider render failures. Its fallback previously hard-coded an Arabic-only light-theme surface, typography, colors, sizing, and button treatment. The fallback now remains bootstrap-safe while consuming semantic palette, typography, spacing, radius, control-size, and interaction tokens; it supports light/dark appearance, scalable text, explicit retry-button accessibility, and Arabic/English fallback copy selected from platform direction without depending on app state. No domain, persistence, routing, or recovery behavior moved into the presentation layer.

## Current design-swap assessment

The global visual levers for palette, typography, control sizing, spacing/radii, interaction opacity, and responsive screen layout are now centralized across Today, Life Map, WHY, Check-in, authentication/recovery, Capacity, Cost of Yes, Insights, Human ROI, Life Seasons, Recovery, Invisible Wins, Value Alignment, Integrations, Experiments, What If, Settings, Personal Learning, Personalization, Onboarding, the entry route, and the bootstrap-safe root error fallback. The navigation shell also consumes semantic background color and now honors the platform reduced-motion preference. These surfaces demonstrate that repeated control/input treatment can move behind app-local primitives or semantic tokens without changing `packages/core`, application intelligence/data contracts, Supabase/data-access, or provider adapters.

This is **not yet the final CP9 design-swap proof**. A substantially different visual direction still needs owner-side visual/runtime review; workers must not claim that runtime proof from static implementation inspection alone.

## Remaining CP9 slices

1. Continue the repository-wide cross-cutting static pass for untranslated production literals, semantic RTL issues, missing accessibility labels, duplicated global visual values, or local control treatments outside the already-audited current route/component surfaces; avoid speculative abstraction when no demonstrated repetition exists.
2. Continue code-level review for Arabic/English RTL mirroring/alignment, semantic icon direction, truncation, dynamic type, keyboard/focus behavior, screen-reader labels, and light/dark treatment.
3. Audit responsive behavior at narrow phone, common phone, tablet portrait/landscape, and wide web widths when owner runtime/visual validation is available.
4. Complete the TASK-required design-swap proof on Today, Life Map, WHY, and the interaction-heavy Check-in flow during owner visual/runtime validation, documenting the substantially different visual direction without keeping duplicate production themes.

## Verification policy

No app tests, builds, typechecks, browser/device visual runs, database scripts, cloud CI, or GitHub Actions were executed by workers for this CP9 slice because the active task policy reserves execution-dependent gates for owner validation. The architectural audit and code changes are implementation evidence only, not runtime-pass claims.
