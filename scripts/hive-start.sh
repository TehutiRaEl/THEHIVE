#!/usr/bin/env bash
# hive-start.sh — Start the full Sovereign Hive federation
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="$ROOT/docker-compose.federation.yml"

log() { echo "[$(date '+%H:%M:%S')] $*"; }

check_deps() {
    for cmd in docker curl; do
        if ! command -v "$cmd" &>/dev/null; then
            echo "ERROR: '$cmd' not found. Install it first." >&2
            exit 1
        fi
    done
}

wait_healthy() {
    local name="$1" url="$2" timeout="${3:-60}"
    log "Waiting for $name at $url ..."
    local elapsed=0
    until curl -sf "$url" &>/dev/null; do
        sleep 2; elapsed=$((elapsed + 2))
        if [ "$elapsed" -ge "$timeout" ]; then
            log "WARNING: $name did not become healthy within ${timeout}s"
            return 1
        fi
    done
    log "$name is healthy."
}

start_federation() {
    log "Starting Sovereign Hive federation..."
    docker compose -f "$COMPOSE_FILE" up -d --build

    log "Waiting for services to come up..."
    wait_healthy "THEHIVE (Queen)"    "http://localhost:8080/health"
    wait_healthy "Kimi-K2 (Mind)"     "http://localhost:8002/colony/health" 60 || true
    wait_healthy "NAR2 (Security)"    "http://localhost:8001/colony/health" 60 || true
    wait_healthy "aether (Commerce)"  "http://localhost:3000/colony/health" 60 || true
    wait_healthy "automatisch"        "http://localhost:3001/colony/health" 90 || true

    log ""
    log "Sovereign Hive Federation is running:"
    log "  Queen (THEHIVE)    → http://localhost:8080"
    log "  Mind (Kimi-K2)     → http://localhost:8002"
    log "  Security (NAR2)    → http://localhost:8001"
    log "  Commerce (aether)  → http://localhost:3000"
    log "  Workflow (automat) → http://localhost:3001"
    log "  Prometheus         → http://localhost:9090"
    log "  Grafana            → http://localhost:3030"
    log ""
    log "Check hive status: curl http://localhost:8080/v11/hive/status"
}

stop_federation() {
    log "Stopping Sovereign Hive federation..."
    docker compose -f "$COMPOSE_FILE" down
}

status_federation() {
    docker compose -f "$COMPOSE_FILE" ps
}

case "${1:-start}" in
    start)   check_deps; start_federation ;;
    stop)    stop_federation ;;
    restart) stop_federation; start_federation ;;
    status)  status_federation ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac
