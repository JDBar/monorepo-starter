---
name: write-adr
description: >
  Write an Architecture Decision Record (ADR) in docs/adr/. Use when deferring
  or rejecting a non-trivial upgrade, documenting a significant technical choice,
  or capturing why the codebase is the way it is. Triggers on: "write an ADR",
  "document this decision", "defer this and write it up", or when concluding that
  an approach should not be retried without documented reasoning.
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Bash
---

# Writing an ADR

ADRs live in `docs/adr/` and explain _why_ the codebase is the way it is — context,
decision, and consequences. Future agents read these before re-investigating deferred work.

## Step 1 — Determine the next sequence number

```bash
ls docs/adr/*.md | sort
```

Use the next available 4-digit zero-padded number (e.g. if `0003-...` exists, use `0004`).

## Step 2 — Create the file

**Filename:** `docs/adr/NNNN-short-kebab-case-title.md`

**Template:**

```markdown
# ADR-NNNN: Title

**Status**: Accepted
**Date**: YYYY-MM-DD
**Affects**: `path/to/affected/package` (if applicable)

---

## Context

What situation or problem led to this decision?

## Decision

What did we decide?

## Consequences

What are the results of this decision? What becomes easier or harder?
```

**For deferrals**, use this extended template instead:

```markdown
# ADR-NNNN: Defer X

**Status**: Accepted
**Date**: YYYY-MM-DD
**Affects**: `path/to/affected/package`

---

## Context

Brief background on what was being attempted.

## What Was Attempted

Specific things tried and why they didn't work.

## Decision

Stay on current approach. The attempted change is deferred.

## Readiness Checklist

Revisit when **all** of the following are true:

- [ ] Condition one
- [ ] Condition two

## Consequences

- What stays the same and why that's acceptable.
- What future agents should NOT do without reading this ADR.
```

## Step 3 — Update the index

Open `docs/adr/README.md` and add a row to the index table:

```markdown
| [NNNN](NNNN-your-title.md) | Short human-readable title | Accepted |
```

## Step 4 — Link from the relevant plan (if applicable)

If there is a plan file in `.claude/plans/` for the work being deferred, add a note at the
top linking to the new ADR, and update `.claude/plans/README.md` to mark it as deferred.

## Instructions

$ARGUMENTS
