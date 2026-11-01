# HANDOFF — obsidian-relay

**Last updated:** 2026-11-01 · **Status:** v0.2.0 — capture-folder redesign written; not committed, plugin not built, full loop not yet run.
**Purpose:** anyone (or any Claude session, on any machine) can clone this repo and continue. Read this, then `README.md`, then whatever section you're working on. Keep this file current — it is the shared memory between sessions; chat history does not travel.

> This is the **public** handoff. It contains nothing personal: no real vault paths, venture names, partner names or people. Private operational notes (where the live vaults are, real slugs) stay in the owner's own vault, never here.

---

## 1. What this is

Capture-anywhere Obsidian workflow where Claude is the only writer. On a capture machine, the `capture` skill writes the user's words **verbatim** into a flat **capture folder** — `status`, `captured_at`, `device`, an optional `hint`, nothing classified. Syncthing carries that folder **one way** (Send Only → Receive Only) into the **main vault** at `raw/captures/`, a read-only layer. There, `transfer-inbox` lists ready captures not yet in the main vault's ledger, shows a candidate table, and files only the approved rows by the main vault's own rules. Nothing is ever written back. Full rationale and sources: `docs/design.md`.

Shipped as:
1. a **Claude Code plugin** (`.claude-plugin/`, `skills/`, `templates/`) — the real product;
2. an optional **Obsidian sidebar plugin** (`obsidian-plugin/`) for the capture folder — list, validation, status buttons, rebuild index; deliberately thin.

## 2. State of each part

| Part | Path | State |
|---|---|---|
| Plugin manifest + marketplace | `.claude-plugin/plugin.json`, `marketplace.json` | v0.2.0, descriptions rewritten. Install: `/plugin marketplace add w6tr/Obsidian-Relay` then `/plugin install obsidian-relay@obsidian-relay`. **Not yet tested from GitHub**; `claude plugin validate .` not re-run since v0.2. |
| `capture` skill | `skills/capture/SKILL.md` | **Rewritten for v0.2** (2026-11-01): verbatim `## Words`, 3+1 keys, `YYYY-MM-DD_HHMM_slug.md`, rebuilds `INDEX.md`. Never run. |
| `transfer-inbox` skill | `skills/transfer-inbox/SKILL.md` | **Rewritten for v0.2**: §0 hands off to a vault's own pass skill; reads `raw/captures/INDEX.md`; ledger `.claude/filed-captures.md`; decision dated by `captured_at`; a lean is not a decision; follows the main vault's `CLAUDE.md`. The same procedure, as a vault's own `inbox-pass` skill, passed a scratch-copy walk test against a real main vault; that test found the log line for an older capture landing above newer lines, so step 3 now inserts by date. The generic skill itself has never run. |
| `setup-vault` skill | `skills/setup-vault/SKILL.md` | **Rewritten for v0.2**: `main` / `capture` modes, fresh install or graft, §8 optional sidebar, §9 Syncthing one-way. Fresh-install branch untested; `${CLAUDE_PLUGIN_ROOT}` still unverified when installed. |
| Capture folder template | `templates/capture-folder/` | New in v0.2: `CLAUDE.md`, `INDEX.md`, `Templates/Capture.md`, `attachments/`. Replaces `templates/staging-vault/`. |
| Main vault template | `templates/main-vault/` | **Rewritten for v0.2**: no YAML, no `Tags.md`, inline `**Status:**`, a `raw/` folder row. Never applied by copy. |
| Obsidian plugin | `obsidian-plugin/` | **Source rewritten for v0.2**: flat list newest first, 3+1 key validation, Mark ready / Back to draft, Rebuild INDEX.md, Validate, `autoRebuildIndex` setting. **Not built and never loaded** — `node_modules` is absent on the machine that wrote it, so `npm run build` has not run against this source. `main.js` is git-ignored. |
| README | `README.md` | Rewritten for v0.2. Needs a screenshot once a capture folder exists. |
| Design doc | `docs/design.md` | Rewritten for v0.2. The pipe is answered: Syncthing, one way. |
| GitHub repo | https://github.com/w6tr/Obsidian-Relay | Holds v0.1. **v0.2 is in the working tree only — not committed.** |

## 3. Continuing on a new machine

1. Clone: `git clone https://github.com/w6tr/Obsidian-Relay.git` (GitHub Desktop: *File → Clone repository*).
2. Open the folder in Claude Code. Say "read handoff".
3. For the Obsidian plugin you need Node 18+ (nodejs.org LTS installer). Then:
   ```bash
   cd obsidian-plugin && npm install && npm run build
   ```
   Copy `main.js`, `manifest.json`, `styles.css` into `<capture folder>/.obsidian/plugins/obsidian-relay/` and enable it in *Settings → Community plugins*.
4. To test the Claude Code plugin locally without installing from GitHub: start Claude Code with `claude --plugin-dir /path/to/Obsidian-Relay`, then `/obsidian-relay:setup-vault`.
5. Keep this repo **outside** any other repo's working tree. Nested inside one, `git add -A` in the parent stages it as a gitlink with no `.gitmodules`, and `git clean -ffd` there deletes it outright.

## 4. Next actions, in order

1. [x] ~~Apply the main-vault template to the real main vault.~~ Done 2026-10-16, by graft, not copy.
2. [ ] **Build the plugin and commit v0.2.** `npm install && npm run build` in `obsidian-plugin/`; fix whatever tsc reports; run the scrub grep (§5); commit; `claude plugin validate .`.
3. [ ] **Choose the capture machine and connect it** (`setup-vault` §9). The pipe is decided — Syncthing, Send Only → Receive Only into `raw/captures/` — but **the capture machine is not yet chosen**.
4. [ ] **First real loop, by hand:** capture two notes (one decision, one "leaning toward"), mark both ready, let Syncthing land them, run the pass. Check: the lean is not logged as a decision, the decision is dated by its `captured_at`, the ledger gets a line, `raw/` is unchanged.
5. [ ] **Load the Obsidian plugin** in the capture folder; check: sidebar renders newest first, validation flags a bad key / status / date / filename, Mark ready and Back to draft flip `status` and rebuild `INDEX.md`, and *Rebuild INDEX.md* produces exactly the `capture` skill's line format (`- <file>.md · <status> · <captured_at>`).
6. [ ] **Test install from GitHub**: `/plugin marketplace add w6tr/Obsidian-Relay` on a machine that has never seen the repo. Confirm the three skills appear as `/obsidian-relay:<name>` and that `${CLAUDE_PLUGIN_ROOT}` resolves inside `setup-vault`.
7. [ ] README screenshot; decide the author/copyright name in `LICENSE`, `plugin.json`, `manifest.json` (currently "obsidian-relay contributors").
8. [ ] Tag `v0.2.0` and attach `main.js`/`manifest.json`/`styles.css` as a GitHub Release (Obsidian's BRAT plugin can then install it by repo URL).
9. [ ] After 2–3 months of use: write `docs/retrospective.md` — what broke, what changed. Most credible part of the repo.

## 5. Rules for working in this repo

- **Public repo. Nothing personal.** No real vault paths, machine names, venture/partner names, or people. Placeholders: `example-venture`, `Partner A`, `laptop`. Before every commit run:
  `grep -rniE '<your name>|<real slugs>|OneDrive|/Users/' --exclude-dir=.git --exclude-dir=node_modules .`
- The `CLAUDE.md` files in `templates/` are the **source of truth for conventions** *for vaults this plugin creates*. For a vault that existed first, that vault's own `CLAUDE.md` wins. Change a convention → update the template `CLAUDE.md`, every skill that touches it, and the README's "conventions in one screen" block, in the same commit.
- The Obsidian plugin must stay **deterministic and thin**. Anything that needs judgment (where a capture belongs, whether something is a decision) belongs in a skill, not in TypeScript.
- Keep `main.js` out of git (it's ignored); ship it via Releases. Line endings are LF.
- Commit messages: one line, what changed and why. Bump `version` in `.claude-plugin/plugin.json`, `obsidian-plugin/manifest.json`, `package.json` and `versions.json` together (`npm version x.y.z` in `obsidian-plugin/` does the last three).
- Update **this file** (§2 state, §4 next actions) at the end of every session that changes anything.

## 6. Known gaps / doubts

- **The plugin source has never compiled.** It was rewritten without `node_modules`; expect small type errors on the first build.
- **Syncthing on a cloud-synced main vault.** If the main vault sits in a cloud-sync folder, two sync tools then touch `raw/captures/`. Mark it "always keep on this device" (`setup-vault` §7). Untested.
- `capture` tells Claude to expand the template's date and title itself because Obsidian's Templates plugin only expands them on manual insert. Correct, but easy to forget — watch for literal `{{title}}` in captures.
- A main vault in a cloud-sync folder has two failure modes the skills mention but have never met: an un-hydrated note reads as empty (hydrate it, never rewrite it), and a sync conflict creates `Name (1).md` that Obsidian shows as a real note.
- The marketplace name and plugin name are both `obsidian-relay`; the install command is therefore `obsidian-relay@obsidian-relay`. Slightly odd-looking; rename the marketplace if it confuses people.
