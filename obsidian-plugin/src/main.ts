import { MarkdownView, Notice, Plugin, TAbstractFile, TFile, normalizePath } from "obsidian";
import { markTransferred, readInbox, setStatus, updateHome } from "./notes";
import { DEFAULT_SETTINGS, RelaySettingTab, type RelaySettings } from "./settings";
import { RelayView, VIEW_TYPE } from "./view";

export default class RelayPlugin extends Plugin {
	settings: RelaySettings = DEFAULT_SETTINGS;
	private refreshTimer: number | null = null;

	async onload(): Promise<void> {
		await this.loadSettings();
		this.addSettingTab(new RelaySettingTab(this.app, this));

		this.registerView(VIEW_TYPE, (leaf) => new RelayView(leaf, this));
		this.addRibbonIcon("send-horizontal", "Waiting for transfer", () => void this.activateView());

		this.addCommand({
			id: "open-view",
			name: "Open waiting-for-transfer sidebar",
			callback: () => void this.activateView(),
		});
		this.addCommand({
			id: "mark-ready",
			name: "Mark current note ready",
			checkCallback: (checking) => this.withCurrentInboxNote(checking, (f) => setStatus(this.app, f, "ready")),
		});
		this.addCommand({
			id: "mark-draft",
			name: "Mark current note draft",
			checkCallback: (checking) => this.withCurrentInboxNote(checking, (f) => setStatus(this.app, f, "draft")),
		});
		this.addCommand({
			id: "mark-transferred",
			name: "Mark current note transferred (move to Transferred folder)",
			checkCallback: (checking) =>
				this.withCurrentInboxNote(checking, (f) => markTransferred(this.app, f, this.settings)),
		});
		this.addCommand({
			id: "update-home",
			name: "Regenerate waiting list in home note",
			callback: async () => {
				const ok = await updateHome(this.app, this.settings);
				new Notice(ok ? `Updated ${this.settings.homeFile}` : `${this.settings.homeFile} not found`);
			},
		});
		this.addCommand({
			id: "validate-inbox",
			name: "Validate Inbox note properties",
			callback: () => {
				const notes = readInbox(this.app, this.settings);
				const broken = notes.filter((n) => n.issues.length);
				new Notice(
					broken.length === 0
						? `All ${notes.length} Inbox notes have valid properties.`
						: `${broken.length} of ${notes.length} Inbox notes have issues — see the sidebar.`,
				);
				if (broken.length) void this.activateView();
			},
		});

		// Keep the sidebar (and optionally Home.md) current when the Inbox changes.
		const onFile = (file: TAbstractFile, oldPath?: string) => {
			if (this.isInInbox(file.path) || (oldPath && this.isInInbox(oldPath))) this.scheduleRefresh();
		};
		this.registerEvent(this.app.vault.on("create", onFile));
		this.registerEvent(this.app.vault.on("delete", onFile));
		this.registerEvent(this.app.vault.on("rename", onFile));
		this.registerEvent(
			this.app.metadataCache.on("changed", (file) => {
				if (this.isInInbox(file.path)) this.scheduleRefresh();
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

	/** Called after a status change or move made by this plugin. */
	async afterInboxChange(): Promise<void> {
		this.refreshView();
		if (this.settings.autoUpdateHome) await updateHome(this.app, this.settings);
	}

	private scheduleRefresh(): void {
		if (this.refreshTimer !== null) window.clearTimeout(this.refreshTimer);
		// Debounce: metadata changes arrive in bursts while a note is being edited.
		this.refreshTimer = window.setTimeout(() => {
			this.refreshTimer = null;
			void this.afterInboxChange();
		}, 300);
	}

	private isInInbox(path: string): boolean {
		const inbox = normalizePath(this.settings.inboxFolder);
		return path.startsWith(inbox + "/") && path.endsWith(".md");
	}

	private withCurrentInboxNote(checking: boolean, action: (file: TFile) => Promise<void>): boolean {
		const file = this.app.workspace.getActiveViewOfType(MarkdownView)?.file;
		if (!file || !this.isInInbox(file.path)) return false;
		if (!checking) {
			action(file)
				.then(() => this.afterInboxChange())
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
