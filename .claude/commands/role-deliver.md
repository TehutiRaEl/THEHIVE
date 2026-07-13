Deliver work with the correct role tag for the commit message, using the Sovereign Hive role taxonomy.

Usage: /role-deliver <role> <type(scope): description>

Formats the commit message and verifies the role exists in docs/ROLES.md before committing.

Steps:
1. Validate role exists in taxonomy — check `docs/ROLES.md` for the exact role title:
   ```bash
   grep -i "$ROLE" /home/user/THEHIVE/docs/ROLES.md | head -5
   ```

2. Format the commit message:
   ```
   [ROLE: <Role Title>] <type>(<scope>): <description>
   ```
   
   Examples:
   - `[ROLE: Backend Engineer] feat(api): add /v11/brain/query endpoint`
   - `[ROLE: Memory Architect] chore(memory): rebuild vault from AST scan`
   - `[ROLE: Constitutional Arbiter] fix(constitution): align history endpoint with soul.md`
   - `[ROLE: DevOps Engineer] feat(ci): add memory vault auto-update workflow`

3. Stage and commit:
   ```bash
   git add <files>
   git commit -m "[ROLE: $ROLE] $TYPE($SCOPE): $DESCRIPTION"
   ```

4. Verify the commit:
   ```bash
   git log --oneline -3
   ```

Common roles by domain:
- **Backend changes:** Backend Engineer, API Engineer, Protocol Architect, System Architect
- **Memory/docs:** Memory Architect, Documentation Lead, Knowledge Curator  
- **Constitution/governance:** Constitutional Arbiter, Governance Director, Ethics Judge
- **Infrastructure/CI:** DevOps Engineer, DevOps Architect, Release Manager
- **Economy:** Economy Engineer, Economy Architect, CFO (SOUL Economy)
- **Security:** Security Engineer, Security Architect, Trust Sentinel
- **Testing:** Test Engineer, Integration Validator, Colony Validator

Full taxonomy in `docs/ROLES.md` — 110 roles across 11 tiers.
