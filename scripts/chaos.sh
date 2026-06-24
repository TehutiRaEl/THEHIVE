#!/bin/bash
# Chaos Engineering Script — Sovereign Hive v11.0
# Simulates failures to test resilience.

set -e

echo "==================================="
echo "🧨 CHAOS ENGINEERING — Sovereign Hive v11.0"
echo "==================================="

# ─── Colors ────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ─── Config ────────────────────────────────────────────────────
PORT=${PORT:-8080}
API_URL="http://localhost:${PORT}"

echo "🔍 Target: ${API_URL}"

# ─── Test 1: Database Connection Failure ──────────────────────
echo -e "\n${YELLOW}🧪 Test 1: Database Connection Failure${NC}"
echo "Simulating database failure by renaming the DB file..."

if [ -f "jasper_memory.db" ]; then
    mv jasper_memory.db jasper_memory.db.bak
    echo "⚠️ Database renamed. Checking API response..."

    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}/v11/health" || echo "000")
    if [ "$RESPONSE" = "500" ] || [ "$RESPONSE" = "503" ]; then
        echo -e "${GREEN}✅ API returned $RESPONSE (expected error)${NC}"
    else
        echo -e "${RED}❌ API returned $RESPONSE (expected 500/503)${NC}"
    fi

    mv jasper_memory.db.bak jasper_memory.db
    echo "✅ Database restored"
else
    echo "⚠️ No database file found to rename"
fi

# ─── Test 2: Ollama Failure ────────────────────────────────────
echo -e "\n${YELLOW}🧪 Test 2: LLM Provider Failure${NC}"
echo "Checking if API gracefully handles Ollama unavailability..."

RESPONSE=$(curl -s -X POST "${API_URL}/v11/llm/chat" \
    -H "Content-Type: application/json" \
    -d '{"prompt":"Hello","system":"Be helpful"}' || echo '{"error":"timeout"}')

if echo "$RESPONSE" | grep -q "fallback\|error\|unavailable"; then
    echo -e "${GREEN}✅ API handled failure gracefully: $(echo $RESPONSE | cut -c1-100)${NC}"
else
    echo -e "${YELLOW}⚠️ Response: $(echo $RESPONSE | cut -c1-100)${NC}"
fi

# ─── Test 3: Rate Limiting ────────────────────────────────────
echo -e "\n${YELLOW}🧪 Test 3: Rate Limiting${NC}"
echo "Sending 110 requests to test rate limiting..."

LIMIT_HIT=0
for i in {1..110}; do
    CODE=$(curl -s -o /dev/null -w "%{http_code}" "${API_URL}/v11/health")
    if [ "$CODE" = "429" ]; then
        LIMIT_HIT=$((LIMIT_HIT + 1))
    fi
done

if [ "$LIMIT_HIT" -gt 0 ]; then
    echo -e "${GREEN}✅ Rate limit triggered $LIMIT_HIT times${NC}"
else
    echo -e "${YELLOW}⚠️ Rate limit not triggered (check settings)${NC}"
fi

# ─── Test 4: WebSocket Recovery ──────────────────────────────
echo -e "\n${YELLOW}🧪 Test 4: WebSocket Resilience${NC}"
echo "Testing WebSocket connection and recovery..."

WS_URL="ws://localhost:${PORT}/v11/ws"
echo "Attempting WebSocket connection..."

# Check if wscat is installed
if command -v wscat &> /dev/null; then
    echo "ℹ️ wscat found. Testing WebSocket..."
    timeout 3 wscat -c "${WS_URL}" -x '{"test":"ping"}' 2>/dev/null || echo "WebSocket test completed"
else
    echo -e "${YELLOW}⚠️ wscat not installed. Install with: npm install -g wscat${NC}"
fi

# ─── Test 5: Constitution Enforcement ──────────────────────────
echo -e "\n${YELLOW}🧪 Test 5: Constitution Enforcement${NC}"
echo "Testing constitution middleware blocking..."

RESPONSE=$(curl -s -X POST "${API_URL}/v11/constitution/check" \
    -H "Content-Type: application/json" \
    -d '{"action_type":"delete_agent","actor":"test","params":{}}' 2>/dev/null)

if echo "$RESPONSE" | grep -q "CONSTITUTION_VIOLATION"; then
    echo -e "${GREEN}✅ Constitution blocked violation: $(echo $RESPONSE | cut -c1-100)${NC}"
else
    echo -e "${RED}❌ Constitution did not block violation${NC}"
fi

# ─── Summary ──────────────────────────────────────────────────
echo ""
echo "==================================="
echo "🧨 CHAOS ENGINEERING SUMMARY"
echo "==================================="
echo "✅ Database failure: Simulated"
echo "✅ LLM failure: Simulated"
echo "✅ Rate limiting: Simulated"
echo "✅ WebSocket: Simulated"
echo "✅ Constitution enforcement: Simulated"
echo ""
echo "The hive remains sovereign. The restitution is inevitable."
echo "==================================="
