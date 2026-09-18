# MIZAN Project State

## Current checkpoint
- Active engineering checkpoint: **CP9 — Responsive UX, accessibility, localization, polish, and design-swappability** (`IN_PROGRESS`).
- CP1 is `BLOCKED_HUMAN` only for owner-side responsive/locale evidence.
- CP2 through CP7 have implementation slices on `main` but remain checkpoint-verification pending under the current worker policy.
- CP8 implementation is code-reviewed complete for the current scope; owner/runtime validation remains pending before checkpoint credit.
- Product authority: GitHub `iosamaes/ai-assistant@main`.
- Task digest: `db05d2d78fc71edb1b71880d9e74535318fa6f4a`.

## Checkpoints
- [x] CP0 — Reconnaissance, product model, executable plan
- [ ] CP1 — Universal application foundation — owner validation pending
- [ ] CP2 — Supabase, auth, ownership, persistence — owner validation pending
- [ ] CP3 — Deterministic intelligence core — implementation present, validation pending
- [ ] CP4 — First complete daily loop — implementation present, validation pending
- [ ] CP5 — Insight, explanation, personal learning — implementation present, validation pending
- [ ] CP6 — Advanced decision tools — implementation present, validation pending
- [ ] CP7 — Plugins, unified integrations, provider boundaries — implementation present, validation pending
- [ ] CP8 — Reliability, offline tolerance, sync — implementation complete, owner validation pending
- [ ] CP9 — Responsive UX, accessibility, localization, polish, design-swappability — **IN_PROGRESS**
- [ ] CP10 — Security, privacy, owner-data control
- [ ] CP11 — Test matrix, performance, release readiness
- [ ] CP12 — Independent final review and handoff

## CP8 completed implementation sub-items
- Durable user-write retry exists for check-ins and Invisible Wins using per-user SecureStore slots on native and localStorage on Web.
- Check-in/reflection mutations carry stable client mutation IDs and migration `0008_offline_mutation_idempotency.sql` adds duplicate-safe server uniqueness.
- Retry is serialized per user; successful replay removes only the successful queued item.
- Integration observation ingestion is idempotent by provider dedupe key; transient provider reads use bounded retry and lifecycle failures persist only safe normalized error codes.
- A durable recent Today snapshot persists derived Human State plus Balance/Momentum output, without raw reflection notes, provider payloads, or credentials.
- Recent Today snapshots are user-scoped, runtime-validated, expire after seven days, and are discarded when malformed or implausibly future-dated.
- `loadDailySnapshot` falls back only for `unavailable` / `not-configured`; session expiry, authorization, invalid-data, conflict, and unknown failures remain explicit.
- Today consumes one `DailySnapshot` for current state plus Balance/Momentum and explicitly labels cached fallback source/timestamp.
- The preservation-wording audit is complete: durable queued writes, screen/session-only unsaved state, and non-preserved failures are documented separately in `docs/CP8_RELIABILITY.md`.
- Queued check-ins stay on the check-in screen with an explicit Arabic/English durable-on-device message instead of being indistinguishable from a confirmed server save.
- Concurrent-edit review is complete without a generic sync/version framework. Experiment terminal lifecycle writes require the record still be `active`, so a stale concurrent cancel/complete returns `conflict` instead of overwriting an already-terminal state.
- Life Season transitions remain atomic behind the existing RPC and one-active-season unique index; append-only/idempotent evidence paths do not need mutable-row version machinery.
- Non-executed verification specifications cover snapshot expiry/corruption, durable queue restart/full-storage behavior, idempotent replay, integration retry/partial-state behavior, queued check-in presentation, and concurrent experiment terminal-state guards.
- Detailed CP8 implementation ledger: `docs/CP8_RELIABILITY.md`.

## CP8 remaining validation only
- Convert/execute the documented reliability scenarios in the owner validation/test harness when available; workers must not execute those tests under the current policy.
- Owner validation must exercise cache expiry/corruption, queue restart/full storage, reconnect replay, queued check-in presentation, cached Today presentation, integration partial-state behavior, and concurrent experiment terminal-state behavior on Web plus at least one native runtime before CP8 can be marked `DONE`.

## CP9 presentation-architecture progress
- Added a compact semantic presentation foundation in `apps/app/src/constants/theme.ts`: palette roles including `onAccent`, typography roles, control/touch sizing, border width, interaction opacity, and centralized responsive layout/breakpoint/padding values.
- Retained the old max-width/breakpoint exports as temporary compatibility aliases so CP9 can migrate incrementally without a whole-app style rewrite.
- Updated `MizanText`, `Card`, `MizanTextInput`, `PrimaryButton`, and `ChoiceChip` to consume semantic tokens instead of owning duplicated typography/control/interaction values.
- Added one justified shared `SecondaryButton` primitive with standard and compact-pill presentation for the repeated secondary/navigation-control pattern; no wrapper/component hierarchy or styling DSL was introduced.
- Updated `Screen` to consume centralized semantic responsive layout rules.
- Refactored the required representative Life Map and WHY surfaces so their repeated primary and compact secondary controls use shared primitives while domain/factor composition remains local.
- Refactored the interaction-heavy Check-in surface so its secondary navigation control also uses the shared primitive; its rating/scale composition remains feature-local.
- Refactored Today so One Move acceptance/feedback submission use `PrimaryButton`, alternative/defer/decline use `SecondaryButton`, and the feedback note uses `MizanTextInput`.
- Today keeps Link-owned settings/check-in controls and the numbered usefulness scale feature-local, but now consumes semantic control sizing, border, pressed/disabled opacity, and `onAccent` tokens instead of duplicated magic values.
- Refactored both authentication entry and password-update recovery screens to use the shared `MizanTextInput`; local duplicates of standard input height, border, radius, padding, typography, palette colors, and RTL text alignment were removed without changing auth/session behavior.
- Replaced text-only Settings back actions in Capacity and Cost of Yes with the shared `SecondaryButton`, centralizing touch target, accessibility role/state, radius/border, and pressed-state behavior without changing either feature's domain calculations.
- Updated Insights' Link-owned controls to consume `Controls.minimumTouchHeight`, `Controls.actionHeight`, `Controls.borderWidth`, `Interaction.subtlePressed`, `Interaction.pressed`, and semantic `palette.onAccent` instead of screen-local `44`, `48`, `1`, `0.72`, `0.82`, and `#FFFFFF` values.
- Recommendation selection, persistence, confidence/evidence display, feedback behavior, auth/session behavior, capacity/debt calculations, Cost of Yes math, and insight relationship logic remain outside generic UI primitives; no application/business logic moved into presentation abstractions.
- Updated `docs/CP9_PRESENTATION_ARCHITECTURE.md` with Today, authentication/recovery, Capacity, Cost of Yes, and Insights audit evidence plus the remaining proof boundary.
- The TASK-required final design-swap proof is **not yet claimed** because a substantially different visual direction still requires owner-side visual/runtime review.

## Exact next executable action
1. Continue the remaining primary-screen audit with Human ROI and Life Seasons first: replace text-only pressable navigation with existing shared controls where semantics match, then inspect experiments, recovery, scenarios, integrations, Invisible Wins, value alignment, and Settings for repeated global color/typography/control/opacity values.
2. Continue Arabic/English RTL, semantic icon direction, truncation, dynamic type, keyboard/focus, screen-reader-label, light/dark, and representative-width audits from static code where useful.
3. Complete the design-swap proof only during owner visual/runtime validation after Today, Life Map, WHY, and Check-in are exercised against a substantially different visual direction without edits to `packages/core`, application intelligence/data contracts, Supabase/data-access, or provider adapters.
4. Leave CP1–CP8 execution-dependent checkpoint evidence and CP9 visual/runtime validation to owner validation under the current task policy.

## Verification record
Previously recorded execution evidence from the owner-side baseline:
- Root typecheck PASS, lint PASS, core tests 3/3 PASS, plugin tests 2/2 PASS, Expo Doctor 21/21 PASS, Android export PASS, iOS export PASS.
- Earlier auth/data-access app typecheck and lint were recorded PASS.

Current worker policy:
- No app tests, builds, typechecks, database scripts, cloud CI, or GitHub Actions were executed for the post-baseline CP2–CP9 work.
- Earlier CP8 commits: `98a987259cfbb5e653477495d2fba49af1a6a3b5`, `54e2e644bff98f5780bbdca3260e322a13446266`, `94a637bf0386d1846af401b96363314704432da3`, `ca363297b0c17487243fd4fa4500d9682ed5a23d`, and `26bbbfcf1f099038b0337968318caf081843f2fb`.
- Current auto3 CP8 commits: `9fca718f3e4099d2325438f027f0762da3712d0c` (queued check-in presentation), `ad21321618caeaba31a1dccb24856fda511153a3` (concurrent experiment lifecycle guard), and `94db687cde151e38ec3cd5471e415accdc4d8997` (preservation/concurrency audit ledger).
- Current auto3 CP9 commits: `5505075d418a84061740fcb910290cbe212a1197` (semantic presentation tokens), `47ecd506e321b809e0150a4be673e75177c7fc7c` (shared primitives consume tokens), `d65d1f52060bb543895e3eefcc8abcaecf28d232` (responsive Screen layout tokens), `3b345a91a42fb8d48bcc24b7a4321d8362d3d8ae` (shared secondary button), `8ebd350e53651401a1a4f68b0280dc5c368fe36c` (Life Map controls), `616121223a33cc3b3790ba4215ca38d5766889b8` (WHY controls), `1c80a971da9022ff98b4b6aae84d85c35aaefac2` (Check-in secondary navigation), and `669a584feff4a8a63f8f38b58eff9e42e3f3dac0` (CP9 audit document).
- Current auto2 CP9 commits: `28e0eb587904cba1118ecedba426d6c68caa5a6f` (Today shared control/input consolidation), `4aadff5a7ddf954797256f16346933e3be09868b` (Today audit documentation), `d32be600a0d96332efe8a6fc15ae9c3884c5b91b` (Capacity secondary navigation), `220fff20ea592bf19c47d483e474d8f049ed86ba` (Cost of Yes secondary navigation), `3ccdcfc29c04bcf1c643b434d86236d7acace760` (Insights semantic control tokens), and `149d7a5a3964f86c367f52476ffa8827f211f7e4` (expanded CP9 audit documentation).
- Current auto4 CP9 commits: `729d83355297b3740379eef52ed7bd67f8b7b137` (auth shared semantic input), `557660e52e119ee6ba1d1555ffc7c386e1f69b95` (password-update shared semantic input), and `126516eecd7aa02d8cbd3f6bf2b18a58bc05cdf8` (auth/recovery presentation audit documentation).

## Known blockers / risks
- CP1: Windows session must be unlocked normally for true narrow-phone Arabic/English interaction evidence; see `automation/HUMAN_REQUIRED.md`.
- CP2: hosted Supabase Auth redirect allow-list owner action remains open; see `automation/HUMAN_REQUIRED.md`.
- Cross-user/database specifications and all post-baseline runtime/type/build gates still require owner execution evidence.
- The recent Today snapshot is intentionally a compact best-effort cache; native SecureStore capacity/behavior still needs owner runtime validation.
- Reliability and CP9 visual/accessibility scenarios are implementation/audit evidence rather than executed evidence because the active worker policy prohibits workers from running those gates.
- No real AI, wearable, calendar, or location credentials are configured; deterministic/unavailable adapters remain the supported fallback path.

## Evidence paths
- `docs/CP8_RELIABILITY.md`
- `docs/CP9_PRESENTATION_ARCHITECTURE.md`
- `apps/app/src/constants/theme.ts`
- `apps/app/src/components/mizan-ui.tsx`
- `apps/app/src/components/screen.tsx`
- `apps/app/src/app/auth.tsx`
- `apps/app/src/app/update-password.tsx`
- `apps/app/src/app/life-map.tsx`
- `apps/app/src/app/why.tsx`
- `apps/app/src/app/check-in.tsx`
- `apps/app/src/app/today.tsx`
- `apps/app/src/app/capacity.tsx`
- `apps/app/src/app/cost-of-yes.tsx`
- `apps/app/src/app/insights.tsx`
- `apps/app/src/infrastructure/offline/pending-mutations.ts`
- `apps/app/src/infrastructure/offline/recent-daily-snapshot.ts`
- `apps/app/src/application/offline-sync.ts`
- `apps/app/src/application/daily-intelligence.ts`
- `apps/app/src/infrastructure/supabase/experiments.ts`
- `apps/app/src/application/integrations.ts`
- `apps/app/src/infrastructure/supabase/integrations.ts`
- `supabase/migrations/0008_offline_mutation_idempotency.sql`
- `supabase/tests/offline_mutation_idempotency.sql`
- `automation/HUMAN_REQUIRED.md`
