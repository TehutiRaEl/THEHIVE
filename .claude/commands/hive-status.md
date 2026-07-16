Check the health of all 7 active Sovereign Hive colonies and report federation status.

Usage: /hive-status

This command runs the colony-health-monitor agent.

Steps:
1. Query the Queen's federation endpoint:
   ```bash
   curl -s http://localhost:8080/v11/hive/status | python3 -m json.tool
   ```

2. Check each colony directly:
   ```bash
   for entry in "THEHIVE:8080" "NAR2:8000" "4DBRAIN:8001" "aether:3000" "automatisch:3001" "Kimi-K2:8002" "LocalAGI:8081"; do
     colony="${entry%%:*}"
     port="${entry##*:}"
     result=$(curl -s -o /dev/null -w "%{http_code}/%{time_total}s" --max-time 3 http://localhost:$port/colony/health 2>/dev/null || echo "ERR/timeout")
     echo "$colony ($port): $result"
   done
   ```

3. Check circuit breakers — colonies with >0 trips need investigation:
   ```bash
   curl -s http://localhost:8080/v11/hive/status | python3 -c "
   import json, sys
   d = json.load(sys.stdin)
   for name, info in d.get('colonies', {}).items():
       cb = info.get('circuit_breaker_trips', 0)
       status = info.get('status', 'unknown')
       print(f'{name}: {status} (cb_trips={cb})')
   "
   ```

4. Output summary:
   ```
   Hive Status — 2026-07-13
   
   ✅ THEHIVE :8080  healthy  45ms
   ✅ NAR2    :8000  healthy  38ms
   ✅ 4DBRAIN :8001  healthy  41ms
   ...
   
   Federation: N/7 online
   ```

See `.queen/hive.yml` for the authoritative colony registry with all URLs and guild assignments.
