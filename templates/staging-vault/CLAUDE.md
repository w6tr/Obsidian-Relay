# Staging vault — rules for Claude

This vault is **temporary storage** for notes captured on a secondary machine. The main vault (on another computer) is the source of truth. Claude is the mediator: the user says what to log, Claude writes it here, and later merges it into the main vault with the `transfer-inbox` skill.

## Start and end of every session
- **Start:** read the "Waiting for transfer" list on `Home.md`. Sessions in different harnesses (terminal, desktop app, Code tab) don't share chat history — `Home.md` is the shared memory.
- **End:** update `Home.md`. Never leave work only in the conversation.
- Explain any terminal or git step plainly, one at a time.

## Layout (do not add folders)
- `Inbox/` — every new note goes here, flat. No sub-folders.
- `Attachments/` — all images/files. Same folder name as in the main vault so `![[embeds]]` survive transfer.
- `Transferred/` — notes already merged into the main vault. Purge monthly.
- `Templates/` — note templates.
- `Home.md` — index of what's waiting.

## Creating a note
- Copy `Templates/Capture Note.md`.
- Filename: `YYYY-MM-DD <venture> - <topic>.md` (date first — guarantees no name clash with the main vault; Obsidian resolves `[[wikilinks]]` by note name, so a duplicate name would silently re-point links after transfer).
- Fill every property:
  - `type`: `decision` | `research` | `meeting` | `idea` | `log`
  - `venture`: short slug, lowercase, hyphenated (e.g. `example-venture`). Reuse existing slugs; check `Home.md` first.
  - `target`: the page in the main vault this belongs in, e.g. `Ventures/Example Venture.md`, `Company/Decisions Log.md`, `Partners/Partner A.md`, `Pipeline/Prospects.md`
  - `status`: `draft` → `ready` → `transferred`
  - `created`: `YYYY-MM-DD`
  - `device`: a short name for this machine (e.g. `laptop`)
- Prefer appending to an existing Inbox note on the same venture/day over creating a new one.
- Use `[[wikilinks]]` by note name only (no folder paths). Link to main-vault pages by name even though they aren't in this vault — they resolve after transfer.
- Attachments go in `Attachments/` and are referenced as `![[filename.png]]`.

## Status rules
- `draft` while the note is still being added to.
- `ready` when it is complete enough to file. Flip it when the user says the work is done, or at the end of a session.
- `transferred` only after the content is in the main vault; then move the note to `Transferred/`.

## Keep Home.md current
Every time a note is created or its status changes, update the "Waiting for transfer" list on `Home.md`: one line per Inbox note, grouped by venture, newest first. Format:

```
### example-venture
- [[2026-10-15 example-venture - pricing research]] — research · ready
```

## Transfer procedure
Run the `transfer-inbox` skill when the main vault is connected. Summary (the skill is authoritative):
1. List Inbox notes with `status: ready`.
2. For each: merge into the `target` page as a dated section (`## YYYY-MM-DD — <topic>`), or create the page from the main vault's template if it doesn't exist.
3. If `type: decision`, add one line to `Company/Decisions Log.md` (newest first).
4. Move any referenced attachments to the main vault's `Attachments/`.
5. Set `status: transferred`, move the note to `Transferred/`, remove it from `Home.md`.
6. Never copy `.obsidian/` between vaults.

## Never
- Never write notes anywhere but `Inbox/`.
- Never invent a new `type` value.
- Never touch `.obsidian/`.
- Never delete a note — move it to `Transferred/` or leave it.
