import { IFile, IFileInfo, SPFI } from "sp-preset";
import { IServiceProps } from "../models/IServiceProps";

const TEMPLATE = 'Template.one';

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
			await this.createSection(title);
		}
		return this.sp.web.getFileByServerRelativePath(this.getSectionPath(title + '.one'))();
	}

	private async createSection(title: string): Promise<string | null> {
		const hasTemplate = await this.hasTemplate();
		if (!hasTemplate) {
			return null;
		}
		try {
			const template = this.sp.web.getFileByServerRelativePath(this.getSectionPath(TEMPLATE));
			const destPath = this.getSectionPath(title + '.one');
			await template.copyByPath(destPath, false);
			return destPath;
		} catch {
			return null;
		}
	}

	private async hasTemplate(): Promise<boolean> {
		try {
			await this.sp.web.getFileByServerRelativePath(this.getSectionPath(TEMPLATE))();
			return true;
		} catch {
			console.error('Template not found');
			const folder = await this.sp.web.getFolderByServerRelativePath(this.notesRoot).expand('Files')();
			console.error('Folder', folder);
			return false;
		}
	}
}
