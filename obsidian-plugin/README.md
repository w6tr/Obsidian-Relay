# Relay — Obsidian sidebar for the staging vault

Optional companion to the [obsidian-relay](../README.md) Claude Code plugin. Install it in the **staging** vault only. It does not write note content — Claude stays the only writer — it just gives you a view of what's waiting and one-click status changes.

## What it does

- **Sidebar "Waiting for transfer"** — every note in `Inbox/`, grouped by `venture`, newest first. Shows `type`, `status`, `created` and the `target` page. Click a title to open it.
- **Validation** — flags notes missing any of the six required properties (`type`, `venture`, `target`, `status`, `created`, `device`), with an unknown `type`/`status`, a non-lowercase `venture`, a `target` that isn't a `.md` path, or a filename without the `YYYY-MM-DD` prefix.
- **Buttons** — *Mark ready* / *Back to draft* flip `status`; *Transferred* sets `status: transferred` and moves the note to `Transferred/` (Obsidian updates links).
- **Commands** — the same three actions for the current note, plus *Regenerate waiting list in home note* (rewrites the list under `## Waiting for transfer` in `Home.md` in exactly the format the `capture` skill uses) and *Validate Inbox note properties*.
- **Setting: keep home note in sync** — off by default. When on, the plugin rewrites `Home.md`'s list whenever the Inbox changes.

## Install (manual, until it's in the community list)

1. Build it (needs Node 18+):
   ```bash
   cd obsidian-plugin && npm install && npm run build
   ```
2. Copy `main.js`, `manifest.json` and `styles.css` into `<staging vault>/.obsidian/plugins/obsidian-relay/`.
3. In Obsidian: *Settings → Community plugins → turn off Restricted mode → enable "Relay"*.
4. Click the paper-plane ribbon icon, or run *Open waiting-for-transfer sidebar*.

## Develop

```bash
npm run dev
```
Rebuilds `main.js` on every change. Point the plugin folder at your test vault with a symlink, and reload Obsidian (`Ctrl/Cmd+R`) to pick up changes.

## Settings

| Setting | Default | Meaning |
|---|---|---|
| Inbox folder | `Inbox` | Where waiting notes live (flat) |
| Transferred folder | `Transferred` | Where *Transferred* moves notes |
| Home note | `Home.md` | Note that holds the waiting list |
| Home heading | `Waiting for transfer` | The `##` heading of that list |
| Allowed note types | `decision, research, meeting, idea, log` | Valid `type` values |
| Keep home note in sync automatically | off | Rewrite the list on every Inbox change |
