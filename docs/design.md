# Design notes

Why the system is shaped the way it is, what was rejected, and where the ideas came from.

## The problem

Work happens on more than one machine, but Obsidian Sync (or any file sync) across vaults that are organized differently is a mess, and a single synced vault means every machine carries every note. What's actually wanted: capture anywhere, file once, in one place, according to rules that don't drift.

## What changed in v0.2

v0.1 had a second Obsidian vault ("staging") where every note carried routing properties — `type`, `venture`, `target` — set at capture time, and the transfer moved finished notes to a `Transferred/` folder. Meeting a real main vault showed two faults. Routing was guessed at the moment the least was known, and the guess then looked like a fact. And the staging side's conventions (YAML, tags, a `## Log` heading) leaked into a vault that used none of them. v0.2 splits the jobs: the capture side records words, the main vault does all the reading.

## Decisions

| Decision | Alternative rejected | Why |
|---|---|---|
| Capture side writes **verbatim words** plus `status`, `captured_at`, `device` (and an optional `hint` only if the user said where it goes) | Classify at capture (`type`, `venture`, `target`) | At capture time the agent has neither the main vault's pages nor the user's attention. A guessed `venture:` or `type: decision` reads later like a fact. Classifying once, at filing, with the pages in view and the user approving, is the only place the guess can be checked. |
| The capture side is a **plain folder**, flat | A second full vault mirroring the main one | Mirroring invites filing twice, and folder-path links break when a note moves. Forum consensus and the "FINVA" pattern (obsidian.rocks) both land on a flat inbox. It can still be opened as a vault for the optional sidebar. |
| **Date-and-time-prefixed** filenames (`YYYY-MM-DD_HHMM_slug`) | Topic-only names | Obsidian resolves `[[wikilinks]]` by note name. A capture named like a main-vault page would silently re-point links. The prefix makes collisions effectively impossible and sorts the folder by time. |
| Pipe is **Syncthing, one way**: Send Only on the capture machine, Receive Only into `<main vault>/raw/captures/` | Two-way cloud sync of an inbox; attaching files in chat; an agent copying between vaults | One direction means the main vault can never corrupt captures and the capture side can never write into the record. A Receive Only folder never sends local edits back, and it shows a *Revert Local Changes* button if anything there was touched, so an accidental edit stays local and can be undone (docs.syncthing.net, *Folder Types*). |
| **Ledger in the main vault** (`.claude/filed-captures.md`) | Flip the capture's status to `transferred`, or move it | With a one-way pipe, nothing can be written back — and a capture that changes after filing stops being evidence. The receiving side records what it has done. |
| `raw/` is a **read-only layer**, exempt from the unique-filename rule | Copy captures into normal note folders | Keeps the user's words untouched as the source a filed line can be checked against. Captures are never linked by name from notes, so their names cannot collide with pages. |
| Decision **dated by `captured_at`** | Date it by the filing day | The Decisions Log answers "when did we decide"; filing can lag capture by a week. |
| **"Leaning toward" is not a decision** | File anything decision-shaped | A decision closes an option. "Leaning toward", "probably", "thinking about" go to open questions; logging them would make the log claim things nobody decided. |
| **User approves each row** before anything is written | Automated nightly filing | A scheduled run has no chat context, so it cannot know what was meant. A table of the user's own words with a proposed page takes a minute to approve and catches the wrong guesses. |
| Attachments **copied**, never moved, into the main vault's attachments folder | Same folder name in both vaults, files moved | Moving would edit the read-only layer. Copying keeps the capture complete. |
| **Shortest-path wikilinks**, no folder paths | Full-path links | They resolve by name and survive moves. |
| `.obsidian/` **never copied or synced** | Share settings between machines | Workspace and plugin state are machine-specific; copying it corrupts layouts and enables plugins that aren't installed. |
| Main vault folders are **type/workflow only** | Topic folders | Topics overlap; folders don't. Links handle topics without forcing a single hierarchy (forum thread t/78548). |
| **Inline state** (`**Status:** Active — reason`), no YAML, no tags by default | Frontmatter plus a closed tag vocabulary in `Tags.md` | The first real main vault had neither, and a "no plugins until something hurts" rule meant no query view would read them. Inline state is readable without any plugin. A vault that does use properties keeps them — `transfer-inbox` follows the vault's own `CLAUDE.md`. |
| **Venture page is the index** | Separate MOC notes or a Dataview dashboard | One page per venture that must link to everything about it gives a crisp definition of "filed" and needs no plugin. |
| **Decisions Log** is append-only, in date order newest on top (a new line goes above the first line dated on or before it), plus a bullet on the venture page | Decisions scattered in notes; always prepend at the top | One place to answer "what did we decide and when"; reversals are new lines, so history survives. Prepending at the top broke the order once filing lagged capture: a walk test put an older decision above newer ones. |
| **Archive, never delete** | Delete done pages | Links keep resolving; nothing is lost; it is reversible. |
| A vault's **own pass skill wins** (`transfer-inbox` §0 hands off) | One generic skill for every vault | A vault with its own conventions knows them better than a plugin can. The generic skill is for vaults that have none yet. |
| Optional Obsidian plugin stays **thin** (list, validation, status buttons, rebuild index) | Plugin does the filing | Filing needs judgment. Keep that in the agent; keep the plugin to things that are deterministic. |
| **Free, MIT**, portfolio project | Product | Market check said no demand to charge for; the value is demonstrating the system. |

## Open questions

- **Which machine captures.** The design does not care, but the first real setup has not chosen one yet; the full loop is untested until it does.
- **Two capture machines.** Each would be its own Send Only folder (`captures-<device>`) received into its own `raw/` sub-folder. The ledger is keyed by filename, and filenames carry the minute, so collisions are unlikely but not impossible — untested.
- **Same target page from several captures in one pass.** Current answer: the pass files rows in `captured_at` order and only ever inserts, so a later capture lands after an earlier one; a capture that reverses an earlier decision becomes a new log line, never an edit.
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
- docs.syncthing.net — *Folder Types* (Send Only, Receive Only)
- Obsidian community plugins surveyed: vault-transfer, kzyiym-inbox-curator, opdoc-ai-auto-organizer; Note Companion (sourcepulse.org)
