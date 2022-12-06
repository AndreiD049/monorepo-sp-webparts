import { IField, IItemAddResult, IList, SPFI } from 'sp-preset';
import { IProcess } from '../models';
import { IServiceProps } from '../models/IServiceProps';

const SELECT = [
    'Id',
    'System',
    'Process',
    'Category',
    'FlowId',
    'Manuals',
    'Allocation',
    'UOM',
];

export class ProcessService {
    private list: IList;
    private systemChoices: string[] = [];
    private systemField: IField;
    private processChoices: string[] = [];
    private processOptionsField: IField;
    private categorChoices: string[] = [];
    private categoryField: IField;

    constructor(private props: IServiceProps) {
        this.list = this.props.sp.web.lists.getByTitle(this.props.listName);
        this.systemField = this.list.fields.getByTitle('System');
        this.processOptionsField =
            this.list.fields.getByTitle('ProcessOptions');
        this.categoryField = this.list.fields.getByTitle('Category');
    }

    async getById(id: number): Promise<IProcess> {
        return this.list.items.getById(id).select(...SELECT)();
    }

    async getByFlow(flowId: number): Promise<IProcess[]> {
        return this.list.items
            .filter(`FlowId eq ${flowId}`)
            .select(...SELECT)();
    }

    async addProcess(payload: Omit<IProcess, 'Id'>): Promise<IItemAddResult> {
        await this.updateSystemChoices(payload.System);
        await this.updateProcessOptions(payload.Process);
        return this.list.items.add(payload);
    }

    async addProcesses(
        payload: Omit<IProcess, 'Id'>[]
    ): Promise<IItemAddResult[]> {
        const [batchedSP, execute] = this.props.sp.batched();
        const result: IItemAddResult[] = [];
        for (const process of payload) {
            console.log(process);
            const added = batchedSP.web.lists
                .getByTitle(this.props.listName)
                .items.add(process)
                .then((res) => result.push(res));
        }
        await execute();
        return result;
    }

    async removeProcess(id: number): Promise<void> {
        await this.list.items.getById(id).recycle();
    }

    async getSystemChoices(): Promise<string[]> {
        this.systemChoices = (await this.systemField()).Choices || [];
        return this.systemChoices;
    }

    async getProcessOptions(): Promise<string[]> {
        this.processChoices = (await this.processOptionsField()).Choices || [];
        return this.processChoices;
    }

    async getCategoryOptions(): Promise<string[]> {
        this.categorChoices = (await this.categoryField()).Choices || [];
        return this.categorChoices;
    }

    private async updateSystemChoices(system: string): Promise<void> {
        if (this.systemChoices.length === 0) {
            this.systemChoices = await this.getSystemChoices();
        }
        if (!this.systemChoices.includes(system)) {
            await this.systemField.update({
                Choices: [...this.systemChoices, system],
            });
            this.systemChoices = [];
        }
    }

    private async updateProcessOptions(process: string): Promise<void> {
        if (this.processChoices.length === 0) {
            this.processChoices = await this.getProcessOptions();
        }
        if (!this.processChoices.includes(process)) {
            await this.processOptionsField.update({
                Choices: [...this.processChoices, process],
            });
            this.processChoices = [];
        }
    }
}
