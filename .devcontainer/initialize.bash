#!/usr/bin/env bash
# Runs in WSL2 (the host machine) before the container starts.
# Collects all public keys from ~/.ssh/*.pub and stages them into the workspace
# so they are readable inside the container without relying on a file bind mount.
# File bind mounts of individual files from WSL2 home are unreliable with
# docker-in-docker (overlayfs shadows them), but the workspace directory is
# always mounted reliably.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# ── .env bootstrap ────────────────────────────────────────────────────────────
# The devcontainer uses --env-file .env, so Docker will fail to start if the
# file is missing. Copy .env.example on first use so the container always starts.

ENV_FILE="$REPO_ROOT/.env"
ENV_EXAMPLE="$REPO_ROOT/.env.example"

if [ ! -f "$ENV_FILE" ]; then
  if [ -f "$ENV_EXAMPLE" ]; then
    cp "$ENV_EXAMPLE" "$ENV_FILE"
    echo "Created .env from .env.example — fill in GH_TOKEN before using the gh CLI."
  else
    echo "WARNING: .env not found and no .env.example to copy from." >&2
  fi
fi
OUT="$SCRIPT_DIR/.host_authorized_key.pub"

> "$OUT"  # truncate / create

for KEY in "$HOME/.ssh/"*.pub; do
  [ -f "$KEY" ] || continue
  echo "Staging public key: $KEY"
  cat "$KEY" >> "$OUT"
done

if [ ! -s "$OUT" ]; then
  echo "WARNING: No SSH public keys found in ~/.ssh/*.pub" >&2
  echo "         SSH authorized_keys will not be populated." >&2
  exit 0
fi
