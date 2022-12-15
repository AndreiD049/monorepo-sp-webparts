import { getAllPaged } from '@service/sp-cip';
import { IField, IItem, IItemAddResult, IItemUpdateResult, IList } from 'sp-preset';
import { IFlowLocation } from '../models';
import { IServiceProps } from '../models/IServiceProps';

const SELECT = [
    'Id',
    'FlowId',
    'Process/Id',
    'Process/Title',
    'Title',
    'Country',
    'DoneBy',
];

const EXPAND = ['Process'];

export class FlowLocationService {
    private list: IList;
    private locationChoices: string[] = [];
    private countryField: IField;
    private countryChoices: string[] = [];
    private doneByField: IField;
    private doneByChoices: string[] = [];

    constructor(private props: IServiceProps) {
        this.list = this.props.sp.web.lists.getByTitle(this.props.listName);
        this.countryField = this.list.fields.getByTitle('Country');
        this.doneByField = this.list.fields.getByTitle('DoneBy');
    }

    async getLocation(id: number): Promise<IFlowLocation> {
        return this.list.items
            .getById(id)
            .select(...SELECT)
            .expand(...EXPAND)();
    }

    async getByFlow(flowId: number): Promise<IFlowLocation[]> {
        return getAllPaged(
            this.list.items
                .filter(`FlowId eq ${flowId}`)
                .select(...SELECT)
                .expand(...EXPAND)
        );
    }

    async getByProcess(processId: number): Promise<IFlowLocation[]> {
        return getAllPaged(
            this.list.items
                .filter(`ProcessId eq ${processId}`)
                .select(...SELECT)
                .expand(...EXPAND)
        );
    }

    async addFlowLocation(
        payload: Omit<IFlowLocation, 'Id' | 'Process'>
    ): Promise<IItemAddResult> {
        await this.updateDoneByOptions(payload.DoneBy);
        return this.list.items.add(payload);
    }

    async addFlowLocations(payload: Omit<IFlowLocation, 'Id' | 'Process'>[]) {
        const [batchedSP, execute] = this.props.sp.batched();
        const result: IItemAddResult[] = [];
        await this.updateDoneByOptions(
            payload.reduce<string[]>(
                (prev, curr) =>
                    curr.DoneBy ? [...prev, ...curr.DoneBy] : prev,
                []
            )
        );
        for (const location of payload) {
            batchedSP.web.lists
                .getByTitle(this.props.listName)
                .items.add(location)
                .then((res) => result.push(res));
        }
        await execute();
        return result;
    }

    async updateFlowLocation(id: number, payload: Partial<IFlowLocation>): Promise<IItemUpdateResult> {
        if (payload.DoneBy && payload.DoneBy.length > 0) {
            await this.updateDoneByOptions(payload.DoneBy);
        }
        return this.list.items.getById(id).update(payload);
    }

    async removeFlowLocation(id: number): Promise<void> {
        await this.list.items.getById(id).recycle();
    }

    async getCountryFieldChoices(): Promise<string[]> {
        this.countryChoices = (await this.countryField()).Choices || [];
        return this.countryChoices;
    }

    async getDoneByFieldChoices(): Promise<string[]> {
        this.doneByChoices = (await this.doneByField()).Choices || [];
        return this.doneByChoices;
    }

    private async updateDoneByOptions(doneBy: string[]) {
        return this.updateChoices(doneBy, this.doneByChoices, this.doneByField);
    }

    private async updateChoices(
        items: string[],
        existing_choices: string[],
        field: IField
    ) {
        if (existing_choices.length === 0) {
            existing_choices = (await (await field()).Choices) || [];
        }
        const newItems = items.filter(
            (c) => existing_choices.indexOf(c) === -1
        );
        if (newItems.length > 0) {
            const toUpdate = Array.from(
                new Set([...existing_choices, ...newItems])
            );
            await field.update({
                Choices: toUpdate,
            });
            existing_choices = [];
        }
    }
}
