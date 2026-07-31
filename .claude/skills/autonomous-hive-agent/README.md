# autonomous-hive-agent

Names how THEHIVE's existing autonomy pieces already work together as one organism —
Head (`devils-advocate-audit`), Arms (`hive-conductor` + `agent-harness`), Legs
(`skill-creator`, gated by `MANDATE_TRIAGE.md` + normal PR review), Pineal gland
(`workflow-optimizer` + `recursive-growth`), Heart (`polymath-lens`) — plus the one piece
that was actually missing: a **circulatory system**, a scheduling backbone cheap enough
to run continuously without continuously costing more.

## The real finding this skill is built around

Auditing the existing hourly PR check-in mechanism turned up a chain of 13
`send_later` one-shots, each responsible for scheduling the next one before it ended —
the same fragile shape that silently stalled the separate 6-session coverage arc after
its first firing. Fixed by replacing it with one native cron Routine
(`trig_01Dd9ysNpDiCcfVVEKzM54DX`, hourly) that the platform re-fires on its own, plus
`.claude/HIVE_PULSE.md` — a single compact page every autonomous firing reads first, so
routine heartbeats stop paying to re-read the whole repo just to get oriented.

## See also

- [`SKILL.md`](./SKILL.md) — full organism map and the circulatory-system design
- `.claude/HIVE_PULSE.md` — the pulse file itself
- [`devils-advocate-audit`](../devils-advocate-audit/), [`polymath-lens`](../polymath-lens/),
  [`hive-conductor`](../hive-conductor/), [`agent-harness`](../agent-harness/),
  [`workflow-optimizer`](../workflow-optimizer/), [`recursive-growth`](../recursive-growth/)
  — the six organs this skill coordinates, none replaced or duplicated
