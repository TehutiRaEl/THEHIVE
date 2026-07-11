# SKILL: Verify UI changes by driving the real app (Playwright)
Origin: Fable 5, 2026-07-04–07 (voxel viewer, boot drills)
Use when: any frontend claim needs proof — 'it renders' is a screenshot, not a sentence.
Steps:
1. Serve the static UI locally; run backend if testing LIVE path; launch chromium (in Claude sandboxes: executable_path=/opt/pw-browsers/chromium).
2. Sandboxed networks often BLOCK CDNs: fetch the same libs as npm-registry tarballs and route-intercept CDN URLs → fulfill from disk.
3. Assert on OUTCOMES: element mounted, banner text, screenshot; capture console errors and whitelist only pre-existing ones (list them!).
4. Accept dialogs via page.on('dialog').
Gotchas: text locators match HIDDEN nodes (Cortana's speech bubble ate 'KAI EL') — anchor to unique visible elements like a tab label; `pkill` patterns can match your own command line and kill the test run; run twice when persistence is involved (fresh + dirty state).
