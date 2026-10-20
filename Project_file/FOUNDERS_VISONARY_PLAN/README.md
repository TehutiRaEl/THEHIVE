# FOUNDERS_VISONARY_PLAN/

Step-by-step build guides written **for the founder to carry out by hand**: the dashboard clicks, settings and checks that no pull request or agent can do for you. Each guide is plain-language, has a clear "done when" test, and ends with a way to report back.

> The directory name keeps the repo's existing spelling ("VISONARY"). Don't "fix" it without updating every link that uses it.

---

## What is in here

| File | What it is |
|------|------------|
| `ACCESS_BUILD_THIS_WEEK_Plan(1).md` | Founder guide for **Q-002, option B** (decided 2026-10-14): set up Cloudflare Access so you can log in to `/v11/founder/*` in a browser **without pasting `FOUNDER_KEY`**. `FOUNDER_KEY` stays for CI and as a fallback. |

That is the only plan so far. The `(1)` in the file name is part of its current name; if you rename it, update anything that links to it.

---

## How to use a plan

1. **Open the plan** and read "What you are building" first.
2. **Do Step 0** (what you need) before anything else. For the Access guide: a Cloudflare account that owns the Worker `thehive`, and the one email you will allow.
3. **Work the steps in order.** Don't skip the "Copy now" notes; later steps need those values.
4. **Run the test step**, then check the **Done when** line. For the Access guide that is:
   `GET https://thehive.sovereignhive.workers.dev/v11/debug/env` shows `"ACCESS_CONFIGURED": true`, and you can open a `/v11/founder/*` route after the Access login.
5. **Report back** with the phrase the guide gives you (Access guide: reply **"Access live"**).
6. **Close the loop in the queue:** open decisions live in `docs/FOUNDER_QUEUE`; once a decision is finished, move its entry to `docs/FOUNDER_ANSWERED` with the call and the date. Do not mark it complete before the "Done when" check passes.

If you get stuck, use the guide's own **If stuck** table first.

---

## How to add a new plan

Create one file per decision, using the same shape as the existing guide:

```
# <Title> — Build This Week (Founder Guide)
**Decision:** Q-NNN option <X> — <date>
**Goal:** <one sentence>
**Done when:** <a check you can run or see, not a feeling>

## What you are building (plain language)
## Step 0 — What you need
## Step 1 … Step N     (numbered, in order, each one doable on a phone if possible)
## Step N+1 — Test
## Step N+2 — Report back (the exact phrase)
## What not to do
## If stuck (symptom → likely cause table)
```

Conventions for every plan (drawn from the existing guide and the queue rules in `docs/FOUNDER_QUEUE`):

- It should trace to a question in `docs/FOUNDER_QUEUE`. Don't create a plan for a decision that isn't recorded there.
- **No secrets in the file.** Never write key values, tokens or passwords into a plan, and never paste `FOUNDER_KEY` into chat.
- A plan describes what *you* do. It must not turn on money, replication or Queen auto-approve switches; the Access guide lists these under "What not to do" and each of them is its own queue decision.
- Save it with a `.md` extension.
- Use real names and real checks (variable names, URLs, the probe that proves it worked). If you can't name the check, the plan isn't ready.

---

## Related

- `docs/FOUNDER_QUEUE`: open founder decisions (the single source of truth)
- `docs/FOUNDER_ANSWERED`: decided questions
- `Project_file/Founders Visonary Folder/`: the strategic inbox where directives and answers are logged
- `Project_file/README.md`: map of everything under `Project_file/`
