# Main vault — rules for Claude

This vault is the **source of truth**. Notes captured on other machines arrive via a staging vault and the `transfer-inbox` skill. Claude is the only writer: the user says what to record, Claude files it according to these rules.

## Start and end of every session
- **Start:** read `Home.md`. Check whether staging notes are available to transfer (attached as files, or the staging folder is connected). If so, offer to run `transfer-inbox`.
- **End:** make sure every page you touched has an up-to-date `updated` property and is linked from its venture page. Update `Home.md` if anything changed.

## Folders are type/workflow only
Topic organization is done with links, properties and tags — never with folders.

| Folder | Holds |
|---|---|
| `Ventures/` | One page per venture. The page **is** the venture's index (MOC). |
| `Company/` | Legal entity, finances, `Decisions Log.md`. |
| `Partners/` | One page per external partner or collaborator. |
| `Pipeline/` | Working lists: `Prospects.md`, deal flow, inventory lots. |
| `Templates/` | Page templates. |
| `Archive/` | Anything with `status: done`. |
| `Attachments/` | All images/files, flat. Same folder name as in the staging vault. |

Rules: no topic folders; no sub-folders unless a folder exceeds ~50 pages; new top-level folders only when the user asks.

## Every page has properties
```yaml
type: venture | company | partner | pipeline | reference
venture: <slug>            # the venture this page belongs to, or `company`
status: active | paused | done
updated: YYYY-MM-DD
tags: []                   # only values listed in Tags.md
```
These feed Obsidian **Bases** views (core plugin) — no Dataview needed. Refresh `updated` on every edit.

## Tag vocabulary
`Tags.md` is the only source of valid tags. Tags are nested: `#venture/<slug>`, `#status/waiting`, `#kind/decision`, … Claude may not invent a tag. To add one: append it to `Tags.md` with a one-line meaning first, then use it.

## The venture page is the index
Nothing about a venture exists without a link from its page in `Ventures/`. That is the test for "filed": if the venture page doesn't link to it, it isn't filed yet. When creating any page, add a link to it from the relevant venture page in the same edit.

## Decisions Log
`Company/Decisions Log.md` is append-only, **newest first**, one line per decision:
```
- 2026-10-15 — [[Example Venture]]: chose weekly transfer over nightly — see [[2026-10-15 example-venture - transfer cadence]]
```
Never rewrite or delete an entry; add a new line to reverse a decision.

## Update in place
Never create a second page for the same subject. Search by name and by `venture` property before creating. New material about an existing subject goes into the existing page as a dated section:
```
## 2026-10-15 — <topic>
```

## Archive, don't delete
Set `status: done`, move the page to `Archive/`. Links keep working (Obsidian resolves by name). Never delete a page.

## Links and attachments
- `[[wikilinks]]` by note name, no folder paths.
- Attachments in `Attachments/`, referenced as `![[filename.png]]`.

## Receiving transfers
Follow the `transfer-inbox` skill exactly. In short: merge each `ready` staging note into its `target` page as a dated section; decisions also get a line in the Decisions Log; attachments move to `Attachments/`; the venture page gets a link; the staging note is marked `transferred`. Never copy `.obsidian/` from the staging vault.

## Never
- Never create topic folders.
- Never invent tags, `type` values or `status` values.
- Never delete a page or a Decisions Log line.
- Never touch `.obsidian/`.
