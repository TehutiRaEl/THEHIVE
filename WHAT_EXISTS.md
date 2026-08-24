# What Exists — The Fragments

## Browser Extensions (Most Common Approach)

| Tool                    | What It Does                                                                 | Limitations                                      |
|-------------------------|------------------------------------------------------------------------------|--------------------------------------------------|
| ContextBridge           | Persistent memory layer across providers; switch ChatGPT / Claude / Gemini  | Cloud-based; subscription for Pro; not fully self-hostable beyond Docker |
| ContextBridge AI        | Firefox extension moves context between ChatGPT, Claude, Gemini, Grok, DeepSeek, Perplexity | Browser-only; relies on page structure; extension-dependent |
| Context Sync            | Chrome extension saves, copies, downloads, ports AI context                  | Chrome-only; manual export/import; no autonomy   |
| AI Chat Teleporter Pro  | One-click migration between ChatGPT, Claude, Gemini, DeepSeek, Grok          | Proprietary; static; no evolution                |
| AI Chat Sync            | Auto-saves and transfers full context between Claude, ChatGPT, Gemini, DeepSeek | Chrome-only; no cross-platform beyond browser; no autonomy |

## CLI Tools (For Developers)

| Tool            | What It Does                                                                 | Limitations                                      |
|-----------------|------------------------------------------------------------------------------|--------------------------------------------------|
| dsh-migrate     | Imports chat history from Claude Code, Codex, ChatGPT, Cursor, Gemini into DeepSeek Harness | DeepSeek-specific; CLI-only; manual              |
| contextkeeper   | Universal session continuity protocol with structured state files synced to GitHub | Deprecated (renamed to vaultit); requires GitHub; CLI-only |
| AIST Protocol   | Compresses 40,000+ tokens into ~950 tokens (60x) so next session resumes     | Protocol only; no seamless handoff implementation; manual generation |

## What's Missing

| Gap                      | Why It Matters                                              |
|--------------------------|-------------------------------------------------------------|
| No autonomous operation  | All tools require manual action (click, copy, paste, command) |
| No self-evolution        | None learn from usage and improve themselves                |
| No sovereign deployment  | Most rely on cloud, browser stores, or third-party APIs     |
| No universal protocol    | Each tool has its own format; no single standard            |
| No built-in intelligence | None decide when / what / how to bridge or optimize         |

The Bridge is designed to close every gap listed above.
