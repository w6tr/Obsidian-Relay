# obsidian-relay

**Two Obsidian vaults, one writer: Claude.** Capture notes on any machine into a flat staging vault; once a week, an agent merges the finished ones into your main vault *by rule* — right page, dated section, decision logged, attachments moved, index linked. The vaults are never synced. The rules live in a `CLAUDE.md` in each vault, and the agent enforces them.

This repo is a Claude Code plugin (skills + both vault templates) with an optional Obsidian sidebar plugin alongside it. Free, MIT.

```
 laptop (staging vault)                 desktop (main vault)
 ┌──────────────────────┐   weekly     ┌──────────────────────────────┐
 │ Inbox/               │  transfer    │ Ventures/   ← one page per   │
 │  2026-10-15 foo - …  │ ──────────▶  │               venture = index │
 │  2026-10-16 foo - …  │  (Claude,    │ Company/Decisions Log.md      │
 │ Attachments/         │   by rule)   │ Partners/  Pipeline/  Archive/│
 │ Transferred/         │              │ Attachments/                  │
 │ Home.md  CLAUDE.md   │              │ Home.md  Tags.md  CLAUDE.md   │
 └──────────────────────┘              └──────────────────────────────┘
```

## Why

- **Folders are for workflow, not topics.** The main vault has seven folders, all type/workflow (`Ventures/`, `Company/`, `Partners/`, `Pipeline/`, `Templates/`, `Archive/`, `Attachments/`). Topic organization is links, properties and a closed tag vocabulary. Obsidian **Bases** (core plugin) gives you the views; no Dataview.
- **Routing lives in the note, not the folder tree.** Every staging note carries `target: Ventures/Foo.md` and `status: draft | ready | transferred`. A file can only be in one folder; properties travel with the note.
- **A mirror vault invites filing twice.** The staging vault is deliberately flat — one `Inbox/`. Names are date-prefixed so they can never collide with main-vault names (Obsidian resolves `[[links]]` by name; a collision silently re-points links after a merge).
- **The venture page is the index.** Nothing about a venture exists unless its page links to it. That is the test for "filed".
- **The agent is the pipe.** No sync service, no plugin with an API key. Claude reads the rules in `CLAUDE.md`, writes the note, and later does the merge. The decisions behind all this, with sources, are in [docs/design.md](docs/design.md).

## Adopt it in 10 minutes

### 1. Install the Claude Code plugin
In a Claude Code session (desktop app or terminal):
```
/plugin marketplace add w6tr/Obsidian-Relay
/plugin install obsidian-relay@obsidian-relay
```
You get three skills: `/obsidian-relay:setup-vault`, `/obsidian-relay:capture`, `/obsidian-relay:transfer-inbox`.

### 2. Create the vaults
On the machine that holds your source of truth:
```
/obsidian-relay:setup-vault main ~/Documents/MyVault
```
On any other machine you work from:
```
/obsidian-relay:setup-vault staging ~/Documents/MyVault-staging
```
Each copies a template from [`templates/`](templates/) — `CLAUDE.md` rules, `Home.md`, note templates, and the Obsidian settings that make new notes land in the right folder — then walks you through *Open folder as vault* in Obsidian.

### 3. Capture
Open the staging vault folder in Claude and talk:

> "Log this: decided to price the starter plan at $29/mo after looking at three competitors."

Claude writes `Inbox/2026-10-15 my-venture - starter plan pricing.md` with the required properties, puts the decision under `## Decisions`, and adds a line to the "Waiting for transfer" list on `Home.md`. Say "that's done" and it flips `status: ready`.

### 4. Transfer (weekly)
Open the main vault in Claude with the staging notes reachable (folder connected, or Inbox files attached) and run `/obsidian-relay:transfer-inbox`. It shows you a table of what it will merge and where, waits for your go-ahead, then: dated section on the `target` page → Decisions Log line if it's a decision → attachments moved → venture page linked → staging note marked `transferred` and moved to `Transferred/`. Nothing is ever deleted.

## What's in the repo

| Path | What |
|---|---|
| `skills/capture/` | Write a correctly-routed note into the staging Inbox |
| `skills/transfer-inbox/` | Merge `ready` notes into the main vault by rule |
| `skills/setup-vault/` | Copy a vault template into a folder and open it in Obsidian |
| `templates/staging-vault/` | Drop-in staging vault: `CLAUDE.md`, `Home.md`, Capture Note template, `.obsidian/` settings |
| `templates/main-vault/` | Drop-in main vault: `CLAUDE.md`, `Home.md`, `Tags.md`, Venture/Partner page templates, Decisions Log, placeholder pages |
| `obsidian-plugin/` | Optional Obsidian sidebar: waiting list, property validation, one-click status. See its [README](obsidian-plugin/README.md) |
| `docs/design.md` | The decisions, the alternatives rejected, and the sources |

## The conventions in one screen

**Staging note** (`Inbox/YYYY-MM-DD <venture> - <topic>.md`):
```yaml
type: decision | research | meeting | idea | log
venture: my-venture            # lowercase slug
target: Ventures/My Venture.md # page in the main vault
status: draft | ready | transferred
created: 2026-10-15
device: laptop
```

**Main-vault page** (any folder):
```yaml
type: venture | company | partner | pipeline | reference
venture: my-venture
status: active | paused | done
updated: 2026-10-15
tags: [venture/my-venture]     # only values listed in Tags.md
```

Rules the agent never breaks: no topic folders · no invented tags or `type` values · update in place, never a second page for the same subject · archive, never delete · `.obsidian/` is never copied between vaults.

## Status

Early. The staging side has been in daily use on one machine; the transfer skill has run by hand. A retrospective of what broke and changed after a few months of use will land in `docs/` — that's the part worth reading.

## License

MIT — see [LICENSE](LICENSE).
