---
name: visual-debug
description: >
  Visual debugging with the Playwright MCP browser. Use for taking screenshots,
  inspecting UI, verifying layout, interacting with the running app, diagnosing
  visual bugs, checking console errors, or confirming a feature looks correct.
  Triggers on: "take a screenshot", "show me what it looks like", "check the UI",
  "visually debug", "click X and screenshot", "what does it look like when...",
  or any request involving seeing or interacting with the running application.
allowed-tools:
  - mcp__playwright__browser_navigate
  - mcp__playwright__browser_resize
  - mcp__playwright__browser_take_screenshot
  - mcp__playwright__browser_snapshot
  - mcp__playwright__browser_click
  - mcp__playwright__browser_hover
  - mcp__playwright__browser_type
  - mcp__playwright__browser_press_key
  - mcp__playwright__browser_fill_form
  - mcp__playwright__browser_select_option
  - mcp__playwright__browser_drag
  - mcp__playwright__browser_wait_for
  - mcp__playwright__browser_evaluate
  - mcp__playwright__browser_console_messages
  - mcp__playwright__browser_network_requests
  - mcp__playwright__browser_handle_dialog
  - mcp__playwright__browser_navigate_back
  - mcp__playwright__browser_tabs
  - mcp__playwright__browser_close
  - Bash
---

# Visual Debugging with Playwright MCP

## App URLs

| App      | Dev URL               |
| -------- | --------------------- |
| test-app | http://localhost:3000 |

If the user doesn't specify which app, use the one most relevant to the current task.
The dev server must already be running — start it with `pnpm --filter <app> dev` if not.

---

## Standard Setup (always do this first)

```
1. mcp__playwright__browser_navigate  →  url: "http://localhost:3001"
2. mcp__playwright__browser_resize    →  width: 1280, height: 720
```

Use a different size if the task involves responsive/mobile layout.

---

## Taking a Screenshot

```
mcp__playwright__browser_take_screenshot
  filename:  descriptive-kebab-case-name   (no extension)
  raw:       true                          (PNG, no compression)
```

**Save to the project:**

```bash
find /tmp/playwright-mcp-output -name "your-filename.png" \
  -exec cp {} /workspaces/monorepo-starter/.claude/screenshots/ \;
```

Screenshots always go in `.claude/screenshots/` — never in the repo root.

Take a **before** screenshot when investigating a bug, interact with the page to
reproduce it, then take an **after** screenshot to capture the broken state.

---

## Interacting With the Page

Use these to reach a specific state before screenshotting, or to reproduce a bug:

| Goal                              | Tool                                     |
| --------------------------------- | ---------------------------------------- |
| Click a button or link            | `mcp__playwright__browser_click`         |
| Hover to trigger hover styles     | `mcp__playwright__browser_hover`         |
| Type into a focused input         | `mcp__playwright__browser_type`          |
| Fill an entire form at once       | `mcp__playwright__browser_fill_form`     |
| Choose a `<select>` option        | `mcp__playwright__browser_select_option` |
| Press a key (Enter, Escape, Tab…) | `mcp__playwright__browser_press_key`     |
| Drag an element                   | `mcp__playwright__browser_drag`          |
| Dismiss an alert/confirm dialog   | `mcp__playwright__browser_handle_dialog` |
| Go back to the previous page      | `mcp__playwright__browser_navigate_back` |
| Wait for an element or condition  | `mcp__playwright__browser_wait_for`      |
| Run arbitrary JS in the page      | `mcp__playwright__browser_evaluate`      |

---

## Inspecting Without a Screenshot

When you need structure rather than pixels:

- **`mcp__playwright__browser_snapshot`** — Returns the accessibility tree (text
  labels, roles, states). Faster than a screenshot, useful for confirming an
  element exists or a component rendered correctly without burning tokens on image
  analysis.

- **`mcp__playwright__browser_evaluate`** — Run JS in the page context. Good for
  reading computed styles, MobX store state, DOM properties, or anything not
  visible in the accessibility tree.
  ```js
  // Examples
  getComputedStyle(document.querySelector(".panel")).height;
  window.__mobxStore?.someValue;
  document.querySelectorAll("[data-error]").length;
  ```

---

## Diagnosing a Visual Bug

Suggested workflow when something looks wrong:

1. **Screenshot** the broken state
2. **`mcp__playwright__browser_console_messages`** — Check for JS errors or warnings
3. **`mcp__playwright__browser_network_requests`** — Check for failed fetches (404s,
   500s, blocked resources)
4. **`mcp__playwright__browser_snapshot`** — Inspect the DOM structure; confirm
   elements are rendering and have expected attributes/states
5. **`mcp__playwright__browser_evaluate`** — Read computed styles or runtime values
   if the snapshot isn't enough

---

## Multi-Tab Workflows

- **`mcp__playwright__browser_tabs`** — List open tabs and switch between them
- **`mcp__playwright__browser_close`** — Close a tab

---

## Instructions

$ARGUMENTS
