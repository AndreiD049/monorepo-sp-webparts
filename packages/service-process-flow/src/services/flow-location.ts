import { IField, IItem, IItemAddResult, IList } from 'sp-preset';
import { IFlowLocation } from '../models';
import { IServiceProps } from '../models/IServiceProps';

const SELECT = [
    'Id',
    'FlowId',
    'Process/Id',
    'Process/Process',
    'Location',
    'Country',
    'DoneBy',
];

const EXPAND = ['Process'];

export class FlowLocationService {
    private list: IList;
    private locationField: IField;
    private locationChoices: string[] = [];
    private countryField: IField;
    private countryChoices: string[] = [];
    private doneByField: IField;
    private doneByChoices: string[] = [];

    constructor(private props: IServiceProps) {
        this.list = this.props.sp.web.lists.getByTitle(this.props.listName);
        this.locationField = this.list.fields.getByTitle('Location');
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
        return this.list.items
            .filter(`FlowId eq ${flowId}`)
            .select(...SELECT)
            .expand(...EXPAND)();
    }

    async addFlowLocation(
        payload: Omit<IFlowLocation, 'Id' | 'Process'>
    ): Promise<IItemAddResult> {
        await this.updateLocationOptions(payload.Location);
        return this.list.items.add(payload);
    }

    async removeFlowLocation(id: number): Promise<void> {
        await this.list.items.getById(id).recycle();
    }

    async getLocationFieldChoices(): Promise<string[]> {
        this.locationChoices = (await this.locationField()).Choices || [];
        return this.locationChoices;
    }

    async getCountryFieldChoices(): Promise<string[]> {
        this.countryChoices = (await this.countryField()).Choices || [];
        return this.countryChoices;
    }

    async getDoneByFieldChoices(): Promise<string[]> {
        this.doneByChoices = (await this.doneByField()).Choices || [];
        return this.doneByChoices;
    }

    private async updateLocationOptions(location: string) {
        if (this.locationChoices.length === 0) {
            this.locationChoices = await this.getLocationFieldChoices();
        }
        if (!this.locationChoices.includes(location)) {
            await this.locationField.update({
                Choices: [...this.locationChoices, location],
            });
            this.locationChoices = [];
        }
    }
}
