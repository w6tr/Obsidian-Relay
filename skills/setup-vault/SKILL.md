---
name: setup-vault
description: Turn an empty (or existing) folder into an obsidian-relay staging vault or main vault by copying the plugin's bundled template files, then walk the user through opening it in Obsidian. Use when the user says "set up a staging vault", "set up the main vault", "init the vault", "install the vault template", or asks how to start using obsidian-relay.
argument-hint: "staging|main [target folder]"
---

# setup-vault

Copy one of the two bundled vault templates into a folder the user chooses, then get it open in Obsidian. The templates live in this plugin at `${CLAUDE_PLUGIN_ROOT}/templates/staging-vault/` and `${CLAUDE_PLUGIN_ROOT}/templates/main-vault/`.

## 1. Ask two things (if not given)
1. **Which vault:** `staging` (the inbox on a secondary machine) or `main` (the source of truth). One machine normally has exactly one of them.
2. **Where:** the folder path. Suggest `~/Documents/<Name>` (Mac/Linux) or `%USERPROFILE%\Documents\<Name>` (Windows). If the folder exists and isn't empty, list what's in it and confirm before copying — never overwrite an existing `CLAUDE.md`, `Home.md` or `.obsidian/` without asking.

## 2. Copy the template
Copy the whole template directory **including** `.obsidian/` and the empty `.keep` files (they make Obsidian show the folders). Use a copy that preserves dotfiles, e.g. `cp -R "<template>/." "<target>/"` on Mac/Linux or `robocopy <template> <target> /E` on Windows. Then:
- Staging: replace `device: laptop` in `Templates/Capture Note.md` with a short name for this machine (ask; default to the hostname).
- Main: nothing to personalise; the `Example Venture`, `Partner A` and `Prospects` pages are placeholders the user can rename or delete.

Show the resulting tree.

## 3. Open it in Obsidian
Plain steps, one at a time, no jargon:
1. Open Obsidian → bottom-left vault switcher → **Open folder as vault** → pick the folder.
2. If asked about trusting the author / plugins, say Yes; the templates enable only core plugins (Templates, Properties, Bases).
3. Verify: new notes should be created in `Inbox/` (staging) or the vault root (main) — that is set in `.obsidian/app.json`.

## 4. Point Claude at it
Tell the user to open the vault folder as the working directory in their Claude session (or add it as a folder). From then on the vault's `CLAUDE.md` governs; the `capture` and `transfer-inbox` skills do the work.

## 5. Optional: Obsidian sidebar plugin
If the user wants the "Waiting for transfer" sidebar and one-click status buttons, point them at `obsidian-plugin/README.md` in this repo. It is optional — the workflow is complete without it.

## Don't
- Don't put the staging and main vault templates in the same folder.
- Don't copy `.obsidian/workspace.json` from anywhere — it is machine state.
- Don't edit the user's existing notes while setting up.
