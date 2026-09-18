# MIZAN Project State

## Current checkpoint
- CP1 — Universal application foundation
- Status: `BLOCKED_HUMAN` for owner-side CP1/CP2 validation; CP3, CP4, CP5 implementation slices are in place pending owner validation, while CP6 implementation is progressing independently on GitHub `main`.
- Product authority: GitHub `iosamaes/ai-assistant` on `main`.
- Task digest: `db05d2d78fc71edb1b71880d9e74535318fa6f4a`.

## Checkpoints
- [x] CP0 — Reconnaissance, product model, executable plan
- [ ] CP1 — Universal application foundation
- [ ] CP2 — Supabase, auth, ownership, persistence
- [ ] CP3 — MIZAN deterministic intelligence core
- [ ] CP4 — First complete daily life loop
- [ ] CP5 — Insight, explanation, personal learning
- [ ] CP6 — Advanced decision tools
- [ ] CP7 — Plugins, unified integrations, and provider boundaries
- [ ] CP8 — Reliability, offline tolerance, sync
- [ ] CP9 — Responsive UX, accessibility, localization, polish, and design-swappability
- [ ] CP10 — Security, privacy, owner-data control
- [ ] CP11 — Test matrix, performance, release readiness
- [ ] CP12 — Independent final review and handoff

## CP1 / CP2 blocked owner validation
- Universal Expo shell, Arabic-first RTL/English locale structure, auth/session/recovery flows, Supabase persistence, RLS migrations, and cross-user policy specifications are implemented.
- CP1 still needs owner-side true narrow-phone Arabic/English interaction evidence after the Windows session is unlocked.
- Supabase Auth redirect allow-list activation remains in `automation/HUMAN_REQUIRED.md`.

## CP3 / CP4 / CP5 implemented slices pending owner validation
- Deterministic core preserves unknown data and implements Human State Vector, confidence, personal baseline/maturity, temporal memory/Momentum, Balance, Life Leverage/One Move, Life Debt, Buffer/Fragility, interaction-risk hypotheses, value alignment, relationship evidence, and explicit-outcome feedback learning.
- Daily loop implements onboarding context/targets, sub-minute check-in, Today state/Balance/Momentum/One Move, decision handling, explicit usefulness feedback, and restart/login recommendation-context suppression.
- CP5 surfaces include Life Map, WHY, Insights, Personal Learning, Personalization Maturity, Values & Identity alignment, and Invisible Wins/reflection capture.

## CP6 independent progress
### What If / Digital Twin
- Deterministic scenario projections expose assumptions, uncertainty ranges, evidence source/count, and confidence.
- Unknown current state remains unknown; qualified personal effects require explicit outcome feedback plus a compatible later observation.

### Voluntary Experiment Engine
- Consent-based, time-bounded experiments persist under RLS and evaluate personal pre/post evidence conservatively.
- `/experiments` supports start, stop without punishment, explicit impact feedback, and evidence-limited personal results.

### Recovery / Save My Day
- `packages/core/src/recovery.ts` now derives a deterministic recovery plan from the current Human State Vector.
- Triggering is conservative: unsupported or low-confidence values do not become overload claims; missing evidence stays `insufficient_evidence`.
- Supported overload, mental-load, energy, and recovery signals can raise the plan from available -> suggested -> strongly suggested using explicit thresholds and confidence.
- The sequence intentionally reduces choice to at most three tiny optional steps: pause inputs, restore the body, and reduce near-term load.
- `/recovery` is Arabic/English, explains confidence/evidence and non-medical limits, and lets the user advance, skip, or stop with no points, streaks, or punishment.
- Recovery is registered in Expo Router and exposed from Settings.
- `packages/core/src/recovery.test.ts` specifies insufficient-evidence behavior, likely overload triggering, weak-confidence suppression, and combined moderate signals. Per worker policy these specifications were authored but not executed.

### Cost of Yes
- `packages/core/src/cost-of-yes.ts` implements a deterministic comparison between a proposed weekly commitment and known weekly time margin.
- Missing commitment or margin remains explicitly `insufficient`; the model does not invent a schedule, displaced activity, or hidden free time.
- When both values are known, the result distinguishes manageable margin, tight margin, and minimum unavoidable displacement while preserving evidence/confidence.
- `apps/app/src/application/cost-of-yes.ts` converts explicit self-reported hours into canonical evidence before calling the pure core assessment; future calendar/provider context can replace or supplement that application boundary without changing the core algorithm or screen business logic.
- `/cost-of-yes` is Arabic/English, responsive through the shared `Screen`/`Card` primitives, uses the shared token-driven `MizanTextInput`, and states that relationships, worship, and rest are not compulsory optimization resources.
- Cost of Yes is registered in Expo Router and exposed from Settings.
- `packages/core/src/cost-of-yes.test.ts` specifies missing-context, manageable, tight, displacement, and zero-margin cases. Per worker policy these specifications were authored but not executed.

### Human ROI
- `packages/core/src/human-roi.ts` implements an evidence-limited comparison of explicit user-reported benefit, effort, and weekly time without creating a synthetic scalar ROI score.
- Missing benefit, effort, or time remains explicitly `insufficient`; close ratings remain `mixed` instead of forcing a recommendation, and larger gaps are described as benefit-heavier or cost-heavier rather than good/bad verdicts.
- A `protectedMeaning` path lets the user keep relationships, worship, sacred moments, or any personally non-optimizable activity entirely outside quantitative comparison; protected inputs are deliberately discarded from the assessment result rather than scored.
- `apps/app/src/application/human-roi.ts` creates only explicit self-reported evidence and keeps the core independent from UI/provider details.
- `/human-roi` is Arabic/English, uses shared design tokens/primitives, exposes the protected mode prominently, and keeps time visible as context rather than hiding it in an arbitrary coefficient.
- Human ROI is registered in Expo Router and exposed from Settings.
- `packages/core/src/human-roi.test.ts` specifies protected, insufficient, benefit-heavier, mixed, and cost-heavier behavior. Per worker policy these specifications were authored but not executed.

## Architecture amendments now in force
- Newly added/materially edited UI from CP6 onward must obey the design-swappable presentation boundaries in TASK section 7.1; Cost of Yes and Human ROI use shared semantic primitives instead of introducing screen-specific foundational input styling.
- Any external-service work introduced before CP7 must obey the unified integration architecture in TASK section 6.1; provider-specific shortcuts must not leak into feature screens, plugins, or `packages/core`.

## Exact next executable action
1. Finish CP6 Life Seasons editing/history and recalculation of target balance if remaining gaps exist.
2. Then proceed to CP7 using the new unified integration/provider-swap requirements once CP6 implementation gaps are closed.
3. Owner path: unlock Windows and complete CP1 narrow-phone Arabic/English interaction verification.
4. Owner path: configure Supabase Auth redirect allow-list, then validate auth/recovery/session/persistence and execute RLS verification.
5. Owner path: run current core/app/plugin typechecks and tests before granting CP3/CP4/CP5/CP6 checkpoint credit.

## Verification record
Previously verified baseline evidence:
- CP1 root typecheck PASS, lint PASS, core tests 3/3 PASS, plugin tests 2/2 PASS, Expo Doctor 21/21 PASS, Android export PASS, iOS export PASS.
- Earlier auth/data-access additions: app typecheck PASS and app lint PASS.

Implemented after that baseline and still awaiting owner validation:
- CP2 auth/session/persistence/recovery additions and current migrations/policy tests.
- CP3/CP4/CP5 implementation slices listed above.
- CP6 What If, scenario learning, experiment engine/persistence/surface, Recovery / Save My Day, Cost of Yes, and Human ROI core/specifications/application/UI surfaces.
- No product/database test script, cloud test, or build was run by workers for these post-baseline additions, per `automation/TASK.md`.

## Known technical risks / temporary compromises
- CP1 remains blocked on owner-side physical responsive/locale verification.
- Hosted Supabase Auth must allow `mizan://**`, `http://localhost:8087/**`, and the eventual production Web URL before confirmation/recovery can be verified end-to-end.
- Cross-user SQL verification exists but lacks current owner-side execution evidence.
- Post-baseline CP3/CP4/CP5/CP6 additions, including Cost of Yes and Human ROI, remain runtime/type validation pending.
- Offline mutation durability beyond the current screen/session remains CP8 work.
- Recovery mode is deliberately stateless in this slice: skipping/stopping is never converted into a negative event, score, or adherence penalty.
- Cost of Yes currently uses explicit user-entered weekly time/margin context because calendar/provider integrations are intentionally deferred to the CP7 capability-contract layer; unknown context remains unknown.
- Human ROI intentionally has no combined numeric ROI score; benefit/effort ratings and time use unlike scales, so collapsing them would create false precision.
- Moderate npm advisories remain in the supported Expo dependency chain; no prior high/critical advisory was recorded.

## Evidence paths
- `packages/core/src/human-roi.ts`
- `packages/core/src/human-roi.test.ts`
- `apps/app/src/application/human-roi.ts`
- `apps/app/src/app/human-roi.tsx`
- `packages/core/src/cost-of-yes.ts`
- `packages/core/src/cost-of-yes.test.ts`
- `apps/app/src/application/cost-of-yes.ts`
- `apps/app/src/app/cost-of-yes.tsx`
- `apps/app/src/components/mizan-ui.tsx`
- `packages/core/src/recovery.ts`
- `packages/core/src/recovery.test.ts`
- `apps/app/src/application/recovery.ts`
- `apps/app/src/app/recovery.tsx`
- `apps/app/src/app/_layout.tsx`
- `apps/app/src/app/settings.tsx`
- `packages/core/src/scenario.ts`
- `packages/core/src/experiment.ts`
- `apps/app/src/app/what-if.tsx`
- `apps/app/src/app/experiments.tsx`
- `supabase/tests/rls_cross_user.sql`
