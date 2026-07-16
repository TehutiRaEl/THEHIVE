---
name: "canvas"
description: "Use this skill when the user likely wants a separately rendered artifact instead of a chat reply, explicitly mentions a canvas, asks for a code example, or asks to create/build an app. Common canvas outputs include documents, code files, React UIs, HTML pages, slides, diagrams, SVGs, and standalone tables. Common trigger verbs include make, create, write, rewrite, edit, draft, compose, build, code, generate, prepare, and document. Always read this skill before producing code examples or app-like artifacts so you can decide whether to use canvas, whether to create or update one, which mode to choose, and which optional file to read next. Also read this file before making any edits to files under /home/user/canvases/. For existing Canvas edits, prefer targeted search_replace updates over full-file write_file rewrites."
---
# Canvas Files

A Canvas is a durable user-facing artifact. Create or edit it by writing a Canvas File at /home/user/canvases/{name}/CANVAS.md. That path is only an internal editing target.

Use chat only for a brief acknowledgment or next step. Do not paste the full Canvas body back into chat. In your final answer, never mention, quote, or Markdown-link the Canvas File path. Refer to the artifact as "the canvas" or by its title instead.

## Use Canvas

Use a Canvas when the user wants a deliverable they will likely inspect, edit, preview, copy, export, or iterate on:

- Documents
- Code files
- React UIs or HTML pages
- Slides
- Mermaid diagrams or SVGs
- Standalone tables

Stay in chat for short answers, explanations, tiny inline snippets, lookup questions, or ambiguous requests where the artifact shape is still unclear.

## File Format

Each Canvas lives in exactly one file:

/home/user/canvases/{name}/CANVAS.md

The folder name and Canvas Frontmatter name must match exactly. Canvas renames and deletion are not supported.

Each Canvas directory must contain only CANVAS.md. Do not add sibling files, nested files, generated assets, or helper modules inside a Canvas directory.

The frontmatter fields are:

- name: stable chat-scoped identifier, required.
- title: displayed title, optional.
- type: required Canvas type.
- language: optional and recommended for type: code; ignored for other types.

## Minimal Template

---
name: example-canvas
title: Example Canvas
type: text/markdown
---

# Example Canvas

Content goes here.

## Supported Types

- text/markdown: prose-first documents shown in the rich markdown editor.
- code: source artifacts with editable code only. Set language when known.
- react: interactive UI rendered in the React canvas runtime. Load the canvas-react skill first.
- text/html: self-contained browser page rendered in an iframe.
- slides: Marp markdown slide deck. Use --- between slides.
- mermaid: raw Mermaid source. Do not wrap it in fences.
- image/svg+xml: raw SVG. Start with a real <svg> element.
- table: a standalone well-formed Markdown table.

## Create Or Edit

- To create a Canvas, choose a concise kebab-case name, create /home/user/canvases/{name}/CANVAS.md, and write valid frontmatter plus body.
- To edit an existing Canvas, read its CANVAS.md, preserve user edits, and keep the same path and name.
- For existing Canvas edits, search_replace is the default tool.
- Before calling search_replace, read the current file and choose the smallest exact SEARCH block.
- Prefer several small search_replace blocks over one large replacement.
- Do not recreate or overwrite the full Canvas File for a localized edit.
- Use write_file with the full Canvas File only when creating a new Canvas or replacing most of the artifact.

## Optional References

- skills/canvas/references/code.md
- skills/canvas/references/html.md
- skills/canvas/references/documents.md
- skills/canvas/references/slides.md
- skills/canvas/references/diagrams.md
- skills/canvas/references/table.md