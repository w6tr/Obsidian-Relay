---
name: transfer-inbox
description: Merge staging-vault Inbox notes with status "ready" into the main Obsidian vault by rule — dated section on the target page, Decisions Log line for decisions, attachments moved, venture index linked, staging note marked transferred. Use when the user says "transfer", "run the transfer", "merge the inbox", "sync the vaults", or when both the main vault and staging notes are available in a session.
argument-hint: "[path to staging vault or Inbox folder, if not connected]"
---

# transfer-inbox

Move finished notes from the staging vault into the main vault. This is a **merge by rule**, not a file copy. Read both vaults' `CLAUDE.md` first — they are authoritative on conventions; this skill is the procedure.

## 0. Preconditions — stop if any fail
- The **main vault** is writable: a folder with `Ventures/`, `Company/Decisions Log.md`, `Templates/Venture Page.md` and a `CLAUDE.md`.
- **Staging notes** are reachable, in one of these forms:
  1. the staging vault folder is connected (preferred — lets you write back `status: transferred`), or
  2. the user attached the Inbox notes as files (then you can't write back; see step 6).
- Nothing in `.obsidian/` will be read from or written to either vault.

Say which form you have before starting.

## 1. Collect candidates
List staging `Inbox/*.md` whose frontmatter has `status: ready`. Ignore `draft` and `transferred`. For each, parse: `type`, `venture`, `target`, `created`, title (filename minus `.md`), body, and every `![[embed]]` it references.

Make a table and show it to the user **before writing anything**:

| Note | type | venture | target | attachments |
|---|---|---|---|---|

Flag rows with: empty `target`; a `target` whose folder isn't one of the main vault's folders; a `venture` slug that no `Ventures/` page uses yet; a `type` outside the allowed set. Ask the user to resolve flags (give your best guess for each). Proceed only on their go-ahead.

## 2. Merge each note into its target page
For each candidate, in `created` order (oldest first):

1. **Find or create the target page.**
   - Exists → open it.
   - Missing and under `Ventures/` → create from `Templates/Venture Page.md`, set `venture`, `tags: [venture/<slug>]`, `updated: today`. Expand `{{title}}`/`{{date}}` yourself.
   - Missing under `Partners/` → `Templates/Partner Page.md`. Missing elsewhere → minimal page with the standard properties.
2. **Append a dated section** at the top of the page's `## Log` section (newest first). If the page has no `## Log`, add one at the end.
   ```
   ### YYYY-MM-DD — <topic>
   <body of the staging note, minus its frontmatter and its H1>
   ```
   Use the staging note's `created` date and its topic (filename after the ` - `). Keep the body's headings one level deeper than the section heading. Drop empty template bullets.
3. **Decisions.** If `type: decision`, or the note has non-empty content under `## Decisions`, prepend one line to the list in `Company/Decisions Log.md` (newest first, directly under the intro paragraph):
   ```
   - YYYY-MM-DD — [[<Venture Page>]]: <decision in ≤ 15 words> — see [[<target page>]]
   ```
   Never edit existing lines.
4. **Attachments.** For every `![[file]]` referenced, move the file from staging `Attachments/` to main `Attachments/`. If a different file with the same name already exists in the main vault, rename the incoming one `YYYY-MM-DD <file>` and update the embed in the merged section.
5. **Index link.** Make sure the venture page (`Ventures/<Venture>.md`) links to the target page under `## Links`. If the target *is* the venture page, nothing to do. Nothing is "filed" until the venture page links to it.
6. **Properties.** Set `updated: today` on every main-vault page you touched. Add `#venture/<slug>` to `tags` if missing. Add any new slug to `Tags.md` under `## venture/` **before** using it.

## 3. Tag check
Every tag you wrote must appear in `Tags.md`. If you had to add one, say so in the report.

## 4. Mark the staging note done
- Staging folder connected: set `status: transferred`, move the note from `Inbox/` to `Transferred/`, and remove its line from staging `Home.md` (restore `- none yet` if the list is now empty).
- Notes were attached as files: you cannot write back. Give the user the exact list of filenames to move and tell them to set `status: transferred` (or to run this skill again from the staging machine, which will see nothing new to do and offer to do the bookkeeping).

## 5. Update the main vault's Home.md
Set `## Last transfer` to today's date and the number of notes merged. Add any newly created venture to the `## Ventures` list.

## 6. Report
```
Transferred N notes.
- <staging note> → <target page> (§ YYYY-MM-DD — topic) [+ Decisions Log] [+ 2 attachments]
Created: <new pages>
Tags added: <none | list>
Could not place: <notes with unresolved target> — left in Inbox as ready
```

## Rules that override everything
- Never delete anything in either vault. Staging notes move to `Transferred/`; main-vault pages are archived, never removed.
- Never copy or edit `.obsidian/`.
- Never create a second page for a subject that already has one — search by name and by `venture` property first.
- Never write into the main vault before the user has seen the candidate table and said go.
- A merge that would overwrite existing text on a page is a bug; you only ever insert.
