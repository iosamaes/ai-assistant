# HUMAN_REQUIRED

This is the non-blocking owner-action list.

Rules:
- A human-required item NEVER stops workers or disables schedules.
- Before adding, read this file and do not duplicate an existing open item.
- Record the blocker, evidence, and exact owner action needed.
- Continue every other useful authorized part of TASK.md immediately.
- If nothing else can safely progress, end only the current run and keep schedules enabled.
- Do not mark TASK_DONE while the current Definition of Done is blocked by an open item.
- Move an item to Resolved only after the required owner action/evidence actually exists.
- This file is not task authority or a work queue; TASK.md remains the sole mission authority.

## Open items

Format: `- [ ] <timestamp> | <worker> | <blocker> | Owner action: <exact action>`

## Resolved items

Format: `- [x] <original item> | Resolved: <what changed>`
- [ ] 2026-09-17 18:23:44 +03:00 | auto2 | Windows desktop is locked; GPT Agent screen capture shows the normal 'Enter your PIN' lock screen, so physical UI verification for true phone-width/locale interactions must wait. Evidence: C:\Users\bofo_\Documents\Agents\GPT-Agent\auto2-screen.png | Owner action: unlock the Windows user session normally (do not share the PIN); workers will resume UI verification on a later run.
