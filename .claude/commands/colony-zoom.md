Deep-dive into a named colony: check its endpoints, health, capabilities, and recent events.

Usage: /colony-zoom <colony_name>

Colony names: THEHIVE, NAR2, 4DBRAIN, aether, automatisch, Kimi-K2, LocalAGI

Steps:
1. Resolve the colony port from name:
   ```
   THEHIVE=8080, NAR2=8000, 4DBRAIN=8001, aether=3000, automatisch=3001, Kimi-K2=8002, LocalAGI=8081
   ```

2. Check all standard colony endpoints:
   ```bash
   BASE="http://localhost:$PORT"
   for endpoint in /colony/health /colony/info /colony/manifest /colony/agents /colony/capabilities; do
     status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 "$BASE$endpoint")
     echo "$endpoint: $status"
   done
   ```

3. Show colony identity:
   ```bash
   curl -s http://localhost:$PORT/colony/info | python3 -m json.tool
   ```

4. Show capabilities:
   ```bash
   curl -s http://localhost:$PORT/colony/capabilities | python3 -m json.tool
   ```

5. For THEHIVE, show the brain status:
   ```bash
   curl -s http://localhost:8080/v11/brain/map | python3 -c "
   import json, sys
   d = json.load(sys.stdin)
   print(f'HDC Neocortex: {d[\"total_concepts\"]} concepts, {len(d[\"edges\"])} associations')
   "
   ```

6. Report any offline or erroring endpoints, and cross-reference with `.queen/hive.yml` for
   the expected role and guild assignment of this colony.

Source files:
- Colony registration: `.queen/hive.yml`
- THEHIVE colony endpoints: `backend/api/colony.py`
- Other colonies: see their respective `/pkg/colony/` or `colony_sdk.py`
