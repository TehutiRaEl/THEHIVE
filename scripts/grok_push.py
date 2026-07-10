#!/usr/bin/env python3
"""
Grok Bridge Push — send local files to THEHIVE via GitHub repository_dispatch.

Usage:
    # Option A — auto-fetch token via Sovereign Hive bridge (recommended for Grok):
    export GROK_BRIDGE_KEY=<your-key>
    export WORKER_URL=https://thehive.<subdomain>.workers.dev   # get from Cloudflare Dashboard
    python3 scripts/grok_push.py <file1> [<file2> ...] --message "Phase 1 gap analysis"

    # Option B — direct PAT:
    GITHUB_TOKEN=<pat> python3 scripts/grok_push.py <file1> [<file2> ...] \\
        --message "Phase 1 gap analysis"

Requirements:
    - Python 3.6+ (stdlib only — no pip install needed)
    - Either GROK_BRIDGE_KEY + WORKER_URL, or GITHUB_TOKEN with 'repo' scope

What this does:
    1. Reads each specified file from disk
    2. Base64-encodes the content
    3. POSTs a repository_dispatch event to TehutiRaEl/THEHIVE with event_type=grok-push
    4. The grok-bridge.yml workflow receives the dispatch and commits files to grok-strategist-main

Security:
    - Your PAT is used only for the dispatch call; it never touches the repo directly
    - The workflow commits using GITHUB_TOKEN (server-side), so your PAT needs no push access
    - Never commit your PAT to any file — always pass it as an env var
"""

import argparse
import base64
import json
import os
import sys
import urllib.request
import urllib.error

REPO = "TehutiRaEl/THEHIVE"
DISPATCH_URL = f"https://api.github.com/repos/{REPO}/dispatches"
API_VERSION = "2022-11-28"
_WORKER_BASE_URL = os.environ.get("WORKER_URL", "https://thehive.workers.dev").rstrip("/")
WORKER_TOKEN_URL = f"{_WORKER_BASE_URL}/v11/bridge/grok-token"


def fetch_token_from_worker(grok_key: str) -> str:
    """Fetch GITHUB_TOKEN from Cloudflare Worker using GROK_BRIDGE_KEY."""
    req = urllib.request.Request(
        WORKER_TOKEN_URL,
        headers={"X-Grok-Key": grok_key},
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
            token = data.get("github_token", "")
            if token:
                print("Fetched GITHUB_TOKEN from Sovereign Hive bridge ✅")
            return token
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print(
                "Warning: GROK_BRIDGE_KEY not registered in Worker. "
                "Ask Claude to trigger grok-pat-distribute.yml.",
                file=sys.stderr,
            )
        elif e.code == 401:
            print("Warning: GROK_BRIDGE_KEY env var is set but was rejected by Worker.", file=sys.stderr)
        else:
            print(f"Warning: Worker returned HTTP {e.code}.", file=sys.stderr)
    except Exception as e:
        print(f"Warning: could not fetch token from Worker: {e}", file=sys.stderr)
    return ""


def build_payload(file_paths: list, message: str) -> dict:
    files = []
    for path in file_paths:
        if not os.path.isfile(path):
            print(f"Warning: skipping '{path}' — not a file", file=sys.stderr)
            continue
        with open(path, "rb") as f:
            content_b64 = base64.b64encode(f.read()).decode()
        files.append({"path": path, "content": content_b64})
        print(f"  Queued: {path} ({len(content_b64)} bytes base64)")
    if not files:
        sys.exit("No valid files to push. Check paths and try again.")
    return {
        "event_type": "grok-push",
        "client_payload": {
            "message": message,
            "files": files,
        },
    }


def dispatch(payload: dict, token: str) -> None:
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        DISPATCH_URL,
        data=body,
        method="POST",
        headers={
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "X-GitHub-Api-Version": API_VERSION,
        },
    )
    try:
        with urllib.request.urlopen(req) as resp:
            # GitHub returns 204 No Content on success
            print(f"\nDispatched successfully (HTTP {resp.status})")
            print("Check the Actions tab: https://github.com/TehutiRaEl/THEHIVE/actions")
            print("Target branch after workflow run: grok-strategist-main")
    except urllib.error.HTTPError as e:
        body_text = e.read().decode("utf-8", errors="replace")
        print(f"\nHTTP {e.code} error from GitHub API:", file=sys.stderr)
        print(body_text, file=sys.stderr)
        if e.code == 401:
            print("\nHint: Your GITHUB_TOKEN is invalid or expired.", file=sys.stderr)
        elif e.code == 403:
            print(
                "\nHint: Your PAT needs 'repo' scope. Check: GitHub → Settings → "
                "Developer settings → Personal access tokens.",
                file=sys.stderr,
            )
        elif e.code == 404:
            print(
                "\nHint: Repo not found or PAT has no access to TehutiRaEl/THEHIVE.",
                file=sys.stderr,
            )
        sys.exit(1)
    except urllib.error.URLError as e:
        print(f"\nNetwork error: {e.reason}", file=sys.stderr)
        print("Check your internet connection from the sandbox.", file=sys.stderr)
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="Push local files to THEHIVE via GitHub repository_dispatch.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "files",
        nargs="+",
        help="Paths to files to push (relative to repo root)",
    )
    parser.add_argument(
        "--message",
        default="grok-bridge sync",
        help='Commit message (default: "grok-bridge sync")',
    )
    args = parser.parse_args()

    token = os.environ.get("GITHUB_TOKEN", "").strip()
    if not token:
        grok_key = os.environ.get("GROK_BRIDGE_KEY", "").strip()
        if grok_key:
            print("GITHUB_TOKEN not set — attempting to fetch from Sovereign Hive bridge...")
            token = fetch_token_from_worker(grok_key)
    if not token:
        print(
            "Error: no GitHub token available.\n"
            "Option A: export GITHUB_TOKEN=ghp_<your-token>\n"
            "Option B: export GROK_BRIDGE_KEY=<your-bridge-key>  (auto-fetches token from Worker)",
            file=sys.stderr,
        )
        sys.exit(1)

    print(f"Dispatching {len(args.files)} file(s) to {REPO}...")
    payload = build_payload(args.files, args.message)
    dispatch(payload, token)


if __name__ == "__main__":
    main()
