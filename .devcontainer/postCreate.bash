#!/usr/bin/env bash

pnpm install

npm install -g @anthropic-ai/claude-code
npm install -g @go-task/cli

# Setup global pnpm home for pnpm link to work when linking packages.
# https://github.com/pnpm/pnpm/issues/4495#issuecomment-1174023168
SHELL=$SHELL pnpm setup

bash ./.devcontainer/postCreate.ssh.bash

# Named volumes are created by Docker as root — fix ownership so vscode can write to them.
sudo chown -R vscode:vscode /home/vscode/.config/gh
sudo chown -R vscode:vscode /home/vscode/.claude
