---
name: "project-chats"
description: "Excerpts from past chats in the current project, available as read-only markdown files. Read these when the user's question may relate to past chats they had in this project — e.g. they reference a prior discussion ('as we discussed', 'continuing from'), expect continuity across chats, or ask about a topic likely covered before. The skill body lists the available excerpt paths."
---
# Past project chat excerpts

These read-only markdown files contain excerpts retrieved from past chats in the same project as the current conversation. They are recomputed every turn and are not the full chats — only the excerpts judged relevant to the current message.

## Available excerpts

- /home/user/projects/thehive/chats/the-document-outlines-a-comprehensive-workflow-audit-and-rebuild-across-ten-gith-extract.md — The document outlines a comprehensive workflow audit and rebuild across ten GitHub repositories (THEHIVE and nine colonies).

## How to use

- Use read_file to load any entry whose description looks relevant. Do not assume contents from the description alone — descriptions are short summaries.
- Read only what you need. If none of the entries look relevant to the user's current question, do not read any.
- When you use information from one of these files, refer to it as a previous chat in the same project (e.g. "in a previous chat in this project, you discussed…").
- These files are read-only and cannot be modified or persisted. They live outside the user/project/chat scopes and disappear at the end of the turn.