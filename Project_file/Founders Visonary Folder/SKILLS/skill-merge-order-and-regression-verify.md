# SKILL: Merge-order and regression verify (survive parallel PRs)
Origin: Fable, 2026-07-10; evidence THEHIVE PRs #40/#42 clobber → repairs #43, #44
Use when: two or more open PRs touch the same repo, or any merge wave just landed.
Steps:
1. Before merging a wave: list files each PR touches (`git diff --name-only base...head`). Overlap = danger; GitHub merges take the LATER-merged PR's version of an overlapping file wholesale, silently rolling back the earlier PR's edits.
2. Merge in creation order (oldest first) OR rebase each later PR onto main after every merge so its diff is re-computed against the survivor.
3. AFTER every merge wave, run a deliverable sweep on origin/main: for each merged PR, spot-check its 3–5 headline files actually contain the change (grep the exact fixed line, not just the file's existence).
4. Anything rolled back: restore verbatim from the original commit — `git checkout <good-sha> -- <file>` — never re-type from memory; one fix PR for the whole sweep.
5. Re-run the gates the wave was supposed to satisfy (build/type-check/pytest) on merged main, not on the branch — the branch passing means nothing after a clobber.
Gotchas: the damage is invisible in the merged PR's own diff view — it looks green; check main. Hotfix PRs are the most likely victims (small, early, overlapping). We paid twice: frontend hotfixes reverted (fixed #43), then docs/index.html hostname + ACTIVE worksheet + plan sheet reverted (fixed #44).
