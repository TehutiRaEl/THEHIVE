#!/usr/bin/env python3
"""
Grok Bridge Push — send local files to THEHIVE via GitHub repository_dispatch.

Usage:
    GITHUB_TOKEN=<pat> python3 scripts/grok_push.py <file1> [<file2> ...] \\
        --message "Phase 1 gap analysis"

Requirements:
    - Python 3.6+ (stdlib only — no pip install needed)
    - GITHUB_TOKEN env var set to a GitHub classic PAT with 'repo' scope

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
        print(
            "Error: GITHUB_TOKEN env var is not set.\n"
            "Set it with: export GITHUB_TOKEN=ghp_<your-token>",
            file=sys.stderr,
        )
        sys.exit(1)

    print(f"Dispatching {len(args.files)} file(s) to {REPO}...")
    payload = build_payload(args.files, args.message)
    dispatch(payload, token)


if __name__ == "__main__":
    main()
