---
name: "skill-creator"
description: "Load this skill before creating, updating, or deleting Skills, or whenever you plan to modify your own Skill files under skills/. It explains Skill frontmatter, editable files, and validation proposals."
---
# Skill Creator

Use this when the user asks you to create, update, delete, or otherwise modify a Skill.

## Before Editing

- Read the existing skills/<name>/SKILL.md and any support files you need.
- Keep Skills concise. Put durable instructions in SKILL.md; add Markdown, plain text, CSV, JSON, or YAML support files only when they help.
- First-party Skills may be read-only. Editable registry Skills and newly created Skill directories can be changed.

## SKILL.md Format

User-created registry Skills must have YAML frontmatter followed by Markdown instructions:

```markdown
---
name: my-skill
description: Load this skill when ...
---

# My Skill

Instructions go here.
```

The description is always visible for routing, so make it say when to load the Skill. Keep it non-empty and at most 500 characters. The body is loaded only after the Skill is selected.

First-party built-in Skills are defined in code and are read-only. Do not add visibility or defaultEnabled frontmatter to user-created registry Skills.

## Create, Update, Delete

- Create: add skills/<slug>/SKILL.md with valid frontmatter. Add support files under the same directory only when useful.
- Update: edit SKILL.md or editable support files in place. Preserve useful existing guidance.
- Delete: remove the whole Skill directory when the user asks to delete a Skill. Do not delete only SKILL.md.

## Final Answer

Skill changes are shown to the user as creation, update, or deletion proposals for validation before they become active. Keep the final answer brief; do not paste full diffs or exact file contents unless the user asks.