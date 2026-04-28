#!/usr/bin/env bash
# Sets up the OpenSSH server for Windows-host access.
# Called by postCreate.bash. Safe to run multiple times (idempotent).
set -euo pipefail

# ── Install ───────────────────────────────────────────────────────────────────

if ! command -v sshd &>/dev/null; then
  sudo apt-get update -qq
  sudo apt-get install -y --no-install-recommends openssh-server
fi

# ── Persistent host keys (stored in named Docker volume) ─────────────────────

for TYPE in ed25519 rsa; do
  KEY="/etc/ssh-host-keys/ssh_host_${TYPE}_key"
  if [ ! -f "$KEY" ]; then
    BITS_FLAG=""
    [ "$TYPE" = "rsa" ] && BITS_FLAG="-b 4096"
    # shellcheck disable=SC2086
    sudo ssh-keygen -t "$TYPE" $BITS_FLAG -f "$KEY" -N "" -q
  fi
done
sudo chmod 600 /etc/ssh-host-keys/ssh_host_*_key
sudo chmod 644 /etc/ssh-host-keys/ssh_host_*_key.pub

# ── sshd config ───────────────────────────────────────────────────────────────

sudo tee /etc/ssh/sshd_config.d/devcontainer.conf > /dev/null <<'SSHD_CONF'
Port 22
AddressFamily inet
ListenAddress 0.0.0.0

# Use keys from the persistent named volume (survives rebuilds)
HostKey /etc/ssh-host-keys/ssh_host_ed25519_key
HostKey /etc/ssh-host-keys/ssh_host_rsa_key

PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys

ChallengeResponseAuthentication no
UsePAM yes
PrintMotd no
AcceptEnv LANG LC_*
SSHD_CONF

# ── Authorized keys ───────────────────────────────────────────────────────────

mkdir -p /home/vscode/.ssh
chmod 700 /home/vscode/.ssh

# initialize.bash (runs in WSL2 before container start) collects all
# ~/.ssh/*.pub keys and stages them here. Copy the whole file directly —
# it is always regenerated fresh by initializeCommand, so a simple copy
# is both correct and idempotent.
PUB_KEY_FILE="$(dirname "$0")/.host_authorized_key.pub"
if [ -f "$PUB_KEY_FILE" ]; then
  cp "$PUB_KEY_FILE" /home/vscode/.ssh/authorized_keys
else
  echo "WARNING: $PUB_KEY_FILE not found — authorized_keys not populated." >&2
  echo "         Ensure initializeCommand ran and ~/.ssh/*.pub keys exist in WSL2." >&2
fi

chmod 600 /home/vscode/.ssh/authorized_keys
chown -R vscode:vscode /home/vscode/.ssh

# ── Runtime directory ─────────────────────────────────────────────────────────

sudo mkdir -p /run/sshd
sudo chmod 755 /run/sshd

echo "SSH server configured."
