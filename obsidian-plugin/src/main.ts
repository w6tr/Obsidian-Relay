import { MarkdownView, Notice, Plugin, TAbstractFile, TFile } from "obsidian";
import { isCapturePath, readCaptures, rebuildIndex, setStatus } from "./notes";
import { DEFAULT_SETTINGS, RelaySettingTab, type RelaySettings } from "./settings";
import { RelayView, VIEW_TYPE } from "./view";

export default class RelayPlugin extends Plugin {
	settings: RelaySettings = DEFAULT_SETTINGS;
	private refreshTimer: number | null = null;

	async onload(): Promise<void> {
		await this.loadSettings();
		this.addSettingTab(new RelaySettingTab(this.app, this));

		this.registerView(VIEW_TYPE, (leaf) => new RelayView(leaf, this));
		this.addRibbonIcon("inbox", "Captures", () => void this.activateView());

		this.addCommand({
			id: "open-view",
			name: "Open captures sidebar",
			callback: () => void this.activateView(),
		});
		this.addCommand({
			id: "mark-ready",
			name: "Mark current capture ready",
			checkCallback: (checking) => this.withCurrentCapture(checking, (f) => setStatus(this.app, f, "ready")),
		});
		this.addCommand({
			id: "mark-draft",
			name: "Mark current capture draft",
			checkCallback: (checking) => this.withCurrentCapture(checking, (f) => setStatus(this.app, f, "draft")),
		});
		this.addCommand({
			id: "rebuild-index",
			name: "Rebuild INDEX.md",
			callback: async () => {
				const n = await rebuildIndex(this.app, this.settings);
				new Notice(`Rebuilt ${this.settings.indexFile}: ${n} capture${n === 1 ? "" : "s"}`);
			},
		});
		this.addCommand({
			id: "validate",
			name: "Validate captures",
			callback: () => {
				const notes = readCaptures(this.app, this.settings);
				const broken = notes.filter((n) => n.issues.length);
				new Notice(
					broken.length === 0
						? `All ${notes.length} captures are valid.`
						: `${broken.length} of ${notes.length} captures have issues — see the sidebar.`,
				);
				if (broken.length) void this.activateView();
			},
		});

		// Keep the sidebar (and optionally the index) current when captures change.
		const onFile = (file: TAbstractFile, oldPath?: string) => {
			if (this.isCapture(file.path) || (oldPath && this.isCapture(oldPath))) this.scheduleRefresh();
		};
		this.registerEvent(this.app.vault.on("create", onFile));
		this.registerEvent(this.app.vault.on("delete", onFile));
		this.registerEvent(this.app.vault.on("rename", onFile));
		this.registerEvent(
			this.app.metadataCache.on("changed", (file) => {
				if (this.isCapture(file.path)) this.scheduleRefresh();
			}),
		);
	}

	onunload(): void {
		if (this.refreshTimer !== null) window.clearTimeout(this.refreshTimer);
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	/** Re-render every open sidebar instance. */
	refreshView(): void {
		for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE)) {
			if (leaf.view instanceof RelayView) leaf.view.render();
		}
	}

	/** After a status change made by this plugin the index always follows. */
	async afterStatusChange(): Promise<void> {
		await rebuildIndex(this.app, this.settings);
		this.refreshView();
	}

	private scheduleRefresh(): void {
		if (this.refreshTimer !== null) window.clearTimeout(this.refreshTimer);
		// Debounce: metadata changes arrive in bursts while a note is being edited.
		this.refreshTimer = window.setTimeout(() => {
			this.refreshTimer = null;
			this.refreshView();
			if (this.settings.autoRebuildIndex) void rebuildIndex(this.app, this.settings);
		}, 300);
	}

	private isCapture(path: string): boolean {
		return isCapturePath(path, this.settings);
	}

	private withCurrentCapture(checking: boolean, action: (file: TFile) => Promise<void>): boolean {
		const file = this.app.workspace.getActiveViewOfType(MarkdownView)?.file;
		if (!file || !this.isCapture(file.path)) return false;
		if (!checking) {
			action(file)
				.then(() => this.afterStatusChange())
				.catch((e: unknown) => new Notice(e instanceof Error ? e.message : String(e)));
		}
		return true;
	}

	async activateView(): Promise<void> {
		const { workspace } = this.app;
		let leaf = workspace.getLeavesOfType(VIEW_TYPE)[0];
		if (!leaf) {
			const right = workspace.getRightLeaf(false);
			if (!right) return;
			await right.setViewState({ type: VIEW_TYPE, active: true });
			leaf = right;
		}
		void workspace.revealLeaf(leaf);
	}
}
