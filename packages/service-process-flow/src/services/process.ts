import { getAllPaged } from '@service/sp-cip';
import { IField, IItemAddResult, IItemUpdateResult, IList, SPFI } from 'sp-preset';
import { IProcess } from '../models';
import { IServiceProps } from '../models/IServiceProps';

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

export class ProcessService {
    private list: IList;
    private systemChoices: string[] = [];
    private systemField: IField;
    private categoryChoices: string[] = [];
    private categoryField: IField;

    constructor(private props: IServiceProps) {
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
