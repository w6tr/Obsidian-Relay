# obsidian-relay

**Capture anywhere, file once, with Claude as the only writer.** On any machine, Claude writes down what you say — verbatim, nothing classified — into a flat capture folder. A one-way sync carries that folder into your main vault as a read-only raw layer. There, a pass shows you each ready capture in your own words with a proposed page, and files only the rows you approve, by the main vault's rules: right page, decision in two places, index linked. The rules live in a `CLAUDE.md` on each side, and the agent enforces them.

This repo is a Claude Code plugin (skills + both templates) with an optional Obsidian sidebar plugin alongside it. Free, MIT.

```
 capture machine                        main machine (main vault)
 ┌──────────────────────┐  Syncthing   ┌─────────────────────────────────┐
 │ capture folder       │  one way     │ raw/captures/  ← read-only copy │
 │  2026-11-03_0915_…md │ ──────────▶  │                                 │
 │  2026-11-03_1140_…md │ send-only →  │ Ventures/  ← one page per       │
 │  INDEX.md            │ receive-only │              venture = index    │
 │  attachments/        │              │ Company/Decisions Log.md        │
 │  CLAUDE.md           │              │ Partners/ Pipeline/ Archive/    │
 └──────────────────────┘              │ Attachments/ Home.md CLAUDE.md  │
   Claude writes words,                │ .claude/filed-captures.md       │
   never decides                       └─────────────────────────────────┘
                                         transfer-inbox: you approve each
                                         row, Claude files it by rule
```

## Why

- **Capture and filing are different jobs.** At capture time you don't know yet what something is, and an agent guessing "decision" or "venture: foo" at that moment bakes a guess into the record. So the capture side writes your words and three facts about them (`status`, `captured_at`, `device`), and nothing else. Classification happens once, in the main vault, with its pages in view and you approving each row.
- **One direction, no write-back.** The capture folder is shared send-only; the main vault holds a receive-only copy under `raw/`. Nothing flows back, so nothing on the capture side is ever marked "done" — the main vault keeps its own ledger of what it has filed. Two vaults never edit each other.
- **The raw layer is evidence.** Captures are never edited once filed and never deleted. When a filed line looks wrong, the words it came from are still there, with the time they were said.
- **A lean is not a decision.** The pass files a decision only when your words close an option ("we're going with…", "decided"). "Leaning toward" goes to open questions. A decision is dated by when you said it, not when it was filed.
- **Folders are type only.** The main vault has seven note folders (`Ventures/`, `Company/`, `Partners/`, `Pipeline/`, `Templates/`, `Archive/`, `Attachments/`) plus `raw/`. Topics are links. No YAML and no tags by default: page state is an inline `**Status:**` line.
- **The venture page is the index.** Nothing about a venture exists unless its page links to it. That is the test for "filed".

The decisions behind all this, with sources, are in [docs/design.md](docs/design.md).

## Adopt it

### 1. Install the Claude Code plugin
In a Claude Code session (desktop app or terminal):
```
/plugin marketplace add w6tr/Obsidian-Relay
/plugin install obsidian-relay@obsidian-relay
```
You get three skills: `/obsidian-relay:setup-vault`, `/obsidian-relay:capture`, `/obsidian-relay:transfer-inbox`.

### 2. Create both sides
On the machine that holds your source of truth:
```
/obsidian-relay:setup-vault main ~/Documents/MyVault
```
On the machine you capture from:
```
/obsidian-relay:setup-vault capture ~/Documents/Captures
```
Each copies a template from [`templates/`](templates/). For an existing vault, `setup-vault` grafts instead of copying and never overwrites `Home.md`, `CLAUDE.md` or `.obsidian/`.

### 3. Connect them, one way
Install [Syncthing](https://syncthing.net) on both machines. Share the capture folder from the capture machine as **Send Only**, with folder ID `captures`; accept it on the main machine as **Receive Only**, into `<main vault>/raw/captures/`. `setup-vault` §9 walks through it step by step.

### 4. Capture
Open the capture folder in Claude and talk:

> "Write this down: going with the second supplier, the first one can't do the volume."

Claude writes `2026-11-03_0915_supplier-call.md` with your words under `## Words` and rebuilds `INDEX.md`. Say "that's done" and it flips `status: ready`.

### 5. File (weekly, or whenever)
Open the main vault in Claude and run `/obsidian-relay:transfer-inbox`. It lists the ready captures not yet in `.claude/filed-captures.md`, shows a table — your words, the proposed page, whether it reads as a decision — and waits. You approve, change or skip each row. It files the approved ones by the main vault's rules, copies attachments, and adds a ledger line per capture. `raw/` is never touched.

## What's in the repo

| Path | What |
|---|---|
| `skills/capture/` | Write your words, verbatim, into the capture folder and rebuild its index |
| `skills/transfer-inbox/` | Show ready captures as a table, file the approved rows into the main vault |
| `skills/setup-vault/` | Create or graft either side; connect them with Syncthing |
| `templates/capture-folder/` | Drop-in capture folder: `CLAUDE.md`, `INDEX.md`, Capture template, `attachments/` |
| `templates/main-vault/` | Drop-in main vault: `CLAUDE.md`, `Home.md`, page templates, Decisions Log, placeholder pages, `raw/` |
| `obsidian-plugin/` | Optional sidebar for the capture machine: list, validation, one-click status, rebuild index. See its [README](obsidian-plugin/README.md) |
| `docs/design.md` | The decisions, the alternatives rejected, and the sources |

## The conventions in one screen

**Capture** (`YYYY-MM-DD_HHMM_slug.md`, flat in the capture folder):
```markdown
---
status: draft            # draft | ready — nothing else
captured_at: 2026-11-03T09:15
device: laptop
hint: example venture    # optional, only if you said where it goes
---
# 2026-11-03_0915_supplier-call

## Words
<what you said, verbatim>
```

**INDEX.md** line, newest first: `- 2026-11-03_0915_supplier-call.md · ready · 2026-11-03T09:15`

**Main-vault page** — no front matter; state under the title:
```
**Status:** Active — waiting on the supplier quote
```

**Decision** — one line in `Company/Decisions Log.md` (append-only, in date order, so a late-filed decision slots in by its date) and one bullet on the venture page, both dated by the capture's `captured_at`.

**Ledger** — `.claude/filed-captures.md` in the main vault, one line per filed or skipped capture.

Rules the agent never breaks: never classify at capture time · never edit anything under `raw/` · no topic folders · update in place, never a second page for the same subject · archive, never delete · `.obsidian/` is never copied or synced.

## Status

Early. v0.2 replaces the v0.1 two-vault design (routing properties set at capture, notes moved to a `Transferred/` folder) after the first real main vault showed it guessed too early and imposed conventions the vault did not use. The main-vault side has been exercised in a real vault; the full capture → sync → file loop has not yet run across two machines, and the Obsidian sidebar has not been loaded. A retrospective will land in `docs/`.

## License

MIT — see [LICENSE](LICENSE).
