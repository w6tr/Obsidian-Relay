---
name: capture
description: Write down what the user says, verbatim, as a capture note in a plain capture folder on the capture machine — status, time and device only, no type, no target, no rewording — and rebuild the folder's INDEX.md. The main vault decides what each capture is and where it goes, later, with the user watching. Use whenever the user says "log this", "note that", "capture", "jot this down", "remember this", or dictates anything meant for their Obsidian vault while a capture folder is the working directory.
argument-hint: "[what to capture]"
---

# capture

Write the user's words into the capture folder exactly as said. This machine is
the **raw layer**: it records, it never classifies. Deciding what a capture is
(a decision, a lean, a next step) and which page it belongs on happens in the
main vault, in a pass the user approves row by row. The folder's own
`CLAUDE.md` is authoritative on conventions; this skill is the procedure.

## 0. Confirm you are in a capture folder
The working directory (or a connected folder) must contain a `CLAUDE.md` that
describes a capture folder, and an `INDEX.md`. If not, stop and say so — never
write into an unknown folder. If the folder is a **main vault** (has
`Ventures/`, `Company/`), stop: captures are not written there; use that
vault's own filing skill.

## 1. New capture or append?
Read `INDEX.md`. If the newest capture is `draft` and the user is clearly
continuing the same thought ("also…", "and add…", "one more thing on that"),
append to it. Otherwise create a new capture. When unsure, create a new one —
two small captures are cheaper than one muddled one.

## 2. The file
- **Name:** `<YYYY-MM-DD>_<HHMM>_<slug>.md` — local date, 24-hour time the
  capture was started, then a 2–5 word lowercase hyphenated slug taken from
  the user's own words (`2026-11-03_0915_supplier-call.md`). Unique by
  construction. Flat in the folder; no sub-folders.
- **Front matter** — exactly these keys, nothing else:

```yaml
---
status: draft
captured_at: 2026-11-03T09:15
device: <short machine name from CLAUDE.md>
hint: <only if the user said where it goes>
---
```

| Key | Rule |
|---|---|
| `status` | `draft` on creation. `ready` only when the user says it is done ("that's it", "ready", "send it"). No other value, ever. |
| `captured_at` | Local time the capture was started, `YYYY-MM-DDTHH:MM`. Never changed by an append. |
| `device` | The short name in this folder's `CLAUDE.md`. |
| `hint` | The user's own words on where it goes ("the LLC", "Example Venture"). **Omit the key** unless the user said one. Never your guess. |

- **Body:**

```markdown
# <file name without .md>

## Words
<what the user said, verbatim>
```

  Verbatim means: the user's words, in order, with only obvious dictation
  slips fixed (a doubled word, a stray "um"). No rewording for clarity, no
  summary, no headings inside `## Words`, no bullets the user did not say, no
  "Decision:" or "Next step:" labels. An append adds a blank line and the new
  words at the end of `## Words`.

## 3. Attachments
A file the user hands over goes in `attachments/` (flat, its own name; if the
name is taken, prefix the capture's date and time). Embed it in `## Words` as
`![[name]]` where the user mentioned it.

## 4. Rebuild INDEX.md
After every create, append or status change, rewrite `INDEX.md` from the
folder: one line per capture, newest first by `captured_at`:

```
- 2026-11-03_0915_supplier-call.md · ready · 2026-11-03T09:15
```

The header paragraph above the list stays as it is. The index is rebuilt from
the files, never edited by hand — if the Relay sidebar plugin is installed,
its "Rebuild INDEX.md" command does the same thing deterministically.

## 5. Report
One or two lines: the file, its status, and (when it is `draft`) that it will
not be filed until it is marked `ready`.

## Don't
- Don't classify: no `type`, `venture`, `target`, `tags`, "decision" or
  "next step" anywhere in the capture.
- Don't reword, summarise or tidy the user's words.
- Don't edit a `ready` capture — the main vault may already have filed it.
  A change or correction is a new capture, in the user's words.
- Don't write anywhere outside this folder, and never into the main vault.
  Captures reach it one way (a send-only sync); nothing comes back.
- Don't delete a capture. If the user says one was a mistake, write that, in
  their words, as a new capture.
