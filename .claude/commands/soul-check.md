Check a proposed action or change against the Sovereign Hive constitution before implementing it.

Usage: /soul-check <description of proposed change>

This command runs the constitutional-validator agent on the proposal.

Steps:
1. Read the canonical constitution:
   ```bash
   cat .queen/soul.md
   ```

2. Check the proposed change (from $ARGUMENTS) against each Fixed Law:

   **F-001 (Data Sovereignty):** Does this send hive data outside our governance?
   **F-002 (EVW Wealth):** Does this alter the wealth formula or staking mechanics without governance vote?
   **F-003 (Autonomy):** Does this grant agents agency levels beyond their approved tier?
   **F-004 (Explainability):** Are all decisions created by this change logged with rationale?
   **F-005 (Conflict Priority):** Does this bypass constitution > law > colony > user hierarchy?
   **F-006 (Non-penalization):** Does this delete/punish agents instead of rehabilitating them?

3. Check against Cardinal Laws:
   - Childlike wonder: does this close off exploration?
   - Remedy: does this punish instead of heal?
   - HDC comms: does agent-to-agent traffic use hdc.py?
   - Arena: is conflict routed through the gladiator arena?

4. Return verdict:
   ```
   SOUL CHECK — <description>
   
   F-001: PASS
   F-002: PASS
   F-003: WARN — grants DEVIATE level without 30-day review
   F-004: PASS
   F-005: PASS
   F-006: PASS
   
   Cardinal Laws: PASS
   
   OVERALL: WARN
   Recommendation: add logging for the agency level grant, review in 30 days
   ```

Always run /soul-check before:
- Modifying any economy/wallet/staking code
- Changing agent agency levels
- Adding endpoints that send data to external services
- Modifying governance vote thresholds
