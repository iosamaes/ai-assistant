# MIZAN — Autonomous Product Build Mission

## 0. Authority and operating boundary

This file at `automation/TASK.md` on GitHub `iosamaes/ai-assistant@main` is the sole mission authority for the active automation task.
Product source authority is the same GitHub repository on branch `main`. The local copy at `C:\Users\bofo_\Documents\automation\ai assistant` is owner-only for later pull/testing; workers must not mutate it.
Automation control authority is `automation/README.md`, `automation/WORKER.md`, `automation/TASK.md`, `automation/HUMAN_REQUIRED.md`, and `automation/STATE.json` on GitHub `main`; workers must not depend on the old local `control.py`, `.runtime`, or SQLite state.
Workers must not edit `automation/TASK.md` or `automation/WORKER.md` during mission execution. They may update `automation/HUMAN_REQUIRED.md` under its rules and `automation/STATE.json` only through the lease/fencing/completion protocol in `automation/WORKER.md`.
Track product progress in `docs/PROJECT_STATE.md` on `main`, never by changing this task file.
All four workers are interchangeable executors; continue from current GitHub `main` state instead of assuming a fixed worker role.

Current worker execution mode: GitHub is source control only and GitHub Actions/cloud CI remain disabled. Workers may add/update tests but must not run cloud or local product tests/builds themselves. Execution-dependent quality gates remain pending owner validation after pulling `main` into the local mirror; workers must never invent or claim unrun test results. This transport rule does not relax any product-quality requirement.

## 1. Mission

Design, implement, verify, and hand off a production-grade universal application named **MIZAN**.
MIZAN is a personal life intelligence platform: it helps a person understand current state, detect patterns, protect balance, choose high-leverage actions, run safe personal experiments, and make better long-term decisions.
It is not a habit tracker with prettier charts and must not become a points game.
The product must work as one responsive TypeScript/React Native codebase for Web, Android, and iOS, with Supabase as the backend platform.
The architecture must be extensible enough for a future unicorn-scale platform while remaining deliberately simple today.

## 2. Engineering doctrine — SIMPLE, RIGHT, STRONG

- **Simple:** use the fewest concepts and layers that make the product clear and maintainable.
- **Right:** model the actual domain, preserve scientific honesty, privacy, accessibility, and correct platform behavior.
- **Strong:** typed boundaries, tests, security, graceful failure, observable errors, and reproducible builds.
- Do not create abstractions before at least one real need exists.
- Do not add microservices, queues, brokers, distributed systems, dynamic plugin downloading, or speculative infrastructure.
- Prefer boring, well-supported technology and direct code over frameworks inside frameworks.
- Remove dead code, placeholder architecture, duplicate utilities, and cargo-cult patterns as you go.

## 3. Product north star

Optimize for **long-term human flourishing**, not screen time, streaks, task count, or engagement addiction.
The system should help the user answer five questions:
1. Where am I now?
2. Why might I be here?
3. Where is my current trajectory heading?
4. What is the smallest action with the highest likely positive leverage now?
5. Did that action actually help me, and what did we learn?

The central loop is:
`Observe -> Model state -> Explain uncertainty -> Recommend -> Act -> Measure -> Learn -> Adapt`.

## 4. Product principles that are non-negotiable

- Never claim to measure a person's faith, worth, morality, intelligence, or medical status.
- Spiritual features measure only user-selected practices and self-reported grounding/meaning; participation is optional and removable.
- Never present correlation as proven causation. Causal claims require explicit evidence and confidence labeling.
- Unknown data remains unknown; never convert missing data into failure or a zero score.
- Completion checkboxes alone must not inflate life quality.
- Avoid shame, punishment, broken-streak psychology, dark patterns, manipulative notifications, or addictive mechanics.
- The user owns priorities; the algorithm supports decisions rather than dictating a universal ideal life.
- Balance is relative to the user's chosen season and target distribution, not equal time across all domains.
- Allow sacred/untracked moments and areas the user does not want optimized.
- Explanations must be inspectable: users should be able to see why an insight or recommendation was produced.
- Prefer useful conservative uncertainty over false precision.
- The application must remain useful without any external AI provider.

## 5. Required technology and platform baseline

Use current stable, mutually compatible releases after checking official documentation at implementation time.
Required baseline:
- TypeScript with strict type checking.
- React + React Native using Expo for one universal app targeting Android, iOS, and Web.
- React Native Web for browser rendering; responsive layouts must support phones, tablets, landscape, desktop browsers, and large screens.
- Expo Router unless a concrete compatibility problem justifies a simpler supported alternative.
- Supabase for PostgreSQL, Auth, Row Level Security, Storage, Realtime only where genuinely useful, and Edge Functions only where server-side execution is required.
- A modern test runner compatible with the chosen Expo/TypeScript setup; use React Native Testing Library for component behavior where appropriate.
- End-to-end browser testing for critical Web flows; add mobile E2E only if tooling is stable and proportionate.

Use the package manager already established in the repo; if bootstrapping from empty, prefer the simplest supported workspace setup.
Do not pin architecture to experimental libraries merely because they are new.
Do not create separate product implementations for Web and Native; platform-specific files are allowed only for real platform differences.

## 6. External-service and AI provider rule

No external provider may be hard-coded into domain logic or UI.
Every external capability must sit behind a small typed application-owned interface and adapter.
Examples: LLM/AI, push notifications, health data, calendar, analytics, crash reporting, payments, maps, email, wearable data.
Provider-specific SDK imports must remain at adapter/infrastructure boundaries.
Configuration selects the active provider through environment/config, not branching scattered through product code.
If credentials or owner accounts are missing, add one precise non-duplicate item to `HUMAN_REQUIRED.md`, implement the provider contract plus a deterministic development/fallback implementation, and continue.
Never commit secrets. Maintain `.env.example` with documented variable names and safe defaults where possible.
AI calls requiring secrets must execute through a server-side boundary such as a Supabase Edge Function; never ship private provider keys in the app bundle.
Core MIZAN scoring/recommendation must have a deterministic non-AI path so the application still functions when AI is unavailable.

## 7. Repository architecture target

Start from the actual repository state. If empty, create a compact workspace similar to:

```text
ai assistant/
  apps/app/                 # Universal Expo app: Web + Android + iOS
  packages/core/            # Pure TypeScript domain models and MIZAN intelligence engine
  packages/plugins/         # First-party plugin contracts/registry/modules
  supabase/                 # migrations, policies, seeds, edge functions when required
  docs/PROJECT_STATE.md     # live checkpoint/handoff state
  docs/DECISIONS.md         # concise important decisions only
  .env.example
```

Change this shape only when a concrete technical reason makes another structure simpler.
Keep domain algorithms pure where practical so they can be tested without React, Supabase, browser, or native runtime.
Keep Supabase access out of presentation components.
Use one clear data-access/application boundary rather than repository/service/use-case layers that merely forward calls.
Keep shared UI components local to the app until reuse genuinely warrants extraction.

## 8. Plugin architecture — extensible, not over-engineered

Implement a compile-time typed plugin registry, not downloadable executable plugins.
A plugin may contribute only what is actually needed: metadata, life dimensions, action definitions, optional screens/widgets, permissions/data requirements, and observation adapters.
Core algorithms consume stable domain contracts such as `DimensionDefinition`, `Observation`, `ActionDefinition`, and `PluginManifest` rather than knowing every plugin by name.
Adding a new first-party dimension/plugin should normally require implementing its manifest/module and registering it in one obvious place, not editing the core scoring engine.
Plugins must be independently enableable/disableable where product meaning allows it.
Plugin state and permissions must degrade gracefully when disabled or unavailable.
Do not build a marketplace, runtime sandbox, remote code loader, plugin package manager, or compatibility framework in this task.

## 9. First-party life domains

Ship an initial set that is broad enough to express a whole life while remaining user-controlled:
- Body/health and physical energy.
- Sleep/recovery.
- Mental load and emotional self-report.
- Family and close relationships.
- Work/career and meaningful contribution.
- Finance/financial safety indicators chosen by the user.
- Learning/growth.
- Spiritual grounding/meaning, strictly opt-in and non-judgmental.
- Habits/routines as supporting evidence, never the definition of success.
- Rest/play/recreation.
- Personal environment/time margin where useful.

Users can hide, disable, rename where safe, and reprioritize domains.
Do not require all domains to compute a usable experience.

## 10. Core MIZAN intelligence model

Build a real domain engine, not a collection of UI-calculated scores.
The engine must expose structured outputs with evidence and confidence and must be unit-testable with deterministic fixtures.
Implement these concepts incrementally with explicit contracts and conservative math:

### 10.1 Human State Vector
Represent latent current state such as energy, recovery, mental load, clarity, connection, grounding, perceived control, resilience, and overload risk.
Each state component must carry: value/range, evidence window, confidence, and whether it is observed, inferred, or unknown.
Never fabricate a confident value when observations are sparse.

### 10.2 Personal Baseline
Learn what is normal for this individual rather than assuming population averages are personal truth.
Use robust rolling statistics and minimum evidence thresholds.
Cold-start uses transparent conservative priors or user-selected targets and clearly labels personalization as immature.

### 10.3 Temporal Memory
Support short, medium, and long windows so accumulated patterns matter.
At minimum support useful windows roughly equivalent to current/day, 7 days, 28 days, and 90 days while keeping calculations configurable.
Trend calculations must tolerate gaps, outliers, timezone boundaries, and changed user priorities.

### 10.4 Pattern and causal-hypothesis graph
Maintain a graph of candidate relationships between observations, contexts, actions, and outcomes.
Until evidence is sufficient, label edges as associations/hypotheses, not causes.
Every surfaced relationship must expose sample size/evidence count, direction/effect estimate where meaningful, confidence, and relevant time window.
Allow evidence from explicit N-of-1 experiments to strengthen a hypothesis without claiming universal causality.

### 10.5 Feedback Learning Loop
For recommendations that are acted on, capture lightweight outcome feedback and subsequent observations.
Update action usefulness estimates from actual personal response, with recency weighting and uncertainty.
Do not learn from a tap on `Done` alone; completion is evidence of adherence, not evidence of benefit.

### 10.6 Uncertainty Engine
All inferred insights, action impacts, scenarios, and relationship hypotheses must support a confidence/quality level.
Confidence should consider sample size, data freshness, consistency, missingness, and whether evidence is direct or inferred.
UI language must distinguish `known`, `likely`, `possible`, and `insufficient evidence` rather than showing fake precision.

### 10.7 Life Leverage and The One Move
Rank candidate actions by expected personal benefit, not points.
Use a documented configurable model conceptually combining expected impact, confidence, multi-domain effect, identity alignment, timing, future compounding, and personal fit, balanced against effort, time cost, resistance, fatigue, and risk.
Do not bury unexplained magic constants in components; centralize tunable weights with tests and comments describing intent.
The recommended `One Move` must always show why it was selected and allow the user to decline, defer, or choose an alternative.

### 10.8 Balance and Momentum
Balance measures distance from the user's desired life-season target, not equal allocation.
Momentum measures direction and rate of change with confidence, not just current level.
A person with a modest current state but improving trajectory must be distinguishable from a high current state deteriorating quickly.

### 10.9 Life Debt and recovery
Model accumulated unmet recovery/priority needs as domain-specific `Life Debt` only where the concept is meaningful.
Track amount, direction/velocity, recovery/decay, and urgency/interest qualitatively or numerically with conservative bounds.
Debt must never be moralized; it is a planning signal.

### 10.10 Interaction Risk
Detect combinations whose joint effect may be more important than any single factor, such as low recovery + high workload + no margin.
Use transparent rule/statistical interactions and evidence thresholds; do not produce medical diagnoses or emergency claims from lifestyle telemetry.
When evidence is weak, surface a hypothesis rather than a warning.

### 10.11 Resilience, Fragility, and Life Buffer
Estimate how much spare capacity exists across time, energy, financial margin if user provides it, social support, recovery, and schedule flexibility.
Separate high performance from robustness; a high-output life with no margin can be labeled `low buffer` without judging the person.

### 10.12 Identity and Values Alignment
Let users define identities/roles, values, priorities, and the person they want to become.
Estimate alignment only against self-declared values and observed/self-reported behavior.
Detect `identity drift` as a growing gap and phrase it neutrally with actionable options.

### 10.13 Life Seasons
Support temporary seasons such as building a company, examinations, parenting transitions, Ramadan, travel, recovery, or intense work periods.
A life season changes desired targets and acceptable temporary imbalance without silently normalizing permanent neglect.

### 10.14 Digital Twin / What If
Implement an honest scenario simulator, not a magical predictor.
Given a proposed behavior change, estimate plausible direction/range of affected state variables using personal effect estimates when available and conservative priors otherwise.
Expose assumptions and uncertainty. Never present simulated output as a guaranteed future.
Prefer simple, explainable scenario math before any sophisticated model.

### 10.15 Experiment Engine
Support voluntary personal N-of-1 experiments such as changing bedtime, notification use, walking, or focus routines.
Experiments require a clear hypothesis, duration, observable outcome, consent, and simple comparison logic.
Avoid experiments that make medical treatment decisions or manipulate sensitive spiritual practice.
Results must be framed as personal evidence with limitations.

### 10.16 Recovery Mode / Save My Day
Provide a low-cognitive-load mode for overloaded days.
Reduce choices, suppress nonessential goals, and propose a tiny recovery sequence based on current state.
Pausing, skipping, or stopping must carry no punishment.

### 10.17 Spiritual Grounding
Make this an optional first-party plugin/module.
Support user-selected practices such as prayer, Quran reading, reflection, gratitude, silence, or custom practices.
Measure only adherence or self-reported grounding/meaning effects the user chooses to track.
Never compute an `faith score`, rank religious worth, or infer spirituality from missing data.

### 10.18 Invisible Wins, Cost of Yes, and Human ROI
Allow meaningful wins that are not productivity outputs: resting, saying no, spending time with family, apologizing, disconnecting, or protecting health.
For a proposed commitment, `Cost of Yes` should estimate what time/margin may be displaced using current schedule/context when data exists.
`Human ROI` may compare user-reported benefit against time/effort cost, but must not reduce relationships, worship, or sacred moments to compulsory optimization metrics.

### 10.19 WHY view
Users must be able to ask why they may feel off or why a recommendation appeared.
Return ranked candidate factors with evidence windows, confidence, and plain-language caveats.
Do not diagnose mood, disease, mental illness, or other clinical conditions.

### 10.20 Anti-gaming and anti-over-optimization
Scores are summaries, never rewards.
Do not reward excessive logging or app usage.
Allow users to disable scoring surfaces while retaining insights.
Do not push optimization into every moment; support untracked time and explicit quiet modes.

## 11. Core user experience

The product is Arabic-first with correct RTL behavior and an English locale available from the beginning.
Use a calm, premium, modern visual system: high readability, restrained motion, generous spacing, meaningful hierarchy, and no visual noise.
Support light and dark appearance if it can be implemented cleanly without delaying core correctness.
Every primary flow must work with touch, keyboard where relevant, screen readers, dynamic text scaling, and accessible contrast.
Design for narrow phones first, then adapt intentionally for tablets and wide Web screens rather than merely stretching cards.

Required product surfaces:
- Onboarding and consent/preferences.
- Authentication and account recovery.
- Today/Home dashboard with current state, confidence, priorities, and `The One Move`.
- Quick check-in that is useful in under one minute.
- Life map / domain overview.
- Insights and pattern history.
- WHY explanation surface.
- What If / Digital Twin scenarios.
- Recovery / Save My Day.
- Compass: values, identity, roles, priorities, life season, legacy direction.
- Spiritual Grounding module when enabled.
- Personal experiments.
- Invisible Wins and reflection.
- Goals/routines only as supporting tools, not the main identity of the app.
- Plugin/integration settings.
- Notifications/preferences.
- Privacy, export, account deletion, and data controls.
- Profile/settings and language/appearance.

Navigation must remain shallow and understandable. Do not create a screen for every domain object if a focused surface can handle it.
Every empty state must explain what data is missing and provide a useful next action.
Every loading/error/offline state must be designed, not left as spinner-only or raw exception text.

## 12. Data and backend requirements

Design a normalized but practical Supabase schema around real product needs.
Expected entities include, where justified: profile/preferences, domain configuration, observations/check-ins, actions/action events, goals/routines, values/identity/roles, life seasons, recommendations, feedback/outcomes, insights/pattern evidence, experiments, scenarios, plugin settings, notifications, and audit-relevant consent/preferences.
Do not create tables solely because an object exists in code; persist only data that needs persistence/queryability.
Use migrations for all schema changes and keep seed/demo data clearly separate from production user data.
All user-owned data must be protected by Row Level Security with least-privilege policies.
Do not rely on client filtering as a security boundary.
Use server-side functions only for operations that truly require secrets, elevated permissions, transactional coordination, or provider calls.
Validate untrusted inputs at server boundaries and validate provider outputs before storing or acting on them.
Store timestamps in UTC and treat user timezone as presentation/domain context.
Avoid collecting sensitive data not required for a feature.
Provide account data export and deletion flows consistent with the implemented data model.

## 13. Privacy and security baseline

- No secrets, service-role keys, private API keys, or production credentials in source control.
- Use secure platform storage for auth/session material on native platforms and supported secure browser mechanisms on Web.
- Protect all Supabase tables with explicit RLS unless a table is intentionally public and documented.
- Prevent cross-user access in database tests or automated policy verification.
- Redact secrets and sensitive user content from logs.
- Add error boundaries and structured application errors; user-facing errors must be safe and understandable.
- Avoid storing raw third-party payloads when a minimal normalized subset is enough.
- Consent must be explicit for optional sensitive integrations and can be revoked.
- Health/spiritual/financial plugins remain optional and degrade cleanly when disabled.
- Document the threat model briefly in project docs, focused on realistic risks rather than theoretical exhaustive modeling.
- Do not invent encryption schemes; use platform/database transport and storage primitives correctly.

## 14. Offline, sync, and failure behavior

The app must remain understandable during intermittent connectivity.
Cache enough recent state for Today, check-in history, and key preferences to render meaningfully offline when practical.
Queue only simple idempotent user mutations that can be safely retried; do not build a general distributed sync engine.
When conflict handling matters, prefer explicit server timestamps/version checks and predictable last-write or merge rules documented per entity.
Never silently discard a user's new check-in or reflection because connectivity failed.
External provider failure must not break the deterministic MIZAN core.

## 15. Notifications and engagement

Notifications are optional, respectful, and user-configurable.
Prefer user-scheduled check-ins, experiment reminders, and contextually useful recovery prompts.
No artificial urgency, fear, streak-loss warnings, variable reward loops, or engagement spam.
Notification provider code must obey the external-provider adapter rule.
If production push credentials are unavailable, record the owner action in `HUMAN_REQUIRED.md` and keep local/development behavior testable.

## 16. AI behavior if an AI provider is configured

AI is an explanatory and conversational layer over structured product data, not the source of truth for scoring.
Use structured inputs derived from authorized user data and structured validated outputs.
The AI layer may summarize patterns, explain `Why`, suggest wording, or turn deterministic engine results into natural language.
It must not invent observations, overwrite structured evidence, diagnose users, make medical treatment decisions, or claim certainty the engine does not have.
Store provider prompts/contracts in an obvious versioned location and test parsing/fallback behavior.
Provider outages, malformed outputs, rate limits, or absent keys must fall back gracefully to deterministic copy/templates.

## 17. Project-state and handoff protocol

On the first productive run, create `docs/PROJECT_STATE.md` in the worktree if absent.
It is the live execution ledger, not mission authority.
Keep it concise, current, and useful to the next worker.
It must contain:
- Current checkpoint and status: `NOT_STARTED`, `IN_PROGRESS`, `BLOCKED_HUMAN`, `VERIFYING`, or `DONE`.
- A checklist of all checkpoints in Section 20.
- For the active checkpoint: completed sub-items, remaining sub-items, and exact next executable action.
- Last verified commit/hash if available.
- Tests/builds last run and their outcomes.
- Known technical risks or temporary compromises that still require code work.
- Links/paths to important evidence or screenshots rather than pasting huge logs.

Create `docs/DECISIONS.md` only for significant durable choices that a future worker would otherwise reasonably reopen.
Each decision entry is short: date, decision, reason, consequence.
Do not turn documentation into a second project-management system.

Before coding on every run:
1. Read this TASK.md.
2. Read `HUMAN_REQUIRED.md`.
3. Inspect current GitHub `main` tree/log and latest commit. Treat remote `main` as authoritative and never overwrite newer remote work.
4. Read `docs/PROJECT_STATE.md` if present.
5. Verify the earliest unfinished checkpoint and choose the highest-value currently executable subtask.
6. Inspect the relevant code/tests before editing; never assume state from a previous run summary alone.

At the end of every productive run, update `docs/PROJECT_STATE.md` with verified reality before attempting `complete`.

## 18. Definition of subtask completion

A subtask is `DONE` only when all applicable conditions are true:
- The code is implemented and wired into the real application path, not only a detached demo.
- Types compile for affected packages/apps.
- Relevant unit/component/integration tests exist or an explicit reason is recorded when a test would add no value.
- Existing relevant tests pass.
- Error, loading, empty, permission-denied, and missing-data behavior is handled where applicable.
- Responsive behavior is checked at representative narrow phone, tablet, and wide Web sizes for UI work.
- RTL and English/localized layout are checked for user-facing UI work.
- Supabase schema changes include migrations and RLS/policy updates where applicable.
- Provider work includes the owned interface, adapter boundary, validation, and fallback behavior.
- No secret, fake production credential, commented-out implementation, or unresolved temporary bypass is left hidden.
- Any unavoidable owner action is recorded once in `HUMAN_REQUIRED.md` without stopping other work.
- `docs/PROJECT_STATE.md` accurately reflects what was verified, not what was merely attempted.

Do not mark a subtask done because code was generated or because a command started successfully.
Do not hide incomplete work behind TODO comments. Record remaining work explicitly in project state.

## 19. Definition of checkpoint handoff

A checkpoint may move to `DONE` only when:
- Every required subtask in that checkpoint satisfies Section 18.
- Its checkpoint quality gate passes.
- The app still launches through the primary development path.
- No known regression from the checkpoint is left unfixed unless blocked exclusively by a documented owner action.
- The next checkpoint has an explicit first action in `docs/PROJECT_STATE.md`.
- A coherent commit is created when authorized by the automation lease and repository state permits it.

If the active checkpoint is blocked only by owner action, mark it `BLOCKED_HUMAN`, record the Human Required item, and immediately continue any safe independent work from later checkpoints.
Never wait for the owner while useful authorized work remains.

## 20. Sequential execution checkpoints

Workers follow the earliest unfinished checkpoint as the primary path. They may advance independent later work only when the earlier checkpoint is blocked exclusively by a Human Required item.

### CP0 — Reconnaissance, product model, and executable plan
**Goal:** understand the empty/current repository and convert this mission into a concrete build path without speculative design.
Required:
- Inspect repository, installed tooling, git state, and local capabilities.
- Verify current official Expo/React Native/Supabase compatibility before choosing versions.
- Create `docs/PROJECT_STATE.md` and minimal `docs/DECISIONS.md` if needed.
- Define the compact repository structure, domain vocabulary, plugin contract shape, data ownership, and provider boundaries.
- Sketch the first Supabase entity map and security ownership rules.
- Define deterministic fixtures for cold start, normal personalized history, sparse/missing data, and overloaded/recovery state.
- Document the first end-to-end vertical slice: onboarding -> check-in -> engine -> One Move -> feedback -> persisted learning.
**Gate:** another worker can explain the architecture from the repo/docs and there is a clear first vertical slice with no unresolved structural ambiguity.

### CP1 — Universal application foundation
**Goal:** bootable typed product shell on Web, Android, and iOS targets.
Required:
- Bootstrap workspace, Expo universal app, routing, strict TypeScript, lint/format scripts, test command, environment validation, and CI-friendly scripts.
- Establish design tokens, typography, spacing, RTL-aware primitives, responsive layout primitives, error boundary, and app-level loading/error handling.
- Add Arabic and English localization structure with Arabic default.
- Add minimal navigation shell and placeholder-free real onboarding/home/settings routes wired to shared app state.
- Add core/plugin packages with only the contracts needed for the next slice.
**Gate:** typecheck/lint/tests pass; Web renders; Expo native project resolves for Android/iOS; representative responsive screenshots or automated visual evidence are recorded.

### CP2 — Supabase, auth, ownership, and persistence
**Goal:** secure real persistence with user ownership.
Required:
- Create migrations for the minimum entities required by the vertical slice and future-proof only obvious fields/relationships.
- Implement Supabase client/server configuration with environment validation.
- Implement authentication, session restoration, sign-out, and account recovery using supported Supabase flows.
- Add RLS policies for every user-owned table and automated checks proving one user cannot read/write another user's rows.
- Add typed data access for profiles/preferences, observations/check-ins, actions, feedback, and plugin settings.
- Add seed/dev fixtures separately from user production data.
- Handle loading/offline/auth-expired/errors without exposing raw backend messages.
**Gate:** a fresh user can authenticate, create/read/update their own vertical-slice data, cannot access another user's data, and migrations can recreate the schema reproducibly.

### CP3 — MIZAN deterministic intelligence core
**Goal:** a serious, explainable, test-first engine independent from UI and external AI.
Required:
- Implement canonical domain types and unknown/missing-data semantics.
- Implement Human State Vector derivation with evidence/confidence.
- Implement Personal Baseline and cold-start maturity state.
- Implement temporal windows/trends and Balance/Momentum.
- Implement Life Leverage ranking and `The One Move` explanation payload.
- Implement initial Life Debt, buffer/resilience, and interaction-risk models conservatively.
- Implement confidence/quality calculation and evidence references for all inferred outputs.
- Centralize configurable weights/thresholds with bounded values and comments explaining intent.
- Build deterministic fixtures and extensive unit tests covering normal, sparse, contradictory, extreme, timezone, and missing-data cases.
**Gate:** engine tests pass without React/Supabase/network; identical input produces identical output; no unknown input silently becomes zero; every recommendation exposes evidence and confidence.

### CP4 — First complete daily life loop
**Goal:** make MIZAN genuinely useful without advanced integrations.
Required:
- Finish onboarding for values, priorities, enabled domains, privacy choices, baseline targets, life season, and optional spiritual module.
- Implement sub-one-minute check-in with thoughtful defaults and unknown/skip options.
- Build Today/Home showing current state, confidence, Balance, Momentum, and One Move without overwhelming the user.
- Build One Move accept/defer/decline/alternative flow and record action events correctly.
- Capture lightweight post-action usefulness/outcome feedback.
- Persist the loop to Supabase and reflect updated learning/state after feedback.
- Add useful empty states and a clearly labeled demo fixture mode for development only.
**Gate:** a new user can complete onboarding -> check in -> receive an explainable One Move -> act or decline -> provide feedback -> see subsequent state/history change across restart/login.

### CP5 — Insight, explanation, and personal-learning surfaces
**Goal:** make the system understandable and increasingly personal.
Required:
- Implement Life Map/domain overview and trend history.
- Implement Insights with evidence count, window, confidence, and clear correlation language.
- Implement WHY view with ranked candidate factors and evidence.
- Implement Feedback Learning updates to personal action utility estimates.
- Implement pattern/causal-hypothesis graph storage/model with conservative surfacing thresholds.
- Implement cold-start maturity progression so the UI says when it is still learning.
- Add identity/value alignment and neutral identity-drift insights.
- Add Invisible Wins/reflection capture without gamification.
**Gate:** seeded histories produce reproducible insights; sparse histories suppress unsupported claims; users can inspect evidence and understand why a recommendation or insight exists.

### CP6 — Advanced decision tools
**Goal:** deliver the distinctive MIZAN features beyond ordinary wellness apps.
Required:
- Implement What If scenario simulator with assumptions and uncertainty ranges.
- Implement voluntary Experiment Engine with hypothesis, plan, tracking, completion, and personal-evidence result.
- Implement Recovery / Save My Day low-load flow.
- Implement Life Debt detail and recovery direction where sufficient data exists.
- Implement Resilience/Fragility/Life Buffer presentation without shame or false precision.
- Implement Cost of Yes using known time/margin context and explicitly show when evidence is insufficient.
- Implement Life Seasons editing/history and recalculation of target balance.
**Gate:** each tool works end-to-end with both meaningful-data and insufficient-data paths, and scenario/experiment outputs cannot be mistaken for guaranteed predictions.

### CP7 — Plugins and provider boundaries
**Goal:** prove extensibility with real first-party modules, without speculative framework work.
Required:
- Finalize the compile-time plugin contract and registry from actual usage.
- Implement first-party domain plugins/modules for the initial domain set, including opt-in Spiritual Grounding.
- Demonstrate that a small new sample plugin can be added without changing core engine logic.
- Add plugin enable/disable behavior and permission/data-availability states.
- Implement application-owned interfaces for any external capabilities actually used.
- Implement deterministic/mock/fallback adapters where credentials are absent.
- If an AI provider is configured, route it through a server-side provider adapter with validated structured output and deterministic fallback.
**Gate:** disabling a plugin does not crash or corrupt engine state; sample plugin integration does not require core scoring edits; provider selection is centralized and no UI/domain code imports a provider SDK directly.

### CP8 — Reliability, offline tolerance, and sync behavior
**Goal:** preserve user trust under bad networks and interrupted sessions.
Required:
- Add appropriate query caching/persistence for recent useful state.
- Preserve new check-ins/reflections during temporary network failure using the simplest safe retry strategy.
- Make write retries idempotent where duplicate creation would harm data.
- Handle expired sessions, provider outages, failed sync, and partial data explicitly.
- Add version/timestamp conflict handling only where concurrent edits realistically occur.
- Verify restart/reload behavior across Web and native development runtime.
**Gate:** critical daily loop does not lose user-entered data in tested offline/reconnect cases and external-provider failures do not disable the deterministic core.

### CP9 — Responsive UX, accessibility, localization, and polish
**Goal:** make the same product feel intentional across devices.
Required:
- Audit every primary screen at narrow phone, common phone, tablet portrait/landscape, and wide Web layouts.
- Fix RTL mirroring, text alignment, icon direction where semantic, truncation, dynamic type, keyboard navigation, focus, and screen-reader labels.
- Complete Arabic and English strings for all shipped user-facing text; no untranslated production literals.
- Verify light/dark modes if shipped.
- Reduce unnecessary motion and honor platform accessibility preferences where available.
- Tune perceived performance: avoid large rerender storms, oversized lists, and blocking startup work.
**Gate:** no primary flow has horizontal overflow, unusable tap targets, inaccessible unlabeled controls, broken RTL, or layout collapse at representative widths.

### CP10 — Security, privacy, and owner-data control
**Goal:** make the product safe enough to trust with personal life data.
Required:
- Audit all Supabase tables/functions/storage for ownership and RLS gaps.
- Add cross-user authorization tests and verify no service-role secret reaches client bundles.
- Review logs/error reporting for sensitive-data leakage.
- Implement privacy/settings controls for optional modules and integrations.
- Implement account data export in a portable readable format.
- Implement account deletion covering application-owned user data and document any provider-side limitation requiring owner action.
- Add concise privacy/threat-model documentation tied to actual code.
- Verify consent revocation disables future optional-data collection.
**Gate:** automated authorization checks pass, export/delete flows work in the available environment, and no known critical privacy/security defect remains.

### CP11 — Test matrix, performance, and release readiness
**Goal:** prove the product as a coherent application rather than a collection of implemented features.
Required:
- Run full TypeScript, lint, unit, component, integration, database/policy, and critical Web E2E suites.
- Add E2E coverage for auth/onboarding, daily loop, feedback learning, recovery, scenario, settings/privacy, and key plugin toggling.
- Run production Web export/build and inspect browser console/network for critical errors.
- Run Expo diagnostics and native bundle/export checks for Android and iOS targets available from the environment.
- Where local OS cannot produce a signed target, validate configuration/build graph as far as possible and record signing/store credentials in `HUMAN_REQUIRED.md` only if owner action is actually needed.
- Measure startup and common interaction performance enough to catch obvious blocking work, large bundle regressions, or pathological rerenders.
- Remove dev-only debug UI, stale mocks in production paths, dead feature flags, console noise, and unused dependencies.
- Verify clean setup from documented commands on a fresh dependency install where feasible.
**Gate:** all required automated checks are green, production Web build is functional, native target configuration resolves, and remaining owner-only release actions are explicitly documented rather than hidden.

### CP12 — Independent final review and handoff
**Goal:** prove completion independently before automation declares the mission done.
Required for the worker proposing completion:
- Re-read this entire TASK.md and `docs/PROJECT_STATE.md` against the actual repository.
- Run the full quality command set from a clean enough state to trust the result.
- Manually exercise the critical Web journey and at least one native development target if available.
- Inspect git status for accidental secrets, generated junk, uncommitted required work, or unrelated damage.
- Verify all checkpoints are truthfully `DONE` or that any remaining Human Required item is explicitly outside code-complete Definition of Done.
- Produce a concise final verification section in `docs/PROJECT_STATE.md` listing exact commands/results, known non-blocking limitations, and owner release actions.
- Call `complete`; expect `REVIEW_REQUIRED` for the first valid completion candidate.

Required for the different reviewing worker:
- Do not rubber-stamp the previous worker.
- Independently inspect the implementation, run representative full tests/builds, and sample critical product flows.
- Reopen/fix any failed checkpoint, regression, security flaw, false algorithm claim, broken responsive state, or hidden placeholder.
- If fixes are required, clear the completion candidate through normal authorized mutation and continue work; do not call final complete until the repository again satisfies all gates.
- Only after independent verification call `complete` so the control plane can return `TASK_DONE`.

**Gate:** two different workers have independently verified the same task digest, with the second reviewer finding no unresolved code/product defect that violates the Definition of Done.

## 21. Human Required protocol for this mission

Follow the existing `HUMAN_REQUIRED.md` rules exactly.
Owner intervention NEVER pauses useful work and NEVER disables schedules.
Typical legitimate owner items include: production credentials, paid-provider account creation, OAuth console approval, Apple/Google signing ownership, store legal metadata, domain/DNS ownership, or a product/legal choice workers cannot safely make.
Do not create Human Required items for decisions a competent engineering team can make reversibly from this task.
Before adding an item, check for an existing open equivalent and update nothing if duplicated.
Phrase each item with concrete evidence and one exact owner action.
Where an interface/fallback can be built without credentials, build it now and record only the final owner activation step.
If an owner item blocks one feature, continue all independent checkpoints/features.
If absolutely every safe remaining action is blocked by the owner, end only the current run, keep schedules enabled, and leave exact next action in project state.

## 22. Whole-task Definition of Done

The mission is code/product complete only when all of the following are true:
- CP0 through CP12 requirements have been implemented and verified against the actual repository.
- The universal app runs as one product on Web and resolves correctly for Android and iOS targets.
- Arabic RTL and English experiences are functional across all primary flows and representative screen classes.
- Supabase migrations recreate the required backend schema; authentication, persistence, RLS, and user ownership are verified.
- Core MIZAN intelligence is deterministic without AI, tested, explainable, uncertainty-aware, and handles sparse/missing data honestly.
- The full daily learning loop works end-to-end: onboarding -> observation/check-in -> state -> One Move -> action/decline -> feedback -> updated personal model.
- Advanced tools required by CP5/CP6 are usable and clearly distinguish evidence, hypotheses, and simulations from facts.
- Plugin architecture is proven by the shipped first-party modules and a sample addition without core-engine edits.
- External providers are replaceable behind application-owned adapters; no provider key or SDK leaks into domain logic.
- Critical offline/reconnect and provider-failure cases preserve user trust and data.
- Privacy controls, export, deletion, optional module consent, and security/RLS checks function as implemented.
- Full automated quality suite is green and no known critical/high-severity defect remains.
- Production Web build/export succeeds and critical flows are browser-verified without fatal console/runtime errors.
- Android/iOS project configuration and native bundle/export checks pass to the maximum possible without owner signing credentials.
- `README.md` contains concise setup, environment, local Supabase, run, test, and build instructions that a new engineer can follow.
- `docs/PROJECT_STATE.md` contains final verified evidence and no hidden required engineering work remains.
- No production path depends on demo data, fake success responses, unimplemented buttons, placeholder screens, or TODO-only behavior.
- Git working state preserves intentional work and contains no committed secrets or accidental generated artifacts.

Store publication, paid production accounts, legal terms supplied by the owner, domains/DNS, and signing credentials are owner release operations unless this task explicitly states otherwise; code must be ready to accept them without redesign.
An open Human Required item blocks `TASK_DONE` only when it prevents one of the code/product completion conditions above from being honestly verified.

## 23. Autonomous decision rules

Do not ask the owner routine implementation questions during execution.
When this task leaves a reversible detail open, choose the simplest option consistent with current official platform guidance, record a durable decision only if future workers need it, and proceed.
When two approaches are viable, prefer in order:
1. fewer moving parts,
2. stronger type/security guarantees,
3. broader Web/Android/iOS compatibility,
4. easier testability,
5. lower provider lock-in,
6. lower long-term maintenance cost.

Do not rewrite working subsystems merely for style.
Refactor when current code causes duplicated logic, incorrect domain boundaries, testing difficulty, performance problems, or a real upcoming requirement.
Do not introduce a generic abstraction for one implementation unless the provider/plugin boundary in this task explicitly requires replaceability.
Use feature flags/config only for real optional modules or provider selection; do not build a general feature-flag platform.

## 24. Quality and observability expectations

Use typed structured errors and central app-level handling rather than scattered raw `console.error` user experiences.
Keep development diagnostics useful and production logging minimal/safe.
If analytics/crash reporting is added, put it behind a tiny provider interface and make the app work when it is absent.
Track product events only when they support debugging or product understanding; do not collect sensitive content merely because it may be useful later.
Use performance profiling only where measurements indicate a problem; avoid premature memoization everywhere.
Keep dependency count intentional and remove abandoned packages.
All generated schemas/types should be reproducible from documented commands when practical.

## 25. Prohibited shortcuts

Do not:
- Replace Supabase integration with local-only storage and call it complete.
- Fake AI/provider success in production paths.
- Hard-code a specific LLM/provider into UI/domain behavior.
- Put service-role credentials in client code.
- Disable RLS to make development easier.
- Return invented scores when evidence is missing.
- Label correlations as causal facts.
- Build only a desktop Web mock and call React Native complete.
- Build separate divergent applications for Web and Native.
- Mark screens complete while buttons are decorative.
- Silence failing tests, loosen TypeScript globally, or disable lint rules merely to achieve green output.
- Delete or reset unexplained existing work.
- Stop because an owner credential or approval is missing when independent useful work remains.

## 26. Required final deliverables in the repository

At completion the repository must contain, at minimum:
- The universal Expo/React Native application source.
- The pure TypeScript MIZAN core engine and its tests.
- The first-party plugin registry/modules and sample plugin proof.
- Supabase migrations, policies, seed/dev setup, and any required Edge Functions.
- Environment example and validation.
- Automated tests and E2E configuration used by the quality gates.
- `README.md` with setup/run/test/build instructions.
- `docs/PROJECT_STATE.md` with final evidence.
- `docs/DECISIONS.md` containing only significant durable decisions.
- Concise architecture/security notes where needed to explain boundaries and RLS/provider behavior.
- No required deliverable may exist only in a worker's chat/session memory.

## 27. Final product standard

The completed application should feel like a coherent premium product, not a generated feature catalogue.
Its value must come from a strong daily loop, trustworthy personal intelligence, calm decision support, and progressively better personalization.
The UI should make complex intelligence feel simple.
The code should make future additions straightforward without forcing today's application to pay the complexity cost of hypothetical scale.
The guiding standard for every decision remains:

**SIMPLE. RIGHT. STRONG.**

Build continuously from the earliest unfinished checkpoint until the Definition of Done is honestly satisfied, then use the automation's two-worker independent completion protocol.
