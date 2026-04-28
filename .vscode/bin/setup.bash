#!/usr/bin/env bash
# Initial repository configuration script
# Run via VS Code Task: "Run Task" > "Repository Setup"

set -euo pipefail

# Colors and formatting
BOLD='\033[1m'
DIM='\033[2m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Icons
CHECK="✓"
WARN="⚠"
ARROW="→"
GEAR="⚙"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo ""
echo -e "${BOLD}${BLUE}${GEAR} Repository Setup - .vscode/bin/setup.bash${NC}"
echo -e "${DIM}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Symlink CLAUDE.md -> AGENTS.md (for Claude Code compatibility)
echo -e "${CYAN}Configuring CLAUDE.md symlink...${NC}"

if [[ -L "${REPO_ROOT}/CLAUDE.md" ]]; then
    echo -e "  ${DIM}${CHECK} CLAUDE.md symlink already exists${NC}"
elif [[ -f "${REPO_ROOT}/CLAUDE.md" ]]; then
    echo -e "  ${YELLOW}${WARN} CLAUDE.md exists as a regular file${NC}"
    echo -e "    ${DIM}Remove it manually to create the symlink${NC}"
else
    ln -s AGENTS.md "${REPO_ROOT}/CLAUDE.md"
    echo -e "  ${GREEN}${CHECK} Created symlink: CLAUDE.md ${ARROW} AGENTS.md${NC}"
fi

echo ""
echo -e "${DIM}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}${CHECK} Setup complete!${NC}"
echo ""
