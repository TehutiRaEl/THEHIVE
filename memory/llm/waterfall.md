# OmniRoute LLM Waterfall

8-provider dynamic routing system in [[kimi-gateway]]. Scoring:

```
score = availability × (1 / avg_latency_ms) × (1 / priority)
```

Rolling 5-sample latency window per provider. Health TTL: 60 seconds (optimistic reset).

## Provider Priority

| Priority | Provider | Model | Key Env Var |
|----------|----------|-------|-------------|
| 1 | Ollama (local) | llama3:8b | OLLAMA_BASE_URL |
| 2 | Moonshot | moonshot-v1-128k | MOONSHOT_API_KEY |
| 3 | SiliconFlow | Qwen2.5-72B | SILICONFLOW_API_KEY |
| 4 | DeepSeek | deepseek-chat | DEEPSEEK_API_KEY |
| 5 | Zhipu | glm-4-flash | ZHIPU_API_KEY |
| 6 | Groq | llama-3.3-70b | GROQ_API_KEY |
| 7 | OpenRouter | llama-3.1-8b:free | OPENROUTER_API_KEY |
| 8 | Gemini | gemini-1.5-flash | GEMINI_API_KEY |

## Links

[[ollama]] · [[groq]] · [[moonshot]] · [[providers]] · [[kimi-gateway]]
