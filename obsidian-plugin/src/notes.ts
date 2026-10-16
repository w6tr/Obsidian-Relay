import { App, TFile, normalizePath } from "obsidian";
import { REQUIRED_KEYS, STATUSES, type RelaySettings, type Status } from "./settings";

/** One Inbox note as the sidebar and Home.md see it. */
export interface InboxNote {
	file: TFile;
	title: string;
	type: string;
	venture: string;
	target: string;
	status: Status | string;
	created: string;
	device: string;
	issues: string[];
}

const toText = (v: unknown): string => {
	if (v === null || v === undefined) return "";
	if (Array.isArray(v)) return v.map(toText).join(", ");
	return String(v).trim();
};

/** Files directly inside `folder` (no sub-folders), markdown only. */
export function filesInFolder(app: App, folder: string): TFile[] {
	const wanted = normalizePath(folder);
	return app.vault.getMarkdownFiles().filter((f) => (f.parent?.path ?? "") === wanted);
}

/** Read a note's routing properties from the metadata cache and validate them. */
export function readInboxNote(app: App, file: TFile, settings: RelaySettings): InboxNote {
	const fm = (app.metadataCache.getFileCache(file)?.frontmatter ?? {}) as Record<string, unknown>;
	const note: InboxNote = {
		file,
		title: file.basename,
		type: toText(fm.type),
		venture: toText(fm.venture),
		target: toText(fm.target),
		status: toText(fm.status),
		created: toText(fm.created),
		device: toText(fm.device),
		issues: [],
	};

	for (const key of REQUIRED_KEYS) {
		if (!toText(fm[key])) note.issues.push(`missing \`${key}\``);
	}
	if (note.type && !settings.allowedTypes.includes(note.type)) {
		note.issues.push(`unknown type \`${note.type}\``);
	}
	if (note.status && !(STATUSES as readonly string[]).includes(note.status)) {
		note.issues.push(`unknown status \`${note.status}\``);
	}
	if (note.target && !note.target.endsWith(".md")) {
		note.issues.push("`target` should be a page path ending in .md");
	}
	if (note.venture && note.venture !== note.venture.toLowerCase()) {
		note.issues.push("`venture` slug should be lowercase");
	}
	if (!/^\d{4}-\d{2}-\d{2} /.test(file.basename)) {
		note.issues.push("filename should start with YYYY-MM-DD");
	}
	return note;
}

export function readInbox(app: App, settings: RelaySettings): InboxNote[] {
	return filesInFolder(app, settings.inboxFolder)
		.map((f) => readInboxNote(app, f, settings))
		.sort((a, b) => b.title.localeCompare(a.title)); // date-prefixed names → newest first
}

/** Group notes by venture slug, ventures alphabetical, notes newest first within each. */
export function groupByVenture(notes: InboxNote[]): Map<string, InboxNote[]> {
	const groups = new Map<string, InboxNote[]>();
	for (const n of notes) {
		const key = n.venture || "(no venture)";
		const list = groups.get(key) ?? [];
		list.push(n);
		groups.set(key, list);
	}
	return new Map([...groups.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

export async function setStatus(app: App, file: TFile, status: Status): Promise<void> {
	await app.fileManager.processFrontMatter(file, (fm) => {
		fm.status = status;
	});
}

async function ensureFolder(app: App, folder: string): Promise<void> {
	const path = normalizePath(folder);
	if (!app.vault.getAbstractFileByPath(path)) await app.vault.createFolder(path);
}

/** Mark a note transferred and move it to the Transferred folder (links are updated by Obsidian). */
export async function markTransferred(app: App, file: TFile, settings: RelaySettings): Promise<void> {
	await setStatus(app, file, "transferred");
	await ensureFolder(app, settings.transferredFolder);
	const dest = normalizePath(`${settings.transferredFolder}/${file.name}`);
	if (app.vault.getAbstractFileByPath(dest)) {
		throw new Error(`A note named "${file.name}" already exists in ${settings.transferredFolder}/`);
	}
	await app.fileManager.renameFile(file, dest);
}

/** Render the "Waiting for transfer" list in the same shape the capture skill writes. */
export function renderWaitingList(notes: InboxNote[]): string {
	if (notes.length === 0) return "- none yet";
	const lines: string[] = [];
	for (const [venture, list] of groupByVenture(notes)) {
		lines.push(`### ${venture}`);
		for (const n of list) {
			const meta = [n.type || "?", n.status || "?"].join(" · ");
			lines.push(`- [[${n.title}]] — ${meta}`);
		}
		lines.push("");
	}
	return lines.join("\n").trimEnd();
}

/**
 * Replace the body of `## <heading>` in the home note with the rendered list.
 * Lines beginning with `*(` directly under the heading are kept (the instruction line).
 */
export function spliceWaitingList(content: string, heading: string, list: string): string {
	const lines = content.split("\n");
	const start = lines.findIndex((l) => l.trim() === `## ${heading}`);
	if (start === -1) {
		return `${content.trimEnd()}\n\n## ${heading}\n\n${list}\n`;
	}
	let end = lines.length;
	for (let i = start + 1; i < lines.length; i++) {
		if (/^##\s/.test(lines[i]) || /^#\s/.test(lines[i])) {
			end = i;
			break;
		}
	}
	const kept: string[] = [];
	for (let i = start + 1; i < end; i++) {
		const l = lines[i];
		if (l.trim() === "" && kept.length === 0) continue;
		if (l.trim().startsWith("*(")) kept.push(l);
		else break;
	}
	const body = [...(kept.length ? ["", ...kept] : []), "", list, ""];
	return [...lines.slice(0, start + 1), ...body, ...lines.slice(end)].join("\n");
}

export async function updateHome(app: App, settings: RelaySettings): Promise<boolean> {
	const home = app.vault.getAbstractFileByPath(normalizePath(settings.homeFile));
	if (!(home instanceof TFile)) return false;
	const list = renderWaitingList(readInbox(app, settings));
	await app.vault.process(home, (data) => spliceWaitingList(data, settings.homeHeading, list));
	return true;
}
