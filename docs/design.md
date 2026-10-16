# Design notes

Why the system is shaped the way it is, what was rejected, and where the ideas came from.

## The problem

Work happens on more than one machine, but Obsidian Sync (or any file sync) across vaults that are organized differently is a mess, and a single synced vault means every machine carries every note. What's actually wanted: capture anywhere, file once, in one place, according to rules that don't drift.

## Decisions

| Decision | Alternative rejected | Why |
|---|---|---|
| Staging vault is **flat** (one `Inbox/`) | Mirror the main vault's folder tree on the laptop | Mirroring invites filing twice, and folder-path links break when a note moves between vaults. Forum consensus and the "FINVA" pattern (obsidian.rocks) both land on a flat inbox. |
| Routing lives in **note properties** (`target`, `status`) | Routing by folder | A file can only be in one folder; properties travel with the note and are queryable in Bases. |
| **Date-prefixed** filenames in staging | Topic-only names | Obsidian resolves `[[wikilinks]]` by note name from the vault root. A staging note named the same as a main-vault page would silently re-point links after merge. The date prefix makes collisions impossible. |
| **Shortest-path wikilinks**, no folder paths | Full-path links | They resolve by name in either vault, before and after transfer. |
| Same `Attachments/` folder name in both vaults | Per-vault attachment folders | `![[embeds]]` keep working after the file is moved. |
| `.obsidian/` **never copied** | Share settings between vaults | Workspace and plugin state are machine-specific; copying it corrupts layouts and enables plugins that aren't installed. |
| **Weekly batch** transfer | Nightly automated transfer | A scheduled agent run has no access to past chat context, so it can't know what was "meant"; it also matches how triage actually happens — in batches. |
| Main vault folders are **type/workflow only** | Topic folders | Topics overlap; folders don't. Links + properties + a closed tag vocabulary handle topics without forcing a single hierarchy (forum thread t/78548). |
| **Venture page is the index** | Separate MOC notes or a Dataview dashboard | One page per venture that must link to everything about it gives a crisp definition of "filed" and needs no plugin. |
| Closed **tag vocabulary** in `Tags.md` | Free tagging | Agents (and people) invent near-duplicate tags. Making the list a file the agent must edit first turns tag creation into a visible decision. |
| **Decisions Log** is append-only, newest first | Decisions scattered in notes | One place to answer "what did we decide and when"; reversals are new lines, so history survives. |
| **Archive, never delete** | Delete done pages | Links keep resolving; nothing is lost; `status: done` + `Archive/` is reversible. |
| **Agent is the transfer mechanism** | Sync service, or an Obsidian plugin with an LLM API key | AI inbox-organizer plugins exist (Inbox Curator, OpDoc, Note Companion) and show weak uptake and a bring-your-own-key culture. The interesting part isn't the pipe, it's the opinionated system plus agent-enforced rules — which only needs `CLAUDE.md` files. |
| Optional Obsidian plugin stays **thin** (view + status buttons) | Plugin does the merge | The merge needs judgment (where does this belong? is this a decision?). Keep that in the agent; keep the plugin to things that are deterministic. |
| **Free, MIT**, portfolio project | Product | Market check said no demand to charge for; the value is demonstrating the system. |

## Open questions

- **How staging notes reach the main-vault session.** Options: attach the `Inbox/` folder's files in the chat; connect both folders in one session; or sync only `Inbox/` through a cloud drive. Deferred — organization was the priority, not the pipe. The `transfer-inbox` skill handles both "folder connected" and "files attached".
- **Conflict on the same target page** when two staging machines both have `ready` notes for it. Current answer: transfers are serialized (one machine at a time) and only ever insert, never rewrite, so order doesn't matter.
- **When the main vault grows past ~50 pages in a folder.** The rule allows a sub-folder then; we'll see if that holds.

## Possible later direction

Generalize into a horizontal "ops notebook" for solo operators — the vault conventions are effectively the design doc for that. Not planned.

## Sources

- forum.obsidian.md — *An opinionated reflection on using folders, links, tags and properties* (t/78548)
- obsidian.rocks — *How I use Folders in Obsidian* (the FINVA pattern)
- forum.obsidian.md — *How can I process my inbox more efficiently?* (t/43045)
- ptkm.substack.com — *My multi-vault Obsidian workflow*
- forum.obsidian.md — *Merge vaults or move vaults between computers* (t/3145)
- help.obsidian.md — *Internal links*: link resolution and automatic link updating
- Obsidian community plugins surveyed: vault-transfer, kzyiym-inbox-curator, opdoc-ai-auto-organizer; Note Companion (sourcepulse.org)
