# Nanuet's staged-autonomy ladder — the founder's switch list

**Phase Q-A, 2026-08-19.** Companion to `worker/schema/nanuet-brain.sql`.

This is the Queen's version of what `FLIP_THE_SWITCHES.md` section 12 is for Kai El. It
lives here, next to her schema, rather than in the root switch file so this phase touches
only `worker/` and `wrangler.jsonc`; folding a pointer into `FLIP_THE_SWITCHES.md` is a
one-line follow-up for whoever integrates this branch.

**Every switch below is OFF right now, and stays off until the founder sets it.** That is
the same precedent as `AUTOMATON_FINANCIAL_AUTONOMY` / `AUTOMATON_REPLICATION_AUTONOMY` and
Kai El's own ladder: nothing on this page turns itself on, and nothing here is enabled by
merging the code.

---

## Before any switch matters: the database has to exist

Nanuet's brain is a Cloudflare D1 database called `nanuet-brain`. **It does not exist yet.**
Only the founder can create it, because it spends one of the account's ten D1 slots (2 of 10
were in use as of the founder's own dashboard reading on 2026-08-10).

Until it exists, every switch below does nothing at all — not "fails", not "errors": the
code checks for the database first and quietly behaves exactly as it does today.
`GET /v11/nanuet/brain` will say so plainly (`provisioned: false`) with these same steps.

**The four steps, in this order:**

```bash
# 1. create the database (this is the founder-only act)
npx wrangler d1 create nanuet-brain

# 2. apply the schema to it — copy the database_id that step 1 printed
npx wrangler d1 execute nanuet-brain --remote --file=worker/schema/nanuet-brain.sql
```

3. In `wrangler.jsonc`, find the commented `NANUET_BRAIN` block inside `d1_databases`. Add a
   `,` after the `}` that closes the `KAI_BRAIN` block above it, uncomment the
   `NANUET_BRAIN` block, and paste the real `database_id` from step 1 over the placeholder.
4. Deploy. Then check `GET /v11/nanuet/brain` — it should report `provisioned: true` with
   real (zeroed) counts.

**Do not do step 3 before step 1.** A D1 binding pointing at a database that does not exist
fails the deploy at build time, which would take the live Queen down. That is why the block
ships commented out — the same reason Vectorize, R2 and Queues each shipped commented first.

Creating the database grants Nanuet **no new behaviour**. Provisioning and enabling are two
separate decisions on purpose.

---

## The ladder

Stages 1 and 2 are **built** (this phase). Stages 3 through 6 are **not built** — they are
written down so the ladder's destination is explicit rather than invented later, exactly the
way Kai El's stage 7 documents a capability that does not exist yet.

### Stage 1 — `NANUET_BRAIN_WRITE` · BUILT

**What it does:** lets Nanuet write her own memories into her own database. Append-only, and
every row is visible to the founder.

**What it does NOT do:** it grants no power to act. It only lets her write down things that
already happened.

**Turn it on:** Cloudflare dashboard → Workers & Pages → `thehive` → Settings → Variables and
Secrets → add plain variable `NANUET_BRAIN_WRITE` = `on` → Deploy.

**Risk:** lowest on this ladder. Worst case is storage growth. It cannot cause an action.

**Requires:** the database to exist (steps above).

---

### Stage 2 — `NANUET_REVIEW_LOG` · BUILT

**What it does:** every time Nanuet scores a proposal against the founder's written vision —
something she already does today, through `queenReview()` — a row is written recording the
score, her one-line reason, and what the verdict actually was.

**What it does NOT do:** it does not change a single verdict. The code makes exactly the same
call, on exactly the same pre-existing switch, and reaches exactly the same answer whether
this logs or not. Delete the logging block and every outcome is identical.

**Turn it on:** same dashboard path → `NANUET_REVIEW_LOG` = `on` → Deploy.

**Risk:** low, with one thing worth knowing: a review only happens at all when the
**pre-existing** `QUEEN_AUTONOMOUS_APPROVAL` switch (`FLIP_THE_SWITCHES.md` switch 9) is on.
This switch does not turn that one on and cannot. With switch 9 off, this writes nothing —
because there is nothing to write.

**Requires:** stage 1.

---

### Stage 3 — `NANUET_DOMAIN_ROUTING` · NOT BUILT (Phase Q-B)

**What it would do:** run each proposal through `hive-conductor`'s `domain_router.py` so she
learns which real domain it touches (edge-backend / frontend / colonies / governance /
strategy) instead of scoring it domain-blind.

**Turn it on:** not a variable flip today — Phase Q-B has to be built first.

**Risk:** a second reasoning pass per proposal, so it costs tokens. Still produces only a
score and a label; no action.

---

### Stage 4 — `NANUET_CAMPAIGN_OBSERVE` · NOT BUILT (Phase Q-C tier 1)

**What it would do:** read the campaign task queue and write down which task she would pick
next and why. Visible to the founder; changes nothing about how the daily run actually works.

**Turn it on:** not a variable flip today — Phase Q-C is not authorised and not built.

**Risk:** observation only. The real risk is not the action, it is that a logged
recommendation starts getting treated as a decision by whoever reads it. Stage 5 is where
that becomes explicit and reviewable instead of informal.

---

### Stage 5 — `NANUET_CAMPAIGN_ADVISE` · NOT BUILT (Phase Q-C tier 2)

**What it would do:** the daily run reads her recommendation before choosing a task, the same
way it already reads `HIVE_PULSE.md` first. Still no autonomous execution — a human or a
session does the work.

**Turn it on:** not a variable flip today — needs Phase Q-C tier 2 plus a real change to the
daily-firing protocol, which lives outside the Worker.

**Risk:** the first rung where her output influences what actually gets done. The influence
is advisory and fully visible, but it is influence.

---

### Stage 6 — `NANUET_DELEGATE_AKOSHA` · NOT BUILT (Phase Q-C tier 3)

**What it would do:** let her hand a task to Akosha to coordinate. Every real action (a
commit, a PR) still passes the same founder-only gates every other agent has — a voice in the
loop, never a bypass of it.

**Turn it on: deliberately NOT reachable by a variable flip.** It requires all of:

1. Phase Q-C tiers 1 and 2 built, running, and reviewed;
2. an agreed risk classification for delegated task types (the same open question Kai El's
   Phase B still has);
3. the founder's own sign-off on this rung specifically.

**Risk:** highest on this ladder, and for a structural reason. Nanuet is the one agent in the
roster whose `reports_to` is `NULL` — there is nobody above her in the chain of command. A
delegation path starting from her is the one place the hierarchy has nothing above it to
catch a mistake. That is why this rung needs a human decision rather than a variable.

---

## What is deliberately absent

**There is no financial stage.** Kai El's ladder has one (stage 7,
`KAI_FINANCIAL_AUTONOMY` — documented, not wired) because the founder asked for "Kai El pays
for his own upgrades" in his own words. **No equivalent request exists for Nanuet**, so
inventing one here would be manufacturing scope the founder never asked for. If the founder
ever wants it, it is a decision on its own terms, with a code-enforced cap, a per-transaction
record, and the rule that she can never raise her own ceiling.

**There is no `enabled` column anywhere in `nanuet-brain`.** The autonomy_registry table
documents what each switch means; it never stores whether one is on. Real on/off state lives
only in deploy-time environment variables Nanuet cannot write. If enablement lived in the
database she writes to, she could grant herself autonomy by inserting a row — which is not
hypothetical: `automaton/ARCHITECTURE.md` records finding exactly that bug in the upstream
system it was reverse-engineered from, and closing it was one of the five gaps that rebuild
exists to fix.

---

## How to check the real state at any time

Both routes are read-only, unauthenticated, and never return a secret value:

- `GET /v11/nanuet/brain` — is the database provisioned, are the write switches on, and what
  is actually in each table.
- `GET /v11/nanuet/autonomy` — the whole ladder with live on/off state joined onto it, plus
  which stage is next and what blocks it.

Today, before provisioning, both answer honestly that nothing is on.
