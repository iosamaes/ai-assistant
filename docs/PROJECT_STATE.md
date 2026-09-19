# MIZAN Project State

## Current checkpoint
- Active engineering checkpoint: **CP9 — Responsive UX, accessibility, localization, polish, and design-swappability** (`IN_PROGRESS`).
- CP10 security/privacy implementation is progressing in parallel because CP9's remaining gate is primarily owner-side runtime/visual evidence; this does not mark CP9 complete.
- Product authority: GitHub `iosamaes/ai-assistant@main`.
- Task digest: `8ad16d4d56ff9369c3f35fa3ce11a13de5260df5`.
- Current worker policy: GitHub source changes and explicitly authorized Supabase product/schema mutations are allowed; workers must not run product tests, builds, typechecks, validation database scripts, GitHub Actions, or cloud CI. Execution-dependent gates remain owner validation.

## Checkpoints
- [x] CP0 — Reconnaissance, product model, executable plan
- [ ] CP1 — Universal application foundation — `BLOCKED_HUMAN` only for owner-side responsive/locale evidence
- [ ] CP2 — Supabase, auth, ownership, persistence — implementation present; owner/runtime validation pending
- [ ] CP3 — Deterministic intelligence core — implementation present; validation pending
- [ ] CP4 — First complete daily loop — implementation present; validation pending
- [ ] CP5 — Insight, explanation, personal learning — implementation present; validation pending
- [ ] CP6 — Advanced decision tools — implementation present; validation pending
- [ ] CP7 — Plugins, unified integrations, provider boundaries — implementation present; validation pending
- [ ] CP8 — Reliability, offline tolerance, sync — statically reviewed complete; owner/runtime validation pending
- [ ] CP9 — Responsive UX, accessibility, localization, polish, design-swappability — **IN_PROGRESS**
- [ ] CP10 — Security, privacy, owner-data control — **IN_PROGRESS in parallel; live schema audit/export/delete foundation and health-consent fencing present; validation and remaining audit work pending**
- [ ] CP11 — Test matrix, performance, release readiness
- [ ] CP12 — Independent final review and handoff

## CP8 current implementation
Detailed ledger: `docs/CP8_RELIABILITY.md`.

Current implementation includes durable per-user retry for check-ins and Invisible Wins, stable client mutation IDs and duplicate-safe replay, normalized integration idempotency, recent Today snapshot caching with validation/expiry, explicit cached/queued presentation, experiment terminal-state conflict protection, atomic Life Season transitions, and recorded reconnect/restart/concurrency specifications.

CP8 is not credited `DONE` until owner/runtime evidence confirms restart/reload and offline/reconnect behavior.

## CP9 current implementation
Presentation boundary already includes centralized semantic palette/typography/spacing/radii/control sizing, shared `MizanText`/`Card`/form/button/chip primitives, centralized responsive `Screen` behavior, reduced-motion navigation, and a broad static pass over RTL, dynamic type, accessibility states/live regions, async interaction fencing, localization, and repeated visual semantics.

Recent static CP9 evidence includes:
- Arabic integration timestamps force `ar-QA-u-nu-latn` so dynamic dates remain within the owner-wide Western-digit `0-9` policy (`0dace9d1d5555aef1d802f66469a5786110b0bac`).
- Today cross-user async state is fenced to the active user and loading/error/empty transitions are announced (`8b097bc8911ac91846bd51f92a19701c9057ed25`).
- Western/ASCII digits are enforced for Arabic and English formatted output while localized digit input remains accepted and normalized (`a5e3a2864ba49700ac92de8fdfb33b49981c18ab`, `81011c087f2990eb82e13275507cbfa69a04c0ef`).
- Personal Learning, Personalization, Spiritual Grounding, Invisible Wins, Integrations, Insights, onboarding/auth/password recovery/What If/Experiments/Life Seasons/Settings/Check-in received targeted stale-state, RTL, localization, dynamic-type, accessibility, and interaction hardening.

The TASK-required final design-swap proof is **not claimed**. It still requires owner visual/runtime validation with a substantially different visual direction on Today, Life Map, WHY, and an interaction-heavy flow at representative widths.

## CP10 current implementation
Detailed ledger/threat model: `docs/CP10_SECURITY_PRIVACY.md`.

Security/privacy work completed so far:
- **Live RLS inventory:** ten current public client-visible user-owned tables; all ten report RLS enabled with CRUD policies, all current `user_id` foreign keys target `auth.users(id) ON DELETE CASCADE`, and no Storage buckets currently exist.
- **Cross-user specification:** `supabase/tests/rls_cross_user.sql` covers all ten current user-owned tables for read isolation plus representative cross-user write rejection; not worker-run under current policy (`4368b83e7a9cc42dcf2667c6a970129541eaac05`).
- **Function ACL least privilege:** migration `0009_function_execute_hardening.sql` removed anonymous/public execute from `set_life_season` and removed public/anon/authenticated direct execute from trigger helper `set_updated_at`; migration was applied and live ACLs re-read (`769ab19bbe5de6e1a5395b03a77ac14b53bb0fd2`).
- **Portable export:** migration `0010_account_data_export.sql` adds authenticated-only, `SECURITY INVOKER` `export_my_data()` for all current application-owned data families under caller RLS; migration applied and live ACL re-read (`ae38bc26526ec3d1b7e9201c8ed0395fbbe8dc6b`).
- **Account deletion:** deployed `delete-account` Edge Function validates JWT plus explicit confirmation, keeps the service-role key server-only, deletes the authenticated Auth user, and relies on current cascades for MIZAN-owned rows (`0f71a0aaad89aa17e4dd0fb9596fadcd83116750`).
- **Client privacy UI/boundary:** Arabic/English export plus two-step permanent deletion are reachable from Settings; Web downloads JSON and native uses the share sheet. Export/deletion are fenced to the initiating user so mid-flight session switches cannot mix account data or sign out a newly active user (`0477db9b58d94e0dea919fad70d329dce0b52074`, `cd20bb8d8f9a3a4ceee27499bcd6a30baf6c3180`, `e9716ba30916ecc011a012a0121fb970c3094826`).
- **Health integration consent revocation fencing:** `syncHealthData` now requires the authoritative connection to remain connected, undisconnected, on the same consent timestamp, and still contain the requested/required scopes before the first provider read, before a retry, and again after provider read before persistence. Sync success bookkeeping is conditional and can no longer upsert `connected` over a concurrent revocation; stale sync errors only mutate rows still connected. Commits: infrastructure `bc0140962c7fa708e1bf6d320c99c43d39e535f0`, application `c2b3382a6748e4cee3e14226cdba899e003e7831`.
- **Consent-revocation specifications:** `apps/app/__tests__/integration-consent-revocation-test.ts` covers already-disabled consent, revocation during provider read, revocation before retry, and final state-update race; added in `44d7124f03d2686fa54ae5677e989599c016f527` and not worker-run under current policy.
- **Threat model/documentation:** `docs/CP10_SECURITY_PRIVACY.md` records the actual trust boundaries, export/delete design, function/storage inventory, provider boundary, logging posture, and the new consent fencing; latest documentation commit `32fff38ba28d08e4c7b73eed49675956e826ed07`.
- **Auth advisor owner action:** Supabase Security Advisor reports leaked-password protection disabled; the exact owner action remains recorded in `automation/HUMAN_REQUIRED.md`.

CP10 is **not complete**. Remaining code/static work includes the broader optional-module consent-revocation audit beyond health sync, repository-wide sensitive logging/error-reporting review, and remaining focused authorization/export/delete specifications. Runtime/export/delete/database validation remains owner-side under current policy.

## Test matrix progress
- Broad CP2–CP9 app/runtime validation scaffolding exists (`d32636ddd253e3ec688376a4a42596e2844704df`).
- Localized-number parsing and Western-digit output coverage exists (`5421ecd4c3dc84c52f6e0005774b886109365eb2`).
- CP10 cross-user RLS coverage exists but has not been executed by workers.
- CP10 privacy session-fencing and integration consent-revocation specifications exist but have not been executed by workers.
- No worker-run app tests, builds, typechecks, validation database scripts, cloud CI, or GitHub Actions are claimed for CP2–CP10 changes.

## Exact next executable action
1. Continue CP9 static review only for concrete remaining defects: untranslated production literals, Western-digit regressions, semantic RTL, accessibility states/live announcements, truncation/dynamic-type risks, keyboard/focus gaps, and unjustified duplicated global visual decisions.
2. Continue CP10 static engineering with the remaining optional-module consent paths (especially Spiritual Grounding/future provider-backed collectors), repository-wide sensitive logging/error-reporting review, and focused export/function-ACL/delete-boundary specifications where gaps remain.
3. Revisit already-audited surfaces only when inspection finds a concrete defect; do not create abstraction-only cleanup.
4. Leave representative-width runtime checks, post-baseline tests/builds/typechecks/database validation suites, end-to-end export/delete proof, CP1–CP8 execution-dependent evidence, and the final design-swap proof to owner validation under the active policy.

## Verification record
Previously recorded owner-side baseline evidence:
- Root typecheck PASS.
- Lint PASS.
- Core tests 3/3 PASS.
- Plugin tests 2/2 PASS.
- Expo Doctor 21/21 PASS.
- Android export PASS.
- iOS export PASS.
- Earlier auth/data-access app typecheck and lint PASS.

Post-baseline:
- No worker-run app tests, builds, typechecks, validation database scripts, cloud CI, or GitHub Actions are claimed for CP2–CP10 changes.
- Authorized product migrations `function_execute_hardening` and `account_data_export` were applied to the named Supabase project and their resulting live function ACLs were queried directly; this is implementation/state evidence, not a test-suite PASS.
- `delete-account` Edge Function deployment reports ACTIVE with JWT verification enabled; no end-to-end destructive deletion test was run by the worker.
- Current CP9 evidence remains static implementation/code-review evidence until owner validation runs representative device/browser/screen-reader checks.
- Integration consent-revocation changes are static implementation/specification evidence only until owner validation executes the new tests and a real runtime disconnect/sync race check.

## Known blockers / risks
- CP1: Windows session must be unlocked normally for true narrow-phone Arabic/English interaction evidence; see `automation/HUMAN_REQUIRED.md`.
- CP2: hosted Supabase Auth redirect allow-list owner action remains open; see `automation/HUMAN_REQUIRED.md`.
- CP10: Supabase leaked-password protection remains disabled pending the recorded owner Auth-setting action; see `automation/HUMAN_REQUIRED.md`.
- Cross-user/database specifications and all post-baseline runtime/type/build gates still require owner execution evidence.
- Recent Today snapshot native SecureStore behavior/capacity still needs owner runtime validation.
- Static CP9 review is not a substitute for visual/device/screen-reader validation.
- Privacy export/delete UI and Edge deletion still need owner Web/native end-to-end validation before the CP10 gate can be credited.
- The health integration consent path is now statically fenced, but broader optional-module consent revocation still needs completion and runtime proof.
- No real AI, wearable, calendar, or location credentials are configured; deterministic/unavailable adapters remain the supported fallback path.

## Evidence paths
- `docs/CP8_RELIABILITY.md`
- `docs/CP9_PRESENTATION_ARCHITECTURE.md`
- `docs/CP10_SECURITY_PRIVACY.md`
- `supabase/tests/rls_cross_user.sql`
- `supabase/migrations/0009_function_execute_hardening.sql`
- `supabase/migrations/0010_account_data_export.sql`
- `supabase/functions/delete-account/index.ts`
- `apps/app/src/infrastructure/supabase/privacy.ts`
- `apps/app/src/infrastructure/supabase/integrations.ts`
- `apps/app/src/application/integrations.ts`
- `apps/app/src/app/privacy.tsx`
- `apps/app/src/app/integrations.tsx`
- `apps/app/__tests__/privacy-session-fencing-test.ts`
- `apps/app/__tests__/integration-consent-revocation-test.ts`
- `apps/app/src/constants/theme.ts`
- `apps/app/src/components/mizan-ui.tsx`
- `apps/app/src/components/screen.tsx`
- `apps/app/src/i18n/number-input.ts`
- `apps/app/src/application/spiritual-grounding.ts`
- `apps/app/src/app/onboarding.tsx`
- `apps/app/src/app/what-if.tsx`
- `apps/app/src/app/cost-of-yes.tsx`
- `apps/app/src/app/human-roi.tsx`
- `apps/app/src/app/insights.tsx`
- `apps/app/src/app/why.tsx`
- `apps/app/src/app/capacity.tsx`
- `apps/app/src/app/life-map.tsx`
- `apps/app/src/app/personal-learning.tsx`
- `apps/app/src/app/personalization.tsx`
- `apps/app/src/app/experiments.tsx`
- `apps/app/src/app/recovery.tsx`
- `apps/app/src/app/life-seasons.tsx`
- `apps/app/src/app/value-alignment.tsx`
- `apps/app/src/app/check-in.tsx`
- `apps/app/src/app/today.tsx`
- `apps/app/src/app/invisible-wins.tsx`
- `apps/app/src/app/settings.tsx`
- `apps/app/__tests__/advanced-tools-test.ts`
- `automation/HUMAN_REQUIRED.md`
