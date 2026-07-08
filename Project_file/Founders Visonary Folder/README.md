# Founders Visionary Folder

This folder is the **strategic inbox** for the Sovereign Hive project.

Use it to record questions that need team answers, proposed modifications, and visionary ideas before they become tickets. Nothing here is binding until moved to ACTIVE development.

---

## Folder Structure

```
Founders Visonary Folder/
├── README.md          ← this file
├── INDEX.md           ← quick navigation to all documents
├── ACTIVE/            ← questions/items actively being worked on
├── ANSWERED/          ← resolved questions (keep for history)
├── ARCHIVE/           ← old items no longer relevant
├── MODIFICATIONS/     ← proposed changes to existing systems
├── TEMPLATES/         ← document templates
└── VISION/            ← long-horizon ideas and strategic direction
```

---

## How to Use

### Adding a question
1. Copy `TEMPLATES/question-template.md`
2. Save it in `ACTIVE/` with naming: `YYYY-MM-DD-question-<topic>-NNN.md`
3. Fill in the template — be specific about who needs to answer and what's blocked
4. Add it to `INDEX.md`

### Resolving a question
1. Move the file from `ACTIVE/` to `ANSWERED/`
2. Add the answer at the bottom of the file
3. Update `INDEX.md`

### Adding a vision
1. Copy `TEMPLATES/vision-template.md`
2. Save it in `VISION/` with naming: `YYYY-MM-DD-vision-<topic>-NNN.md`
3. These are long-horizon ideas — no urgency, no blocking items required

---

## Rules

- Do NOT commit credentials, API keys, or secrets here
- Do NOT make architectural decisions in this folder — it's an inbox, not a decision log
- Claude reads this folder at session start to check for blocking questions
- All items here should eventually move to ANSWERED or ARCHIVE

---

*This folder was created 2026-07-08 by Mistral (Frontend/UI)*
