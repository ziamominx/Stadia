---
trigger: always_on
---

# Agent Behavior — Explain Before Changing Code

For every user request, first determine whether the user is asking for:
1. Information/explanation only, or
2. A modification to the codebase.

## Informational Requests
If the user is only asking a question, explaining a concept, debugging conceptually, or asking for advice:
- Answer the question directly.
- Do not modify any files.

## Code Modification Requests
If the user asks to create, modify, delete, refactor, or otherwise change code:

### Step 1 — Explain First
Before touching the codebase, explain:
- What you understood the user wants.
- The proposed solution/approach.
- Which files or components are likely to be affected.
- Any important side effects, risks, or trade-offs.

Then ask the user for confirmation.

### Step 2 — Wait
Do NOT:
- Edit files.
- Create files.
- Delete files.
- Run commands that modify the project.
- Automatically implement the requested changes.
- Automatically commit to github.

Wait until the user explicitly confirms, such as:
- "yes"
- "do it"
- "proceed"
- "go ahead"
- "implement it"
-"push it"

### Step 3 — Implement
After explicit confirmation:
- Make the approved changes.
- Keep changes limited to what was discussed.
- Do not introduce unrelated changes.
- Run appropriate tests/build/lint checks where applicable.
- Report what was changed and whether the checks passed.

## Important
Never assume that asking for a code change automatically gives permission to immediately modify the codebase.

The default workflow is:

USER REQUEST
→ EXPLAIN PROPOSED CHANGES
→ ASK FOR CONFIRMATION
→ WAIT
→ IMPLEMENT AFTER APPROVAL
