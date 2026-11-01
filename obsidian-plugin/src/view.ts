import { ItemView, WorkspaceLeaf } from "obsidian";
import type RelayPlugin from "./main";
import { readCaptures, setStatus, type CaptureNote } from "./notes";

export const VIEW_TYPE = "obsidian-relay-view";

export class RelayView extends ItemView {
	constructor(leaf: WorkspaceLeaf, private plugin: RelayPlugin) {
		super(leaf);
	}

	getViewType(): string {
		return VIEW_TYPE;
	}

	getDisplayText(): string {
		return "Captures";
	}

	getIcon(): string {
		return "inbox";
	}

	async onOpen(): Promise<void> {
		this.render();
	}

	render(): void {
		const root = this.contentEl;
		root.empty();
		root.addClass("relay-view");

		const notes = readCaptures(this.app, this.plugin.settings);
		const ready = notes.filter((n) => n.status === "ready").length;
		const broken = notes.filter((n) => n.issues.length).length;

		const header = root.createDiv({ cls: "relay-header" });
		header.createEl("h4", { text: "Captures" });
		header.createSpan({
			cls: "relay-count",
			text: `${notes.length} · ${ready} ready${broken ? ` · ${broken} with issues` : ""}`,
		});

		if (notes.length === 0) {
			root.createDiv({
				cls: "relay-empty",
				text: "No captures yet. Tell Claude what to write down and it shows up here.",
			});
			return;
		}

		// Flat, newest first — the same order as INDEX.md.
		for (const note of notes) this.renderNote(root, note);
	}

	private renderNote(parent: HTMLElement, note: CaptureNote): void {
		const el = parent.createDiv({ cls: "relay-note" });
		if (note.status === "ready") el.addClass("is-ready");
		if (note.issues.length) el.addClass("has-issues");

		el.createDiv({ cls: "relay-note-title", text: note.file.basename }).onClickEvent(() => {
			void this.app.workspace.getLeaf(false).openFile(note.file);
		});

		const meta = el.createDiv({ cls: "relay-meta" });
		meta.createSpan({ cls: `relay-badge status-${note.status || "none"}`, text: note.status || "no status" });
		if (note.captured_at) meta.createSpan({ text: note.captured_at });
		if (note.device) meta.createSpan({ text: note.device });
		if (note.hint) el.createDiv({ cls: "relay-hint", text: `hint: ${note.hint}` });

		if (note.issues.length) {
			const ul = el.createEl("ul", { cls: "relay-issues" });
			for (const issue of note.issues) ul.createEl("li", { text: issue });
		}

		const isReady = note.status === "ready";
		const toggle = el.createDiv({ cls: "relay-actions" }).createEl("button", {
			text: isReady ? "Back to draft" : "Mark ready",
		});
		if (isReady) {
			toggle.title = "Only if the main vault has not filed it yet. After that, a correction is a new capture.";
		}
		toggle.onClickEvent(async () => {
			await setStatus(this.app, note.file, isReady ? "draft" : "ready");
			await this.plugin.afterStatusChange();
		});
	}
}
