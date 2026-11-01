import { App, TFile, normalizePath } from "obsidian";
import { ALLOWED_KEYS, NOT_CAPTURES, REQUIRED_KEYS, STATUSES, type RelaySettings, type Status } from "./settings";

/** One capture as the sidebar and INDEX.md see it. */
export interface CaptureNote {
	file: TFile;
	captured_at: string;
	status: Status | string;
	device: string;
	hint: string;
	issues: string[];
}

const FILENAME = /^\d{4}-\d{2}-\d{2}_\d{4}_[a-z0-9-]+$/;
const CAPTURED_AT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

const toText = (v: unknown): string => {
	if (v === null || v === undefined) return "";
	if (Array.isArray(v)) return v.map(toText).join(", ");
	return String(v).trim();
};

export function folderPath(settings: RelaySettings): string {
	return settings.captureFolder ? normalizePath(settings.captureFolder) : "";
}

export function indexPath(settings: RelaySettings): string {
	const folder = folderPath(settings);
	return normalizePath(folder ? `${folder}/${settings.indexFile}` : settings.indexFile);
}

/** True for a markdown file directly in the capture folder that is not the index or CLAUDE.md. */
export function isCapturePath(path: string, settings: RelaySettings): boolean {
	if (!path.endsWith(".md")) return false;
	const slash = path.lastIndexOf("/");
	const parent = slash === -1 ? "" : path.slice(0, slash);
	const name = path.slice(slash + 1);
	return parent === folderPath(settings) && name !== settings.indexFile && !NOT_CAPTURES.includes(name);
}

/** Read a capture's front matter from the metadata cache and validate it. */
export function readCapture(app: App, file: TFile): CaptureNote {
	const fm = (app.metadataCache.getFileCache(file)?.frontmatter ?? {}) as Record<string, unknown>;
	const note: CaptureNote = {
		file,
		captured_at: toText(fm.captured_at),
		status: toText(fm.status),
		device: toText(fm.device),
		hint: toText(fm.hint),
		issues: [],
	};

	for (const key of REQUIRED_KEYS) {
		if (!toText(fm[key])) note.issues.push(`missing \`${key}\``);
	}
	for (const key of Object.keys(fm)) {
		if (!(ALLOWED_KEYS as readonly string[]).includes(key)) note.issues.push(`unexpected key \`${key}\``);
	}
	if (note.status && !(STATUSES as readonly string[]).includes(note.status)) {
		note.issues.push(`unknown status \`${note.status}\``);
	}
	if (note.captured_at && !CAPTURED_AT.test(note.captured_at)) {
		note.issues.push("`captured_at` should be YYYY-MM-DDTHH:MM");
	}
	if (!FILENAME.test(file.basename)) {
		note.issues.push("filename should be YYYY-MM-DD_HHMM_slug");
	}
	return note;
}

/** Every capture in the folder, newest first by `captured_at`, then by filename. */
export function readCaptures(app: App, settings: RelaySettings): CaptureNote[] {
	return app.vault
		.getMarkdownFiles()
		.filter((f) => isCapturePath(f.path, settings))
		.map((f) => readCapture(app, f))
		.sort((a, b) => b.captured_at.localeCompare(a.captured_at) || b.file.name.localeCompare(a.file.name));
}

export async function setStatus(app: App, file: TFile, status: Status): Promise<void> {
	await app.fileManager.processFrontMatter(file, (fm) => {
		fm.status = status;
	});
}

/** The index list, in exactly the shape the `capture` skill writes. */
export function renderIndex(notes: CaptureNote[]): string {
	return notes.map((n) => `- ${n.file.name} · ${n.status || "?"} · ${n.captured_at || "?"}`).join("\n");
}

/** Keep everything above the first list line (the header), replace the list. */
export function spliceIndex(content: string, list: string): string {
	const lines = content.split("\n");
	const first = lines.findIndex((l) => l.startsWith("- "));
	const header = (first === -1 ? lines : lines.slice(0, first)).join("\n").trimEnd();
	return list ? `${header}\n\n${list}\n` : `${header}\n`;
}

const DEFAULT_HEADER =
	"# INDEX\n\nEvery capture in this folder, newest first. Rebuilt from the files after every\nchange — never edited by hand.";

/** Rewrite the index from the files; creates it if missing. Returns the capture count. */
export async function rebuildIndex(app: App, settings: RelaySettings): Promise<number> {
	const notes = readCaptures(app, settings);
	const list = renderIndex(notes);
	const path = indexPath(settings);
	const existing = app.vault.getAbstractFileByPath(path);
	if (existing instanceof TFile) {
		await app.vault.process(existing, (data) => spliceIndex(data, list));
	} else {
		await app.vault.create(path, spliceIndex(DEFAULT_HEADER, list));
	}
	return notes.length;
}
