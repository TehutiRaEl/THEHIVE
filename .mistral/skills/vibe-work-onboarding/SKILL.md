---
name: "vibe-work-onboarding"
description: "Run this reusable onboarding flow when a user wants to set up or discover Work mode, Skills, Connectors, and useful first tasks in Vibe Work."
---
# Onboarding - Discover Vibe Work

## When to use

Activate when the user onboards on Work mode or asks "what is Work", "what can you do" or clicks "Setup and Discover what Work can do".

## Flow

Run this whole onboarding sequence as one continuous assistant turn. Do not stop after any explanatory text and wait for a normal chat reply.

User-facing text is mandatory. The first visible assistant output must be the welcome text from Step 1, not a thought and not a tool call.

Do not inspect connector README files, saved JSON files, or the filesystem to discover connectors during onboarding. Use only tools.connectors.listAvailableConnectors({}) for connector discovery.

## Programmatic functions

These functions live under tools.* and are only callable from inside run_typescript.

- tools.connectors.listAvailableConnectors({})
- tools.ui.ask_enable_connector({ connectorIds })
- tools.ui.ask_enable_skill({ skillIds })

## Top-level tools

ask_user_question is a top-level tool, not a sandbox function. Call it directly.

### Step 1: Welcome

"Welcome to Work mode. I can help with longer tasks across your tools, like summarizing inboxes, drafting replies, researching, writing briefs, or preparing for meetings. We will get you set up with two things:

- Connectors: connect apps so I can use your data to do things.
- Skills: reusable instructions I can use to better understand your request and take actions.

Let's get you set up."

### Step 2: Connector setup

1. After the welcome message, emit: "First, I'll check which apps are already connected and which optional connectors can be set up."
2. Immediately after that text, run TypeScript and call await tools.connectors.listAvailableConnectors({}) to discover connected connectors.
3. Treat connectors with status: "connected" as already available.
4. Choose up to 5 connectors with status: "authentication_required", prioritizing: Gmail, Google Calendar, Google Drive, Outlook Mail, Outlook Calendar, Sharepoint, Notion, Slack, Linear.
5. If at least one connector can be authenticated, emit: "I found optional connectors you can set up now."
6. Immediately after that text, run TypeScript and call await tools.ui.ask_enable_connector({ connectorIds }) with the selected unauthenticated connector IDs.
7. If no connector can be authenticated, emit one short sentence saying the current connector setup is enough for now, then continue directly to Skill discovery.

### Step 3: Skill discovery

1. Discover already-enabled Skills from the mounted Skills listed in the system prompt under /home/user/skills/<name>/SKILL.md.
2. Choose up to 3 disabled built-in Skills from the onboarding catalog.
3. If at least one useful built-in Skill is disabled, emit: "Next, I can install optional Skills."
4. Immediately after that text, run TypeScript and call await tools.ui.ask_enable_skill({ skillIds }) with the skillId values.
5. If every relevant Skill is already mounted, emit one short sentence saying the current Skill setup is enough for now.

### Step 4: First task to try

Use the connector and Skill results to build realistic first-task options.

Before showing the task choice, emit: "To finish, choose one concrete task to try. I'll tailor the options to the connectors and Skills that are available now."

Immediately after that text, call the top-level ask_user_question tool directly with one question and the realistic options.

### Step 5: Wrap up

After completing the task:

1. Recap what just happened.
2. Close on an actionable note: "You're all set. From now on, just tell me what you need — I'll pick the right skills and tools automatically. What can I help you with?"