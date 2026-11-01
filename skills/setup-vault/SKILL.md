---
name: setup-vault
description: Turn an empty (or existing) folder into an obsidian-relay capture folder or main vault by copying the plugin's bundled template files, walk the user through opening it in Obsidian, and connect the two with a one-way sync. Use when the user says "set up a capture folder", "set up the main vault", "init the vault", "install the vault template", "connect the capture machine", or asks how to start using obsidian-relay.
argument-hint: "capture|main [target folder]"
---

# setup-vault

Copy one of the two bundled templates into a folder the user chooses, get it open in Obsidian, and connect the capture machine to the main vault. The templates live in this plugin at `${CLAUDE_PLUGIN_ROOT}/templates/capture-folder/` and `${CLAUDE_PLUGIN_ROOT}/templates/main-vault/`.

## 1. Ask two things (if not given)
1. **Which:** `capture` (a plain folder on a secondary machine where `capture` writes the user's words down verbatim) or `main` (the vault that is the source of truth). One machine normally has exactly one of them.
2. **Where:** the folder path. Suggest `~/Documents/<Name>` (Mac/Linux) or `%USERPROFILE%\Documents\<Name>` (Windows).

## 2. Decide which branch you are in — this matters
Look at the target folder before copying anything.

- **Empty or non-existent** → §3, the fresh install.
- **Already a vault** (it has `.obsidian/`, or any `.md` files) → §4, the graft. This is the common case for a main vault: people have been keeping notes before they find this plugin.

Never decide this from the user's description. `ls -A` the folder and look.

## 3. Fresh install (empty folder)
Copy the whole template directory **including** `.obsidian/` and the empty `.keep` files (they make Obsidian show the folders). Use a copy that preserves dotfiles, e.g. `cp -R "<template>/." "<target>/"` on Mac/Linux or `robocopy <template> <target> /E` on Windows. Then:
- Capture: replace `laptop` in its `CLAUDE.md` (the `device` line) and in `Templates/Capture.md` with a short name for this machine (ask; default to the hostname). Check that `.stignore` arrived with the copy (§9 needs it). Then §9.
- Main: nothing to personalise; the `Example Venture`, `Partner A` and `Prospects` pages are placeholders the user can rename or delete. If a capture machine will feed it, §9.

Show the resulting tree. Then §5.

## 4. Graft onto an existing vault
A mirroring copy here destroys work: `robocopy /E` and `cp -R` both overwrite `Home.md`, `Company/Decisions Log.md` and `.obsidian/*` with template stubs. Do not use them. Work additively instead.

**4a. Inventory, and report it before touching anything.** List the folders and every `.md` file. Then establish the two things that decide everything else:
- **Do existing pages use YAML frontmatter?** Check the first line of each page, not a sample.
- **Are any tags in use?** Grep for `#word/word`.

**4b. Reconcile conventions — the vault wins, not the template.** The template's `CLAUDE.md` states page status inline (`**Status:** Active — …`) and makes frontmatter and tags an opt-in. An existing vault may do either, or something else again.

If the existing pages do not match the template, **do not install the template `CLAUDE.md` verbatim.** It would hand Claude a rulebook the vault violates on every page, which is worse than no rulebook — it leads to either mass-rewriting the owner's notes or quietly ignoring the rules. Instead put the choice to the owner in plain terms:
- **Adapt the template to the vault** — write a `CLAUDE.md` that describes the conventions the vault actually uses. No page edits. Usually right: the vault is in daily use and its conventions are working.
- **Adopt the template** — reshape pages to the template's conventions. Only worth it if what they have is not working.
- **Forward-only** — template rules apply to new pages; existing ones get them when next edited. Leaves the vault mixed.

Whichever they pick, the resulting `CLAUDE.md` is the vault's own, and it outranks this template from then on.

**4c. Copy only what is missing.** Typically `CLAUDE.md` (per 4b), `Attachments/`, and whichever `Templates/` pages have no equivalent. Check each file for an existing counterpart under a different name before adding it — a vault with `Templates/Prospect.md` does not need `Pipeline/Prospects.md`'s stub.

**4d. Skip every placeholder.** Never add `Example Venture.md` or `Partner A.md` to a vault that already has real venture and partner pages.

**4e. Never copy `.obsidian/` into an existing vault**, not even a single file inside it. It holds the owner's appearance, graph, workspace and enabled-plugin state, and on a synced vault it reaches their other machines. If a core plugin genuinely needs enabling, tell them which toggle to click.

**4f. Report what you changed**, file by file, and what you deliberately left alone.

## 5. Open it in Obsidian
Plain steps, one at a time, no jargon:
1. Open Obsidian → bottom-left vault switcher → **Open folder as vault** → pick the folder.
2. If asked about trusting the author / plugins, say Yes; the templates enable only core plugins (Templates, Properties, Bases).
3. Verify: new notes should be created in the folder root, and attachments land in `attachments/` (capture) or `Attachments/` (main) — that is set in `.obsidian/app.json`. On a grafted vault this is the owner's existing setting; leave it.

A capture folder does not need to be opened in Obsidian at all — Claude writes it, and the sync carries it. Opening it is only for reading back or for the optional sidebar (§8).

## 6. Point Claude at it
Tell the user to open the vault folder as the working directory in their Claude session (or add it with `/add-dir`). From then on the vault's `CLAUDE.md` governs; `capture` does the work on the capture machine, `transfer-inbox` (or the vault's own pass skill) in the main vault.

## 7. If the vault is in a cloud-sync folder
OneDrive, iCloud Drive, Dropbox and Google Drive all work, with two things to say out loud:
- Set the folder to **always keep on this device**. On-demand placeholder files make a note read as empty, and the fix is to hydrate it, never to rewrite it.
- A file named `Something (1).md` is a sync conflict, not a note. Report it; never merge it silently.

## 8. Optional: Obsidian sidebar plugin
On the capture machine only: if the user wants a sidebar listing captures, one-click Mark ready / Back to draft, and a "Rebuild INDEX.md" command, point them at `obsidian-plugin/README.md` in this repo. It is optional — the workflow is complete without it. If their vault has a stated "no plugins until something hurts" rule, respect it and say the workflow does not need it.

## 9. Connect the capture machine — one way, by Syncthing
The capture folder reaches the main vault as a **read-only copy** under
`raw/captures/`. Nothing ever travels back: the main vault records what it has
filed in its own ledger. [Syncthing](https://syncthing.net) does this with a
folder that is *Send Only* on one side and *Receive Only* on the other.

Plain steps, one at a time:
1. **Both machines:** install Syncthing and add each machine as a device on
   the other (Actions → Show ID, then Add Remote Device). If they are not on
   the same network, put both on the same Tailscale (or similar) network first.
2. **Capture machine, before sharing:** make sure the capture folder's root
   holds `.stignore` with these lines (a fresh install copies it from the
   template; a grafted or older capture folder needs it written):
   ```
   /CLAUDE.md
   /.claude
   /Templates
   /.obsidian
   ```
   Without it the capture folder's own rulebook lands in the main vault at
   `raw/captures/CLAUDE.md`. There a Claude session reading the captures picks
   up the capture machine's rules, and the file shares the main vault's
   `CLAUDE` link name. Syncthing never sends ignored files, nor `.stignore`
   itself (docs.syncthing.net, *Ignoring Files*).
3. **Capture machine:** Add Folder → path = the capture folder, Folder ID
   `captures`. Under Advanced set **Folder Type: Send Only**. Under Sharing,
   tick the main-vault machine.
4. **Main-vault machine:** open http://127.0.0.1:8384. Accept the offered
   `captures` folder with the path `<main vault>/raw/captures`, and under
   Advanced set **Folder Type: Receive Only**.
5. **Cloud-synced main vault:** mark `raw/captures` "always keep on this
   device" (§7).
6. **Check:** `raw/captures/INDEX.md` appears in the main vault within a
   minute, and `raw/captures/CLAUDE.md` does not. Until INDEX.md arrives, the
   transfer has nothing to read.
7. **Main vault rules:** add one line to its `CLAUDE.md` saying `raw/` is
   written by machines only, read-only for Claude, and exempt from the
   unique-filename rule. On a fresh install the template already says so.

If the main vault keeps a "no new folders" rule, `raw/` is a new top-level
folder: ask the owner first.

## Don't
- Don't run a mirroring or recursive copy at a folder that already has notes. Additive only.
- Don't put the capture folder and main vault templates in the same folder, and don't make the capture folder live inside the main vault on the capture machine — the main vault receives a copy; it never shares the original.
- Don't copy `.obsidian/workspace.json` from anywhere — it is machine state.
- Don't edit the user's existing notes while setting up. Writing a new `CLAUDE.md` is setup; reshaping 16 pages to match a template is not, and needs an explicit decision.
