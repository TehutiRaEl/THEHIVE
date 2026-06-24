#!/usr/bin/env python3
"""
Health Check Script — Sovereign Hive v11.0
Used by Docker healthcheck and monitoring.
"""

import sys
import requests
import json
import os

def check_health():
    """Check if the hive API is healthy."""
    port = os.environ.get("PORT", "8080")
    url = f"http://localhost:{port}/v11/health"

    try:
        response = requests.get(url, timeout=5)
        if response.status_code != 200:
            print(f"Health check failed: status {response.status_code}")
            return 1

        data = response.json()
        if data.get("status") != "healthy":
            print(f"Health check failed: unhealthy status")
            return 1

        print(f"Health check passed: version {data.get('version', 'unknown')}")
        return 0

    except requests.ConnectionError:
        print("Health check failed: connection error")
        return 1
    except requests.Timeout:
        print("Health check failed: timeout")
        return 1
    except Exception as e:
        print(f"Health check failed: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(check_health())
