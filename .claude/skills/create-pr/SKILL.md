---
name: create-pr
description: >
  Create a GitHub pull request for the current branch. Reads git log vs main,
  finds related Linear issues (DP-XX pattern), drafts the PR body in the
  project's format, and posts it via the `gh` CLI. Triggers on: "create
  a PR", "open a pull request", "make a PR", "ship this", "submit a PR", or any
  request to create a GitHub pull request for current work.
allowed-tools:
  - Bash
  - mcp__8cb595ff-51bb-4683-b5f8-95c9749fb073__get_issue
---

# Creating a Pull Request

## Step 1 — Understand what's on the branch

```bash
# Commits since diverging from main
git log main..HEAD --oneline

# Full diff to understand scope
git diff main..HEAD --stat
```

## Step 2 — Find Linear issues

Scan commit messages and branch name for `DP-\d+` identifiers:

```bash
# Extract all DP-XX references from commits and branch name
git log main..HEAD --format="%s %b" | grep -oE 'DP-[0-9]+' | sort -u
git branch --show-current | grep -oE 'DP-[0-9]+'
```

For each unique issue found, call `get_issue` to fetch its title and status.
This lets you include accurate titles in the PR body.

## Step 3 — Draft the PR

### Title

`<concise imperative phrase> (DP-XX)` — keep it under 72 characters.

If multiple issues: list them all — `(DP-78, DP-79)`.

### Body format

```markdown
## Summary

<!-- 1–3 bullet points on what this PR does and why -->

## What's in this PR

<!-- Bulleted list of specific changes: files, packages, behaviour -->

## Test plan

- [ ] `pnpm -w check` passes
- [ ] `pnpm -w test` passes
- [ ] <any manual verification steps relevant to the change>

## Linear

Closes DP-XX

<!-- Repeat for each issue: "Closes DP-YY" -->
```

`Closes DP-XX` on its own line auto-links the PR in Linear and marks the issue
done when the PR merges.

## Step 4 — Create the PR with gh

```bash
gh pr create \
  --title "<title>" \
  --body "$(cat <<'EOF'
## Summary

- Bullet one
- Bullet two

## What's in this PR

- Changed `foo/bar.ts` to …
- Added `rootDir: "./src"` to …

## Test plan

- [ ] `pnpm -w check` passes
- [ ] `pnpm -w test` passes

## Linear

Closes DP-XX
EOF
)"
```

Default base branch is `main`. Add `--base <branch>` if targeting something else.

## Step 5 — Report back

Share the PR URL with the user. Offer to update the Linear issue status if
the PR closes it (use the `update-linear` skill).

## Instructions

$ARGUMENTS
