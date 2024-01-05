import { IFileInfo, SPFI } from "sp-preset";
import { IServiceProps } from "../models/IServiceProps";

const TEMPLATE = 'Template.one';
const UNTITLED = 'Untitled Section.one';

export class NoteService {
	private sp: SPFI;
	private notesRoot: string;

	constructor(props: IServiceProps) {
		this.sp = props.sp;
		this.notesRoot = props.listName;
	}

	private getSectionPath(name: string) {
		const last = this.notesRoot[this.notesRoot.length - 1];
		if (last === "/") {
			return this.notesRoot + name;
		}
		return this.notesRoot + `/${name}`;
	}

	public async hasNotes(title: string): Promise<boolean> {
		try {
			await this.sp.web.getFileByServerRelativePath(this.getSectionPath(title + '.one'))();
			return true;
		} catch {
			return false;
		}
	}

	public async getSection(title: string): Promise<IFileInfo | null> {
		const hasNotes = await this.hasNotes(title);
		if (!hasNotes) {
			const created = await this.createSection(title);
			console.log(created);
		}
		return this.sp.web.getFileByServerRelativePath(this.getSectionPath(title + '.one'))();
	}

	private async createSection(title: string): Promise<string | null> {
		const templatePath = await this.getTemplate();
		if (!templatePath) {
			console.error('createSection: No template found. Returning null');
			return null;
		}
		try {
			const template = this.sp.web.getFileByServerRelativePath(templatePath);
			const destPath = this.getSectionPath(title + '.one');
			await template.copyByPath(destPath, false);
			return destPath;
		} catch (err) {
			console.error(err);
			return null;
		}
	}

	private async getTemplate(): Promise<string | null> {
		try {
			await this.sp.web.getFileByServerRelativePath(this.getSectionPath(TEMPLATE))();
			return this.getSectionPath(TEMPLATE);
		} catch {
			console.error(`Template '${TEMPLATE}' not found`);
		}
		try {
			await this.sp.web.getFileByServerRelativePath(this.getSectionPath(UNTITLED))();
			return this.getSectionPath(UNTITLED);
		} catch {
			console.error(`Template '${UNTITLED}' not found`);
		}
		return null;
	}
}
