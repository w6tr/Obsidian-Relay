# Relay — Obsidian sidebar for the capture folder

Optional companion to the [obsidian-relay](../README.md) Claude Code plugin. Install it on the **capture machine** only, in the capture folder opened as a vault. It never writes note content — Claude stays the only writer — it gives you a view of your captures, one-click status changes, and a way to rebuild `INDEX.md`.

The workflow is complete without it. If a vault has a "no plugins until something hurts" rule, leave it out.

## What it does

- **Sidebar "Captures"** — every capture in the folder, flat, newest first by `captured_at` (the same order as `INDEX.md`). Shows `status`, `captured_at`, `device` and the `hint` if there is one. Click a title to open it.
- **Validation** — flags a capture missing any of the three required keys (`status`, `captured_at`, `device`), with any key besides those and `hint`, a `status` other than `draft`/`ready`, a `captured_at` not in `YYYY-MM-DDTHH:MM`, or a filename not in `YYYY-MM-DD_HHMM_slug`.
- **Buttons** — *Mark ready* / *Back to draft* flip `status`, then rebuild `INDEX.md`. Send a capture back to draft only if the main vault has not filed it yet; after that, a correction is a new capture.
- **Commands** — the same two actions for the current note, *Rebuild INDEX.md* (rewrites the list under the index's header in exactly the format the `capture` skill uses: `- <file>.md · <status> · <captured_at>`), and *Validate captures*.
- **Setting: rebuild index on every change** — off by default. When on, the index is rebuilt whenever any capture is created, renamed, removed or edited.

There is no "transferred" state and no move: captures stay where they are, and the main vault records what it has filed in its own ledger.

## Install (manual, until it's in the community list)

1. Build it (needs Node 18+):
   ```bash
   cd obsidian-plugin && npm install && npm run build
   ```
2. Copy `main.js`, `manifest.json` and `styles.css` into `<capture folder>/.obsidian/plugins/obsidian-relay/`.
3. In Obsidian: *Settings → Community plugins → turn off Restricted mode → enable "Relay"*.
4. Click the inbox ribbon icon, or run *Open captures sidebar*.

## Develop

```bash
npm run dev
```
Rebuilds `main.js` on every change. Point the plugin folder at your test vault with a symlink, and reload Obsidian (`Ctrl/Cmd+R`) to pick up changes.

## Settings

| Setting | Default | Meaning |
|---|---|---|
| Capture folder | *(vault root)* | Where captures live, flat |
| Index file | `INDEX.md` | The index inside the capture folder |
| Rebuild index on every change | off | Rebuild on any capture change, not only after the plugin's own |
