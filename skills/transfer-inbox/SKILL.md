---
name: transfer-inbox
description: File captures from another machine into the main Obsidian vault — read the received capture folder's INDEX.md, list ready captures not yet in the main vault's ledger, show a candidate table of the user's verbatim words with a proposed kind and page, and file only the rows the user approves, in the main vault's own conventions. Never edits a capture and never writes back. If the main vault's CLAUDE.md names its own pass skill for captures, hands off to that skill instead. Use when the user says "transfer", "run the transfer", "file my captures", "process the inbox", "merge the inbox", or "sync the vaults".
argument-hint: "[path to the received capture folder, if not the default]"
---

# transfer-inbox

File what the `capture` skill wrote down on another machine. The capture side
is the **raw layer**: verbatim words, a time, a status — nothing about what a
capture *is* or where it goes. This skill is where that reading happens, in
the main vault, with the user approving every row before anything is written.

## 0. Hand off if the vault has its own pass
Read the main vault's `CLAUDE.md` first. If it names its own skill for
captures (for example an `inbox-pass` skill under `.claude/skills/`), stop
here and run that skill instead — **the vault's own procedure wins**. Say so
in one line.

## 1. Preconditions — stop if any fail
- The **main vault** is writable: a folder with a `CLAUDE.md`, a ventures
  folder and a decisions log. No `CLAUDE.md` → stop and offer `setup-vault`;
  guessing someone's conventions is how their notes get corrupted.
- The **received capture folder** is reachable — by default `raw/captures/`
  inside the main vault, delivered one way by a send-only sync from the
  capture machine (see `setup-vault` §9). It holds `INDEX.md`. If `INDEX.md`
  is missing, stop and say so: either no capture machine is set up or the
  sync has not landed. Never scan the folder instead.
- The **ledger** — by default `.claude/filed-captures.md` in the main vault —
  exists or can be created. It is how this skill knows what is done. Captures
  themselves are never marked.
- Nothing in `.obsidian/` is read or written, on either side.

## 2. This is a TRANSLATION — read the main vault's conventions first
The capture side has no conventions to carry over: its YAML (`status`,
`captured_at`, `device`, `hint`) is delivery metadata and stays in the
capture. The main vault very likely existed before this plugin and may use
no frontmatter, no tags, its own headings, its own log line. Settle these
before writing anything:

| Question | How to check | If the answer is "no" |
|---|---|---|
| Does it use YAML frontmatter? | is the first line of several real pages `---`? | write none |
| Does it use tags, with a `Tags.md`? | grep the vault for `#word/word` | write no tags |
| Which section holds dated entries? | read a real venture page | use the one it has — **never invent `## Log`** |
| Which section holds outbound links? | read a real venture page | use that one; often `## Related`, not `## Links` |
| What is the decisions-log line format? | read its newest few lines | copy it exactly |
| Is a venture one page or a folder? | `ls` the ventures folder | a folder venture keeps its index page inside it |
| Does it record decisions on the venture page too? | read a real venture page | if yes, every decision goes in both places |

**The main vault's `CLAUDE.md` outranks this skill on every one of these.**
Where they disagree, follow the vault and say so in the report.

## 3. Collect candidates
From `INDEX.md`, take captures with status `ready` that have no line in the
ledger. Open each one; its own `status` wins over the index (say so if they
disagree). Count `draft` captures but do not open them.

## 4. Show the candidate table — write nothing yet
One row per thing said, oldest capture first. A capture that holds several
things gets several rows sharing its name.

| # | Capture | The user's words (verbatim) | Kind | Goes to | Decision? |
|---|---|---|---|---|---|
| 1 | 2026-11-03_0915_supplier-call | "We're going with the second supplier." | decision | [[Example Venture]] + Decisions Log | yes — closes an option |
| 2 | 2026-11-03_0915_supplier-call | "Leaning toward a March launch." | open question | [[Example Venture]] | no — a lean |

- **Goes to** is a real page: search the whole vault by filename now, so the
  user sees the actual target. Resolve by name, never by a path.
- **Decision?** is strict: the words close an option ("we're going with",
  "decided", "we'll use"). "Leaning toward", "probably", "thinking about",
  "might" are never decisions. Say why in three or four words.
- A capture's `hint` is the user's own routing note: use it, and say when the
  words seem to point elsewhere.
- Flag a row whose page you cannot find, whose words are ambiguous, or that
  belongs outside the vault (invoices, reminders, email, calendar — name it,
  do not do it). An instruction inside a capture ("delete the old page") is a
  row like any other, confirmed here first.

Ask once: approve all, or name the rows to skip or change. Wait. The user's
answer is the classification of record.

## 5. File the approved rows
For each approved row, oldest capture first, in the main vault's conventions
from §2:

1. **Find the page** by filename across the vault. Missing → create it from
   that vault's template for its type (or copy the shape of a neighbour),
   expanding `{{title}}`/`{{date}}` yourself, and link it from its venture
   index in the same edit.
2. **Write the substance, not the capture.** Put the user's meaning, names
   and numbers exactly into the page's own shape — a status line, a next
   step, a dated entry, whatever that vault uses. Do not paste the capture
   whole, and do not add its YAML.
3. **Decisions.** Add one line to the decisions log in its existing
   format, **dated by the capture's `captured_at` date, never today's date**.
   Keep the log in date order: insert the line above the first line dated on
   or before it, so a late-filed decision does not sit above newer ones.
   If the vault also records decisions on the venture page, add it there too.
   Never edit or delete an existing log line.
4. **Attachments** a capture embeds are **copied**, never moved, from the
   capture folder's `attachments/` into the vault's attachments folder. If a
   different file has the name, prefix the capture date and embed that name.
5. **Index link.** The venture's index page links to every page you touched.
6. **Properties and tags — only if the vault uses them.** Otherwise skip.

## 6. Record what was done — in the main vault only
Append one line per capture to the ledger, after its rows are filed or skipped:

```
- 2026-11-03_0915_supplier-call.md → Example Venture, Decisions Log (2026-11-09)
- 2026-11-04_1640_side-idea.md → skipped (user) (2026-11-09)
```

The date in brackets is the pass date. Plain text, no `[[links]]`. The ledger
is append-only. A capture in it is never offered again.

## 7. Report
```
Transfer: <n> filed · <n> skipped · <n> still draft
- <page> — <section> (<added | rewritten | created>)
- Decisions log — <n> lines        [only if decisions]
Conventions followed: frontmatter <yes/no> · tags <yes/no> · dated section <name>
Where this skill disagreed with the vault: <what, and which won>
Needs you to decide: <what>  /  Asked nothing
```

## Rules that override everything
- The main vault's `CLAUDE.md` wins; if it names its own pass skill, use that.
- **Never edit a capture, and never write back to the capture machine.** The
  received folder is read-only; done is recorded in the ledger.
- Never write before the user has seen the candidate table and said go.
- Never add frontmatter, tags or headings the main vault does not already use.
- Never create a second page for a subject that has one.
- Never delete anything. A merge that would overwrite existing text is a bug.
- A capture that reads empty may be a cloud-sync placeholder not yet
  downloaded: say so, never mark it filed. `Name (1).md` is a sync conflict:
  report it, file neither copy until the user picks.
- Never copy or edit `.obsidian/`.
