# HANDOFF — obsidian-relay

**Last updated:** 2026-10-16 · **Status:** v0.1.0 scaffold complete; nothing tested end-to-end yet.
**Purpose:** anyone (or any Claude session, on any machine) can clone this repo and continue. Read this, then `README.md`, then whatever section you're working on. Keep this file current — it is the shared memory between sessions; chat history does not travel.

> This is the **public** handoff. It contains nothing personal: no real vault paths, venture names, partner names or people. Private operational notes (where the live vaults are, real slugs) stay in the owner's own vault, never here.

---

## 1. What this is

Two-vault Obsidian workflow where Claude is the only writer. A flat **staging vault** on a secondary machine collects notes with routing properties; a **main vault** on the primary machine is the source of truth; the `transfer-inbox` skill merges `ready` notes into the main vault by rule, weekly. Full rationale and sources: `docs/design.md`.

Shipped as:
1. a **Claude Code plugin** (`.claude-plugin/`, `skills/`, `templates/`) — the real product;
2. an optional **Obsidian sidebar plugin** (`obsidian-plugin/`) for the staging vault — view + status buttons, deliberately thin.

## 2. State of each part

| Part | Path | State |
|---|---|---|
| Plugin manifest + marketplace | `.claude-plugin/plugin.json`, `marketplace.json` | Done. `claude plugin validate .` passes. Install: `/plugin marketplace add w6tr/Obsidian-Relay` then `/plugin install obsidian-relay@obsidian-relay`. **Not yet tested from GitHub.** |
| `capture` skill | `skills/capture/SKILL.md` | Written. Used informally on the staging side; not yet exercised via the installed plugin. |
| `transfer-inbox` skill | `skills/transfer-inbox/SKILL.md` | Written. **Never run on a real transfer.** First real run should be done by hand following it, then the skill corrected to match what actually happened. |
| `setup-vault` skill | `skills/setup-vault/SKILL.md` | Written. Untested. Uses `${CLAUDE_PLUGIN_ROOT}/templates/…` — verify that variable resolves when installed. |
| Staging vault template | `templates/staging-vault/` | Done. Mirrors a vault in daily use (scrubbed). |
| Main vault template | `templates/main-vault/` | Done (rules, `Tags.md`, page templates, Decisions Log, placeholder pages). **Not yet applied to a real main vault.** |
| Obsidian plugin | `obsidian-plugin/` | Source complete; `npm run build` passes (tsc strict + esbuild). **Never loaded in Obsidian.** `main.js` is git-ignored — rebuild it locally. |
| README | `README.md` | Done. Needs a screenshot of the Obsidian file tree once a vault exists. |
| Design doc | `docs/design.md` | Done. |
| GitHub repo | https://github.com/w6tr/Obsidian-Relay | Created; this is the first push. |

## 3. Continuing on a new machine

1. Clone: `git clone https://github.com/w6tr/Obsidian-Relay.git` (GitHub Desktop: *File → Clone repository*).
2. Open the folder in Claude Code. Say "read handoff".
3. For the Obsidian plugin you need Node 18+ (nodejs.org LTS installer). Then:
   ```bash
   cd obsidian-plugin && npm install && npm run build
   ```
   Copy `main.js`, `manifest.json`, `styles.css` into `<staging vault>/.obsidian/plugins/obsidian-relay/` and enable it in *Settings → Community plugins*.
4. To test the Claude Code plugin locally without installing from GitHub: start Claude Code with `claude --plugin-dir /path/to/Obsidian-Relay`, then `/obsidian-relay:setup-vault`.

## 4. Next actions, in order

1. [ ] **Apply the main-vault template to the real main vault** (`/obsidian-relay:setup-vault main <folder>` into the existing vault — it must not overwrite existing pages; check the skill's "folder not empty" branch does the right thing).
2. [ ] **First real transfer, by hand**, following `skills/transfer-inbox/SKILL.md` step by step with the staging notes attached or the staging folder connected. Note every place the skill was wrong or vague; fix the skill. This is the most important open item.
3. [ ] **Load the Obsidian plugin** in the staging vault; check: sidebar renders, grouping, validation messages, Mark ready / Transferred buttons, *Regenerate waiting list* produces exactly the `capture` skill's format (`### venture` / `- [[note]] — type · status`).
4. [ ] **Test install from GitHub**: `/plugin marketplace add w6tr/Obsidian-Relay` on a machine that has never seen the repo. Confirm the three skills appear as `/obsidian-relay:<name>` and that `${CLAUDE_PLUGIN_ROOT}` resolves inside `setup-vault`.
5. [ ] README screenshot; decide the author/copyright name in `LICENSE`, `plugin.json`, `manifest.json` (currently "obsidian-relay contributors").
6. [ ] Tag `v0.1.0` and attach `main.js`/`manifest.json`/`styles.css` as a GitHub Release (Obsidian's BRAT plugin can then install it by repo URL).
7. [ ] Decide the staging → main **pipe** (attach files vs. connect both folders vs. cloud-sync `Inbox/` only). Open question in `docs/design.md`.
8. [ ] After 2–3 months of use: write `docs/retrospective.md` — what broke, what changed. Most credible part of the repo.

## 5. Rules for working in this repo

- **Public repo. Nothing personal.** No real vault paths, machine names, venture/partner names, or people. Placeholders: `example-venture`, `Partner A`, `laptop`. Before every commit run:
  `grep -rniE '<your name>|<real slugs>|OneDrive|/Users/' --exclude-dir=.git --exclude-dir=node_modules .`
- The vault `CLAUDE.md` files in `templates/` are the **source of truth for conventions**; skills are procedures that follow them. Change a convention → update the template `CLAUDE.md`, both skills that touch it, and the README's "conventions in one screen" block, in the same commit.
- The Obsidian plugin must stay **deterministic and thin**. Anything that needs judgment (where a note belongs, whether something is a decision) belongs in a skill, not in TypeScript.
- Keep `main.js` out of git (it's ignored); ship it via Releases.
- Commit messages: one line, what changed and why. Bump `version` in `.claude-plugin/plugin.json`, `obsidian-plugin/manifest.json`, `package.json` and `versions.json` together (`npm version x.y.z` in `obsidian-plugin/` does the last three).
- Update **this file** (§2 state, §4 next actions) at the end of every session that changes anything.

## 6. Known gaps / doubts

- `transfer-inbox` assumes the main vault has `## Log` sections on venture pages; older pages created before the template won't — the skill says "add one at the end", verify that reads well.
- `capture` tells Claude to expand `{{date}}`/`{{title}}` itself because Obsidian's Templates plugin only expands them on manual insert. Correct, but easy to forget — watch for literal `{{title}}` in notes.
- Obsidian plugin: `spliceWaitingList` keeps lines starting with `*(` under the heading as the instruction line; if someone edits `Home.md` by hand and removes it, the list still regenerates, just without the italic hint. Fine, but undocumented until now.
- The marketplace name and plugin name are both `obsidian-relay`; the install command is therefore `obsidian-relay@obsidian-relay`. Slightly odd-looking; rename the marketplace if it confuses people.
