import { App, PluginSettingTab, Setting } from "obsidian";
import type RelayPlugin from "./main";

export interface RelaySettings {
	/** Folder that holds notes waiting for transfer. */
	inboxFolder: string;
	/** Folder that notes are moved to once marked `transferred`. */
	transferredFolder: string;
	/** Index note whose "Waiting for transfer" list the plugin can regenerate. */
	homeFile: string;
	/** Heading in the home note under which the waiting list lives. */
	homeHeading: string;
	/** Allowed values for the `type` property. */
	allowedTypes: string[];
	/** Rewrite the home note's waiting list automatically whenever the Inbox changes. */
	autoUpdateHome: boolean;
}

export const DEFAULT_SETTINGS: RelaySettings = {
	inboxFolder: "Inbox",
	transferredFolder: "Transferred",
	homeFile: "Home.md",
	homeHeading: "Waiting for transfer",
	allowedTypes: ["decision", "research", "meeting", "idea", "log"],
	autoUpdateHome: false,
};

/** Properties every staging note must carry; mirrors the staging vault's CLAUDE.md. */
export const REQUIRED_KEYS = ["type", "venture", "target", "status", "created", "device"] as const;
export const STATUSES = ["draft", "ready", "transferred"] as const;
export type Status = (typeof STATUSES)[number];

export class RelaySettingTab extends PluginSettingTab {
	constructor(app: App, private plugin: RelayPlugin) {
		super(app, plugin);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		const text = (
			name: string,
			desc: string,
			key: "inboxFolder" | "transferredFolder" | "homeFile" | "homeHeading",
		) =>
			new Setting(containerEl)
				.setName(name)
				.setDesc(desc)
				.addText((t) =>
					t
						.setPlaceholder(DEFAULT_SETTINGS[key])
						.setValue(this.plugin.settings[key])
						.onChange(async (v) => {
							this.plugin.settings[key] = v.trim() || DEFAULT_SETTINGS[key];
							await this.plugin.saveSettings();
							this.plugin.refreshView();
						}),
				);

		text("Inbox folder", "Where new staging notes live. Flat — sub-folders are ignored.", "inboxFolder");
		text("Transferred folder", "Where notes go when marked transferred.", "transferredFolder");
		text("Home note", "Index note whose waiting list the plugin regenerates.", "homeFile");
		text("Home heading", "The ## heading in the home note that holds the waiting list.", "homeHeading");

		new Setting(containerEl)
			.setName("Allowed note types")
			.setDesc("Comma-separated values the `type` property may take.")
			.addText((t) =>
				t
					.setValue(this.plugin.settings.allowedTypes.join(", "))
					.onChange(async (v) => {
						const list = v
							.split(",")
							.map((s) => s.trim())
							.filter(Boolean);
						this.plugin.settings.allowedTypes = list.length ? list : DEFAULT_SETTINGS.allowedTypes;
						await this.plugin.saveSettings();
						this.plugin.refreshView();
					}),
			);

		new Setting(containerEl)
			.setName("Keep home note in sync automatically")
			.setDesc(
				"Rewrite the waiting list in the home note whenever an Inbox note is created, renamed, removed or its properties change. Off by default so Claude stays the only writer unless you opt in.",
			)
			.addToggle((t) =>
				t.setValue(this.plugin.settings.autoUpdateHome).onChange(async (v) => {
					this.plugin.settings.autoUpdateHome = v;
					await this.plugin.saveSettings();
				}),
			);
	}
}
