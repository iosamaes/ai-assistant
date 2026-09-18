# Worker Contract — GitHub Native

Workers: `auto1`, `auto2`, `auto3`, `auto4`. All four are interchangeable executors.

## 1. Start every run
1. Inspect the four exact recurring automations `auto1`..`auto4`. If `automation/TASK.md` is active and a sibling recurring schedule is disabled without a fresh explicit owner instruction, re-enable that exact existing schedule. Never create duplicates.
2. Fetch `automation/README.md`, `automation/WORKER.md`, `automation/TASK.md`, `automation/HUMAN_REQUIRED.md`, and `automation/STATE.json` from `iosamaes/ai-assistant@main`.
3. Generate a fresh UUID `run_id`.
4. Treat the current Git blob SHA of `automation/TASK.md` as `task_digest`.
5. Append `JOIN | worker=<name> | run_id=<uuid> | task_digest=<sha>` to GitHub issue #1.

## 2. GitHub-native wake
Read the current `STATE.json` content and its current blob SHA.

- If `TASK.md` is empty/whitespace: outcome `IDLE_NO_TASK`; append EXIT and make no product/backend mutation.
- If `completed_task_digest == task_digest`: outcome `TASK_DONE`; disable only your own recurring schedule, append EXIT, and stop.
- If the lease belongs to the same `task_digest`, has a non-null owner, and `heartbeat_at` is less than `stale_after_seconds` old: outcome `BUSY`; append EXIT and stop with all recurring schedules enabled.
- Otherwise acquire the lease: increment `generation`; set `owner_worker`, `owner_run_id`, `heartbeat_at` to current UTC ISO-8601, and `lease_task_digest=task_digest`. Preserve completion fields. Update `STATE.json` using the exact blob SHA just read. If the update conflicts, refetch and re-evaluate from scratch. Never assume acquisition succeeded until a refetch shows the exact tuple.
- Successful acquisition outcome is `WORK`; retain exact `worker/run_id/generation/task_digest`.

## 3. Authority check / can-write
Immediately before every coherent GitHub or Supabase mutation batch, and immediately before every product-file GitHub update:
1. Refetch `TASK.md`; if its blob SHA differs from retained `task_digest`, stop mutation (`TASK_CHANGED`).
2. Refetch `STATE.json` and verify exact `owner_worker`, `owner_run_id`, `generation`, and `lease_task_digest` match the retained tuple. Otherwise stop mutation (`FENCED`).
3. Refresh `heartbeat_at` in `STATE.json` with an optimistic-SHA update. If that update conflicts, refetch and re-evaluate; do not mutate product/backend until authority is proven again.
4. After successful heartbeat refresh, refetch current `main` state for every product file being edited. Never overwrite newer work.

`stale_after_seconds` is intentionally 900 seconds for staggered recurring workers. A long-running worker should refresh the lease at least every 5 minutes while actively working, and always before mutations.

## 4. Product/backend boundaries
- Product source authority is GitHub `iosamaes/ai-assistant`, branch `main`.
- Do not mutate the owner-only local mirror `C:\Users\bofo_\Documents\automation\ai assistant`.
- Backend/schema authority is Supabase project `olfhjnropdrnujgpidfi` only.
- For schema changes, commit migration SQL to the repository and apply corresponding DDL with Supabase `apply_migration`.
- Never switch Supabase projects, create another project, or commit service-role/database secrets.
- Public client config uses `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Never create branches/worktrees/run folders/queues/brokers/handoff files.
- Never create/modify `.github/workflows/**`; never enable/trigger/rerun/depend on GitHub Actions or cloud CI.

## 5. HUMAN_REQUIRED
Before adding anything, fetch current `automation/HUMAN_REQUIRED.md` and avoid duplicates. Add one concise open item containing blocker, evidence, and exact owner action. Continue every other safe authorized `TASK.md` item. Human-required items never disable schedules.

## 6. Attendance / heartbeat log
Issue #1 is append-only telemetry, not authority. Post:
- `JOIN` once at run start.
- `HEARTBEAT` only for materially long runs (roughly every 5 minutes, or after a major mutation batch).
- `EXIT | outcome=<WORK_END|BUSY|IDLE_NO_TASK|FENCED|TASK_CHANGED|REVIEW_REQUIRED|TASK_DONE|BLOCKED_HUMAN> | summary=<concise>` before ending.
- For `WORK_END` or `BLOCKED_HUMAN` after holding a lease, do not post EXIT until the normal lease-release protocol below has reached a terminal result. Include `lease_released=true` only after a refetch proves the active lease fields are empty.
Do not log secrets or private user content.

## 7. Normal lease release
The 900-second stale timeout is crash recovery only. A healthy worker must release its lease immediately when a normal work run ends.

Before EXIT with `WORK_END` or `BLOCKED_HUMAN` after acquiring `WORK`:
1. Refetch `TASK.md`. If its blob SHA differs from the retained `task_digest`, do not mutate `STATE.json`; outcome becomes `TASK_CHANGED`.
2. Refetch `STATE.json` and verify the exact retained tuple: `owner_worker`, `owner_run_id`, `generation`, and `lease_task_digest`. If it no longer matches, do not mutate state; outcome becomes `FENCED`.
3. Using the exact current `STATE.json` blob SHA, set only `owner_worker=null`, `owner_run_id=null`, `heartbeat_at=null`, and `lease_task_digest=null`. Preserve `generation`, candidate/completion fields, runtime issue number, notes, and every unrelated field.
4. Optimistic-update `STATE.json`, then refetch it. Normal release is successful only when the active lease fields are confirmed empty.
5. If the optimistic update conflicts, refetch. Never force-overwrite. If the retained tuple still exactly owns the lease, retry the release with the newly fetched blob SHA; if ownership changed, stop without mutation as `FENCED`.
6. Only after verified release may the worker append `EXIT | outcome=WORK_END|BLOCKED_HUMAN | ... | lease_released=true`.

Never attempt normal release for `BUSY`, `IDLE_NO_TASK`, `FENCED`, or `TASK_CHANGED`; those outcomes either never owned the lease or no longer have authority to mutate it. `REVIEW_REQUIRED` and `TASK_DONE` release through the completion protocol below.

## 8. Completion protocol
Only after independently reviewing the full current Definition of Done in `TASK.md`:
- Refetch/can-write first.
- If no completion candidate exists for this `task_digest`, set `candidate_worker=<your worker>` and `candidate_task_digest=task_digest`, clear the active lease, and preserve `completed_task_digest`; optimistic-update `STATE.json`, then refetch to verify the lease is empty. Outcome `REVIEW_REQUIRED`; keep all schedules enabled.
- If a candidate exists for this `task_digest` from the same worker, do not self-approve; clear lease if needed, refetch to verify, and return `REVIEW_REQUIRED`.
- If a candidate exists for this `task_digest` from a different worker and your independent review proves the full mission done, set `completed_task_digest=task_digest`, clear candidate fields and lease fields, optimistic-update, refetch to verify, then outcome `TASK_DONE` and disable only your own recurring schedule. Other workers will observe `TASK_DONE` on their next wake and disable themselves.
- If defects remain, clear the completion candidate only while holding the valid lease, continue authorized work, and do not mark complete.

## 9. Conflict rule
Any GitHub optimistic-write conflict means another actor changed that control file. Refetch; never retry with stale content and never force-overwrite. A retry is allowed only when the freshly refetched state still proves the same retained lease tuple owns the write. External commits on `main` are valid current state.