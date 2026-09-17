# AI Assistant GitHub Automation Control

This directory is the authoritative control plane for `auto1`, `auto2`, `auto3`, and `auto4`.

## Authorities
- Repository: `iosamaes/ai-assistant`
- Branch: `main`
- Mission authority: `automation/TASK.md`
- Worker contract: `automation/WORKER.md`
- Owner-action list: `automation/HUMAN_REQUIRED.md`
- Exclusive lease/completion state: `automation/STATE.json`
- Runtime attendance log: GitHub issue `#1` (`Automation Runtime Log`)
- Product source: the same repository/branch outside `automation/`
- Supabase authority: project `olfhjnropdrnujgpidfi` (`ai assistant`)
- Owner-only local mirror/testing copy: `C:\Users\bofo_\Documents\automation\ai assistant`

The local folder `C:\Users\bofo_\Documents\automation` is no longer runtime authority for workers. It may remain as an owner backup only. Workers must not depend on Remote Desktop Commander, a local SQLite database, `control.py`, or the local product mirror to wake, coordinate, work, heartbeat, or complete.

## GitHub-native control model
`TASK.md` is the sole mission authority. An empty/whitespace-only `TASK.md` means no active task. The Git blob SHA of `automation/TASK.md` is the `task_digest` for a run.

`STATE.json` replaces the old local SQLite lease. The file is updated with GitHub Contents API optimistic concurrency using its current blob SHA. A worker may mutate product/Supabase state only while the exact tuple `worker + run_id + generation + task_digest` matches the live lease.

`HUMAN_REQUIRED.md` is non-blocking. Workers add one concise non-duplicate owner action only when genuinely needed, then continue every other safe authorized mission item.

Issue #1 is append-only operational telemetry. Workers post concise `JOIN`, optional `HEARTBEAT`, and `EXIT` comments there. It is never mission authority and never grants write permission.

## Safety
- Never create branches/worktrees/queues/brokers/handoff files for worker execution.
- Work directly on `main`; refresh `main` before every product mutation.
- Never create or modify `.github/workflows/**`, trigger GitHub Actions, or depend on cloud CI.
- Never force-overwrite newer remote work.
- Never commit secrets.
- Product validation remains owner/local unless `TASK.md` explicitly requires an available non-cloud verification.

Read `WORKER.md` for the exact wake/lease/fencing/complete protocol.