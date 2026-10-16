import { ItemView, Notice, WorkspaceLeaf } from "obsidian";
import type RelayPlugin from "./main";
import { groupByVenture, markTransferred, readInbox, setStatus, type InboxNote } from "./notes";

export const VIEW_TYPE = "obsidian-relay-view";

export class RelayView extends ItemView {
	constructor(leaf: WorkspaceLeaf, private plugin: RelayPlugin) {
		super(leaf);
	}

	getViewType(): string {
		return VIEW_TYPE;
	}

	getDisplayText(): string {
		return "Waiting for transfer";
	}

	getIcon(): string {
		return "send-horizontal";
	}

	async onOpen(): Promise<void> {
		this.render();
	}

	render(): void {
		const root = this.contentEl;
		root.empty();
		root.addClass("relay-view");

		const notes = readInbox(this.app, this.plugin.settings);
		const ready = notes.filter((n) => n.status === "ready").length;
		const broken = notes.filter((n) => n.issues.length).length;

		const header = root.createDiv({ cls: "relay-header" });
		header.createEl("h4", { text: "Waiting for transfer" });
		header.createSpan({
			cls: "relay-count",
			text: `${notes.length} note${notes.length === 1 ? "" : "s"} · ${ready} ready${broken ? ` · ${broken} with issues` : ""}`,
		});

		if (notes.length === 0) {
			root.createDiv({
				cls: "relay-empty",
				text: `Nothing in ${this.plugin.settings.inboxFolder}/. Capture a note and it will show up here.`,
			});
			return;
		}

		for (const [venture, list] of groupByVenture(notes)) {
			const group = root.createDiv({ cls: "relay-group" });
			group.createDiv({ cls: "relay-group-title", text: venture });
			for (const note of list) this.renderNote(group, note);
		}
	}

	private renderNote(parent: HTMLElement, note: InboxNote): void {
		const el = parent.createDiv({ cls: "relay-note" });
		if (note.status === "ready") el.addClass("is-ready");
		if (note.issues.length) el.addClass("has-issues");

		el.createDiv({ cls: "relay-note-title", text: note.title }).onClickEvent(() => {
			void this.app.workspace.getLeaf(false).openFile(note.file);
		});

		const meta = el.createDiv({ cls: "relay-meta" });
		meta.createSpan({ cls: "relay-badge", text: note.type || "no type" });
		meta.createSpan({ cls: `relay-badge status-${note.status || "none"}`, text: note.status || "no status" });
		if (note.created) meta.createSpan({ text: note.created });
		if (note.target) el.createDiv({ cls: "relay-target", text: `→ ${note.target}` });

		if (note.issues.length) {
			const ul = el.createEl("ul", { cls: "relay-issues" });
			for (const issue of note.issues) ul.createEl("li", { text: issue });
		}

		const actions = el.createDiv({ cls: "relay-actions" });
		const toggle = actions.createEl("button", {
			text: note.status === "ready" ? "Back to draft" : "Mark ready",
		});
		toggle.onClickEvent(async () => {
			await setStatus(this.app, note.file, note.status === "ready" ? "draft" : "ready");
			await this.plugin.afterInboxChange();
		});

		const done = actions.createEl("button", { text: "Transferred" });
		done.title = `Set status: transferred and move to ${this.plugin.settings.transferredFolder}/`;
		done.onClickEvent(async () => {
			try {
				await markTransferred(this.app, note.file, this.plugin.settings);
				new Notice(`Moved "${note.title}" to ${this.plugin.settings.transferredFolder}/`);
				await this.plugin.afterInboxChange();
			} catch (e) {
				new Notice(e instanceof Error ? e.message : String(e));
			}
		});
	}
}
