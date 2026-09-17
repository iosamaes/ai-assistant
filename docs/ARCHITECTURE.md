# MIZAN Architecture — CP0 Baseline

## Product boundary
MIZAN is one universal Expo/React Native application for Web, Android, and iOS. The deterministic life-intelligence engine is pure TypeScript and does not depend on React, Supabase, or an AI provider. Supabase supplies persistence/auth/security. External capabilities sit behind application-owned adapters.

## Repository shape
- `apps/app`: Expo Router application and presentation/application orchestration.
- `packages/core`: pure domain models, fixtures, calculations, recommendation/explanation outputs.
- `packages/plugins`: compile-time first-party plugin contracts, manifests, and registry.
- `supabase`: migrations, seed data, RLS/policies, and Edge Functions only when server-side secrets/privilege are required.
- `docs`: live project state plus durable architecture/security decisions.

Do not add services/layers merely to mirror textbook architecture. UI may call a small typed application/data-access boundary; that boundary talks to Supabase and core functions.

## Domain vocabulary
- `Observation`: timestamped evidence from user input, device/integration, or inference.
- `DimensionDefinition`: a life domain the user can prioritize or disable.
- `HumanStateVector`: current latent state components, each with value/unknown, evidence, source, and confidence.
- `ActionDefinition`: a candidate behavior with time/effort/risk metadata and affected dimensions.
- `RecommendationCandidate`: personalized estimated action value before ranking.
- `OneMove`: selected recommendation plus evidence, confidence, reason, and alternatives.
- `UserTargets`: current life-season priorities/weights.
- `FeedbackOutcome`: adherence plus user-reported/subsequent evidence of benefit; completion alone is not benefit.
- `PluginManifest`: compile-time contribution of dimensions/actions and optional data requirements.

## First vertical slice
1. User creates/signs into an account and completes minimal onboarding: locale, enabled domains, values/priorities, life season, privacy choices.
2. User performs a sub-one-minute check-in using skip/unknown where needed.
3. Check-in persists as owned observations.
4. Core derives Human State Vector + confidence and ranks safe candidate actions.
5. Today shows Balance/Momentum summary and an explainable `One Move`.
6. User accepts, defers, declines, or chooses an alternative; event persists.
7. Later lightweight feedback captures usefulness/outcome evidence.
8. Core recalculates using prior observations/outcome evidence so the next recommendation can change.

## Initial Supabase entity map
Persist only what must survive/query across sessions:
- `profiles`: one row per auth user; locale/timezone and coarse onboarding status.
- `domain_preferences`: user-owned enablement, priority/target weight, optional custom label.
- `observations`: user-owned normalized check-ins/integration evidence; source, metric, typed value, observed timestamp.
- `action_events`: recommendation/action lifecycle events such as offered, accepted, deferred, declined, completed.
- `feedback_outcomes`: user-owned outcome/usefulness evidence attached to an action event.
- `plugin_settings`: user-owned plugin enablement/consent/config that contains no provider secret.
- Later checkpoints add values/roles/seasons, experiments, scenario snapshots, and durable insight evidence only when the feature is implemented.

## Ownership and RLS rules
- Every user-owned row has non-null `user_id uuid references auth.users(id)` unless ownership is inherited safely through a parent and policy remains auditable.
- Client-visible user tables enable RLS immediately.
- `SELECT/INSERT/UPDATE/DELETE` policies target `authenticated` and combine ownership with `(select auth.uid()) = user_id`; UPDATE also uses `WITH CHECK`.
- Never use user-editable `user_metadata` for authorization.
- Publishable client key is allowed in the app; service-role/secret keys never enter the client bundle.
- Views exposed to clients must preserve RLS semantics (security-invoker where supported) or remain outside exposed schemas.
- Cross-user negative tests are mandatory before CP2 is done.

## Provider boundaries
- `AIProvider`: structured explanation/summarization only; deterministic core remains source of truth. Secret-backed implementation is server-side.
- `NotificationProvider`: local scheduling and future push adapter; absence must not break app.
- Future health/calendar/analytics/payment providers get a small interface only when a shipped feature needs one.
- Provider SDK imports stay inside adapters; UI/core consume application-owned types.

## Plugin boundary
A first-party plugin can contribute metadata, dimensions, actions, and optional observation adapters. The registry is static/compile-time. Adding a plugin must not require edits to core scoring formulas. No marketplace, runtime code loading, or remote plugins.

## Cold start and scientific honesty
- Missing observations remain unknown rather than zero.
- Cold-start priors/targets are visibly provisional and have low confidence.
- Personalization maturity advances only with evidence volume/freshness/consistency.
- Associations are labeled as hypotheses until experiment/personal evidence supports stronger language.
- Scenario outputs are plausible ranges with assumptions, never guaranteed predictions.
