#!/usr/bin/env python3
"""Health check using httpx (no requests dependency)."""
import sys
import httpx

def main():
    try:
        r = httpx.get("http://localhost:8080/health", timeout=5.0)
        if r.status_code == 200:
            data = r.json()
            print(f"Health check passed: {data.get('status', 'ok')}")
            sys.exit(0)
        else:
            print(f"Health check failed: {r.status_code}")
            sys.exit(1)
    except Exception as e:
        print(f"Health check exception: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
