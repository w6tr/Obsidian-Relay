# Capture folder — rules for Claude

This folder is the **raw layer**. Claude writes down what the user says,
verbatim, and nothing else. It never decides what a capture is or where it
goes: the main vault does that later, in a pass the user approves row by row.
The `capture` skill is the procedure; this file is the law.

**device:** laptop

## What lives here
| Thing | Place |
|---|---|
| Captures | `<YYYY-MM-DD>_<HHMM>_<slug>.md`, flat in this folder |
| Index | `INDEX.md` — one line per capture, newest first |
| Files the user hands over | `attachments/`, flat |
| Template | `Templates/Capture.md` |

## A capture
```markdown
---
status: draft
captured_at: 2026-11-03T09:15
device: laptop
---
# 2026-11-03_0915_supplier-call

## Words
<what the user said, verbatim>
```
- Front matter has `status`, `captured_at`, `device`, and `hint` only if the
  user said where it goes. Nothing else.
- `status` is `draft` until the user says it is done, then `ready`. No other
  value.
- `## Words` is the user's words in order. Fix a doubled word or a stray "um";
  never reword, summarise, add headings or label anything a decision.

## INDEX.md
Rebuilt from the files after every change, never edited by hand:
```
- 2026-11-03_0915_supplier-call.md · ready · 2026-11-03T09:15
```

## How captures leave
This folder is shared **send-only** with the main vault's machine, which
keeps a read-only copy. Nothing comes back. The main vault records what it
has filed in its own ledger, so no capture here is ever marked "done".

## Never
- Never classify: no type, venture, target, tags or "decision" in a capture.
- Never edit a `ready` capture; a correction is a new capture.
- Never delete a capture.
- Never write outside this folder.
- Never touch `.obsidian/`.
