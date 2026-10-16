---
name: capture
description: Write a note into the staging vault's Inbox with the required routing properties (type, venture, target, status, created, device), using the vault's Capture Note template, and update the "Waiting for transfer" list on Home.md. Use whenever the user says "log this", "note that", "capture", "add to the vault", "record a decision", or dictates anything that should end up in their Obsidian vault while a staging vault is the working directory.
argument-hint: "[what to log]"
---

# capture

Write the user's words into the staging vault as a correctly-routed Inbox note. The vault's own `CLAUDE.md` is authoritative on conventions; this skill is the procedure.

## 0. Confirm you are in a staging vault
The working directory (or a connected folder) must contain `Inbox/`, `Home.md` and a `CLAUDE.md` describing a staging vault. If not, stop and tell the user — don't write into an unknown folder. If the folder is a *main* vault (has `Ventures/`, `Company/`), use the main vault's "update in place" rules instead of this skill.

## 1. Decide: new note or append?
Read `Home.md` → "Waiting for transfer". If an Inbox note already exists for the **same venture and same day** with `status: draft`, append to it (new bullet under the right heading, or a new `## <topic>` section). Otherwise create a new note.

## 2. Determine the properties
Ask only for what you can't infer — usually nothing. Defaults:

| Property | How to fill |
|---|---|
| `type` | Pick from `decision`, `research`, `meeting`, `idea`, `log`. A choice the user made → `decision`. Findings/sources → `research`. A conversation → `meeting`. "What if…" → `idea`. Progress → `log`. |
| `venture` | Lowercase hyphenated slug. **Reuse** a slug already present in `Home.md` or `Inbox/`. Only create a new slug if the user names a genuinely new venture; confirm the spelling with them once. |
| `target` | The main-vault page this belongs in. Default `Ventures/<Venture Name>.md`. Decisions about the company itself → `Company/Decisions Log.md`. Something about a partner → `Partners/<Name>.md`. Leads → `Pipeline/Prospects.md`. If unknowable, leave `target` empty and say so — the transfer step will ask. |
| `status` | `draft`, unless the user says it's done — then `ready`. |
| `created` | Today, `YYYY-MM-DD`. |
| `device` | The value already used by other notes in this vault (check one), else what the template says. |

## 3. Write the note
- Filename: `Inbox/YYYY-MM-DD <venture> - <topic>.md`. Topic: 2–5 words, lowercase, no punctuation other than spaces.
- Body: copy `Templates/Capture Note.md`. Replace `{{date:YYYY-MM-DD}}` and `{{title}}` yourself (Obsidian's Templates plugin only expands them when a human inserts the template). Title = filename without `.md`.
- Put the user's content under `## Notes`. Any decision also goes as one line under `## Decisions`. Any follow-up goes under `## Next steps`. Delete empty bullets, keep the headings.
- Rewrite for clarity but keep the user's meaning, names and numbers exactly. Don't pad.
- Links: `[[Name]]` only, never `[[Folder/Name]]`. Link main-vault pages by name even though they don't exist here.
- Attachments the user gives you go into `Attachments/` unchanged and are embedded as `![[filename.ext]]`.

## 4. Update Home.md
Under "Waiting for transfer", keep one line per Inbox note, grouped by venture (`### <venture>`), newest first within each group. Remove the `- none yet` line when adding the first note; restore it when the list becomes empty.

```
### example-venture
- [[2026-10-15 example-venture - pricing research]] — research · draft
```

## 5. Report
One or two lines: the file created or appended to, its `status`, and its `target`. If `target` is empty, say that it needs one before transfer.

## Don't
- Don't create folders inside `Inbox/`.
- Don't invent `type` values or tags.
- Don't write into `Transferred/` or `.obsidian/`.
- Don't flip a note to `ready` unless the user said the work is done or asked you to.
