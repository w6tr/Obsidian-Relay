import { App, PluginSettingTab, Setting } from "obsidian";
import type RelayPlugin from "./main";

export interface RelaySettings {
	/** Folder that holds captures, relative to the vault root. Empty = the vault root itself. */
	captureFolder: string;
	/** Index file inside the capture folder, rebuilt from the captures. */
	indexFile: string;
	/** Rebuild the index whenever any capture changes, not only after this plugin's own changes. */
	autoRebuildIndex: boolean;
}

export const DEFAULT_SETTINGS: RelaySettings = {
	captureFolder: "",
	indexFile: "INDEX.md",
	autoRebuildIndex: false,
};

/** Front-matter keys every capture must carry; mirrors the capture folder's CLAUDE.md. */
export const REQUIRED_KEYS = ["status", "captured_at", "device"] as const;
/** The only keys a capture may carry. */
export const ALLOWED_KEYS = [...REQUIRED_KEYS, "hint"] as const;
export const STATUSES = ["draft", "ready"] as const;
export type Status = (typeof STATUSES)[number];

/** Files in the capture folder that are not captures (besides the index). */
export const NOT_CAPTURES = ["CLAUDE.md"];

export class RelaySettingTab extends PluginSettingTab {
	constructor(app: App, private plugin: RelayPlugin) {
		super(app, plugin);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		const text = (name: string, desc: string, key: "captureFolder" | "indexFile") =>
			new Setting(containerEl)
				.setName(name)
				.setDesc(desc)
				.addText((t) =>
					t
						.setPlaceholder(DEFAULT_SETTINGS[key] || "(vault root)")
						.setValue(this.plugin.settings[key])
						.onChange(async (v) => {
							this.plugin.settings[key] = v.trim() || DEFAULT_SETTINGS[key];
							await this.plugin.saveSettings();
							this.plugin.refreshView();
						}),
				);

		text("Capture folder", "Where captures live, flat. Leave empty if the vault is the capture folder.", "captureFolder");
		text("Index file", "The index inside the capture folder, rebuilt from the captures.", "indexFile");

		new Setting(containerEl)
			.setName("Rebuild index on every change")
			.setDesc(
				"Rebuild the index whenever a capture is created, renamed, removed or edited. Off by default: the index is always rebuilt after this plugin's own status changes, and Claude rebuilds it after its own.",
			)
			.addToggle((t) =>
				t.setValue(this.plugin.settings.autoRebuildIndex).onChange(async (v) => {
					this.plugin.settings.autoRebuildIndex = v;
					await this.plugin.saveSettings();
				}),
			);
	}
}
