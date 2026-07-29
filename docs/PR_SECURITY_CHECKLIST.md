# PR Security Checklist (Grok lane — mandatory per D6)

Copy into each PR #132 commit message body or PR description update:

```
Security checklist:
- Secrets handling changed? (yes/no + note)
- New public write endpoint? (yes/no + gate used)
- Keys/secrets in committed files? (must be no)
- Can this cause irreversible harm without founder? (yes/no + mitigation)
```

**Policy (D5):** New state-changing endpoints default to **founder-key** (fail closed).
