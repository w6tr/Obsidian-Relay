# Main vault — rules for Claude

This vault is the **source of truth**. Claude is the only writer: the user says
what to record, Claude files it by these rules. Words captured on another
machine arrive as a read-only copy under `raw/captures/` and are filed by the
`transfer-inbox` skill, one approved row at a time.

## Start and end of every session
- **Start:** read `Home.md`. If `raw/captures/INDEX.md` lists `ready` captures
  that are not in `.claude/filed-captures.md`, say how many and offer to run
  `transfer-inbox`.
- **End:** every page you touched is linked from its venture page, every
  decision you recorded is in both places (below), and `Home.md` is current.

## Folders are type only — never topic
Topics are `[[links]]`, not folders.

| Folder | Holds |
|---|---|
| `Ventures/` | One page per venture. The page **is** the venture's index. |
| `Company/` | The legal entity and `Decisions Log.md`. |
| `Partners/` | One page per external partner or collaborator. |
| `Pipeline/` | Working lists: `Prospects.md`, deal flow, inventory lots. |
| `Templates/` | Page templates. A new page is a copy of one. |
| `Archive/` | Pages that are finished or no longer maintained. |
| `Attachments/` | All images and files, flat. |
| `raw/` | Written by machines only — see below. |

No sub-folders unless a folder passes ~50 pages; no new top-level folder unless
the user asks.

## Page state is inline
Under each page's title, state is a bold field:
```
**Status:** Active — waiting on the supplier quote
```
`Status` is `Active`, `Paused` or `Done`, then a dash and the reason. No YAML
frontmatter and no tags by default. To opt in to properties or a tag
vocabulary, the user says so and this section is rewritten first — never mix
the two styles.

## The venture page is the index
Nothing about a venture exists without a link from its page in `Ventures/`.
When creating any page, link it from its venture page in the same edit.

## A decision is recorded in two places or it is not recorded
1. One line in `Company/Decisions Log.md` — append-only, **in date order, newest on top** — a new line goes directly
   above the first line dated on or before it, so a decision filed late slots in by its date:
   ```
   - 2026-10-15 — [[Example Venture]]: chose the second supplier — see [[Example Venture]]
   ```
2. One bullet under `## Decisions` on the venture page, same date.

A decision closes an option ("we're going with", "decided", "we'll use").
"Leaning toward", "probably" and "thinking about" are not decisions — they go
under the page's open questions or next steps. Never edit or delete a log
line; reverse a decision with a new one.

## Update in place
Never a second page for a subject that has one, and never two notes with the
same filename — links resolve by name. Search by filename before creating.
New material goes into the existing page's own sections; a dated entry goes
under `## Log` as `### YYYY-MM-DD — <topic>`, newest first.

## Only what the user said
Never infer a fact into the record — no guessed dates, names, numbers or
intentions. An unknown is written as unknown.

## Archive, don't delete
Move the page to `Archive/` and set `**Status:** Done — <why it stopped>`.
Links keep working. Move pages inside Obsidian, never on the filesystem.

## Links and attachments
- `[[wikilinks]]` by note name, no folder paths.
- Attachments in `Attachments/`, embedded as `![[filename.png]]`.

## raw/ — the machine layer
- A machine that feeds this vault writes only to `raw/<source>/`, keeps an
  `INDEX.md` there, and has one pass skill here that files from it.
- `raw/` is **read-only** for Claude and exempt from the unique-filename rule.
- `raw/captures/` arrives one way, by a send-only sync from the capture
  machine (`setup-vault` §9). Nothing is ever written back.
- `transfer-inbox` files captures after the user approves its candidate
  table. What is done is recorded in `.claude/filed-captures.md`, append-only.
  A decision is dated by its capture's `captured_at`, not the day it is filed.

## Never
- Never create topic folders.
- Never delete a page, a log line or a ledger line.
- Never edit anything under `raw/`.
- Never touch `.obsidian/`.
