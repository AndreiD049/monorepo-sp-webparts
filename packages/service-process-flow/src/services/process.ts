import { getAllPaged } from '@service/sp-cip';
import { IField, IItemAddResult, IItemUpdateResult, IList, SPFI } from 'sp-preset';
import { IManualJson, IProcess } from '../models';
import { IServiceProps } from '../models/IServiceProps';
import { docsMap, getFileNameExtension, getUrlPrefix, isDocLink, sanitizeLinkingUrl } from '../utils/manual-link';

const SELECT = [
    'Id',
    'System',
    'Title',
    'Category',
    'FlowId',
    'Manual',
    'Allocation',
    'UOM',
    'Team',
];

export function readManualJson(manual: string | undefined): IManualJson[] {
	if (!manual) return [];
	try {
		const json = JSON.parse(manual);
		if (!Array.isArray(json)) return [];
		return json;
	} catch {
		return [];
	}
}

export class ProcessService {
    private list: IList;
    private systemChoices: string[] = [];
    private systemField: IField;
    private categoryChoices: string[] = [];
    private categoryField: IField;

    constructor(private props: IServiceProps & { manualSP: SPFI }) {
        this.list = this.props.sp.web.lists.getByTitle(this.props.listName);
        this.systemField = this.list.fields.getByTitle('System');
        this.categoryField = this.list.fields.getByTitle('Category');
    }

    async getById(id: number): Promise<IProcess> {
        return this.list.items.getById(id).select(...SELECT)();
    }

    async getByFlow(flowId: number): Promise<IProcess[]> {
        return getAllPaged(this.list.items
            .filter(`FlowId eq ${flowId}`)
            .select(...SELECT));
    }

    async addProcess(payload: Omit<IProcess, 'Id'>): Promise<IItemAddResult> {
        await this.updateSystemChoices([payload.System]);
        await this.updateCategoryOptions([payload.Category]);
        return this.list.items.add(payload);
    }

    async addProcesses(
        payload: Omit<IProcess, 'Id'>[]
    ): Promise<IItemAddResult[]> {
        const [batchedSP, execute] = this.props.sp.batched();
        const result: IItemAddResult[] = [];
        await this.updateSystemChoices(payload.map((p) => p.System));
        await this.updateCategoryOptions(payload.map((p) => p.Category));
        for (const process of payload) {
            batchedSP.web.lists
                .getByTitle(this.props.listName)
                .items.add(process)
                .then((res) => result.push(res));
        }
        await execute();
        return result;
    }

    async updateProcess(id: number, payload: Partial<IProcess>): Promise<IItemUpdateResult> {
        if (payload.System) await this.updateSystemChoices([payload.System]);
        if (payload.Category) await this.updateCategoryOptions([payload.Category]);
        return this.list.items.getById(id).update(payload);
    }

	async updateManual(processId: number, manualLink: string): Promise<IItemUpdateResult> {
		return this.list.items.getById(processId).update({ Manual: manualLink });
	}

	async addManual(processId: number, manualLink: string, name: string, page: number): Promise<IItemUpdateResult> {
		const process = await this.getById(processId);
		const manuals = readManualJson(process.Manual);
		const newManualJson = await this.readJsonFromManualLink(manualLink, name, page);
		manuals.push(newManualJson);
		return this.list.items.getById(processId).update({ Manual: JSON.stringify(manuals) });
	}

	async editManual(processId: number, index: number, manualLink: string, name: string, page: number): Promise<IItemUpdateResult> {
		const process = await this.getById(processId);
		let manuals = readManualJson(process.Manual);
		if (index >= manuals.length) throw new Error('Index out of range');
		
		const newManual = await this.readJsonFromManualLink(manualLink, name, page);

		// Update the manual at index
		manuals = manuals.map((manual, i) => {
			if (i === index) return newManual;
			return manual;
		});

		return this.list.items.getById(processId).update({ Manual: JSON.stringify(manuals) });
	}

	async deleteManual(processId: number, manualName?: string, manualLink?: string) {
		const process = await this.getById(processId);
		const manuals = readManualJson(process.Manual);
		const newManuals = manuals.filter((manual) => {
			if (manualName) {
				return manual.Name !== manualName;
			}
			return manual.Link !== manualLink;
		});
		return this.list.items.getById(processId).update({ Manual: JSON.stringify(newManuals) });
	}

	private async readJsonFromManualLink(manualLink: string, name: string, page: number): Promise<IManualJson> {
		let fileInfo;
		// try to add the manual
		try {
			fileInfo = await this.props.manualSP.web.getFileByUrl(manualLink)();
		} catch {
			// Manual link cannot be found
			// Save it as a minimal link
			return {
				Name: name,
				Link: manualLink,
			};
		}
		const isDoc = isDocLink(fileInfo.Name);
		return {
			Id: fileInfo.UniqueId,
			Name: name,
			Filename: fileInfo.Name,
			isDoc: isDoc,
			DesktopLink: isDoc ? `${docsMap[getFileNameExtension(fileInfo.Name)]}${sanitizeLinkingUrl(fileInfo.LinkingUri)}` : undefined,
			Link: manualLink,
			Page: page,
		}
	};

	getManualLink(manual: IManualJson, linkType: 'embed' | 'browser' | 'desktop'): string | null {
		if (linkType === 'browser') {
			return manual.Link;
		}
		if (linkType === 'desktop') {
			if (!manual.isDoc || !manual.DesktopLink) {
				return null;
			}
			return manual.DesktopLink;
		}
		if (!manual.isDoc) {
			return getUrlPrefix(this.props.manualSP) + `_layouts/15/embed.aspx?UniqueId=${manual.Id}`;
		}
		let embedUrl = getUrlPrefix(this.props.manualSP) + `_layouts/15/Doc.aspx?sourcedoc={${manual.Id}}&action=embedview`;
		if (manual.Page && manual.Page > 1) {
			embedUrl += `&wdStartOn=${manual.Page}`;
		}
		return embedUrl;
	}

    async removeProcess(id: number): Promise<void> {
        await this.list.items.getById(id).recycle();
    }

    async getSystemChoices(): Promise<string[]> {
        this.systemChoices = (await this.systemField()).Choices || [];
        return this.systemChoices;
    }

    async getCategoryOptions(): Promise<string[]> {
        this.categoryChoices = (await this.categoryField()).Choices || [];
        return this.categoryChoices;
    }

    private async updateSystemChoices(systems: string[]): Promise<void> {
        if (this.systemChoices.length === 0) {
            this.systemChoices = await this.getSystemChoices();
        }
        // Find the systems that are new
        const newSystems = systems.filter(
            (s) => this.systemChoices.indexOf(s) === -1
        );
        if (newSystems.length > 0) {
            const toUpdate = Array.from(
                new Set([...this.systemChoices, ...newSystems])
            );
            await this.systemField.update({
                Choices: toUpdate,
            });
            this.systemChoices = [];
        }
    }

    private async updateCategoryOptions(categories: string[]): Promise<void> {
        if (this.categoryChoices.length === 0) {
            this.categoryChoices = await this.getCategoryOptions();
        }
        const newCategories = categories.filter(
            (c) => this.categoryChoices.indexOf(c) === -1
        );
        if (newCategories.length > 0) {
            const toUpdate = Array.from(
                new Set([...this.categoryChoices, ...newCategories])
            );
            await this.categoryField.update({
                Choices: toUpdate,
            });
            this.categoryChoices = [];
        }
    }
}
