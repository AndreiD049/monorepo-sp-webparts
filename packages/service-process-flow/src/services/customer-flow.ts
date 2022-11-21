import { IField, IItemAddResult, IItemUpdateResult, IList } from 'sp-preset';
import { ICustomerFlow } from '../models';
import { IServiceProps } from '../models/IServiceProps';

const SELECT = ['Id', 'Flow', 'CustomerGroup', 'DBCustomers', 'Team'];

export class CustomerFlowService {
    private list: IList;
    private customerGroupField: IField;
    private dbCustomersField: IField;

    constructor(private props: IServiceProps) {
        this.list = this.props.sp.web.lists.getByTitle(props.listName);
        this.customerGroupField = this.list.fields.getByTitle('CustomerGroup');
        this.dbCustomersField = this.list.fields.getByTitle('DBCustomers');
    }

    async getById(id: number): Promise<ICustomerFlow> {
        return this.list.items.getById(id).select(...SELECT)();
    }

    async getAll(): Promise<ICustomerFlow[]> {
        return this.list.items.select(...SELECT)();
    }

    async getByTeam(team: string): Promise<ICustomerFlow[]> {
        return this.list.items.filter(`Team eq '${team}'`).select(...SELECT)();
    }

    async addFlow(payload: Omit<ICustomerFlow, 'Id'>): Promise<IItemAddResult> {
        if (!payload.Flow || !payload.Team) {
            throw Error('Not all necessary info.');
        } 
        if (payload.CustomerGroup) {
            await this.checkCustomerGroup(payload.CustomerGroup);
        }
        if (payload.DBCustomers.length > 0) {
            await this.checkDBCustomers(payload.DBCustomers);
        }
        return this.list.items.add(payload);
    }

    async updateFlow(id: number, payload: Partial<ICustomerFlow>): Promise<IItemUpdateResult> {
        if (payload.CustomerGroup) {
            await this.checkCustomerGroup(payload.CustomerGroup);
        }
        if (payload.DBCustomers && payload.DBCustomers.length > 0) {
            await this.checkDBCustomers(payload.DBCustomers);
        }
        return this.list.items.getById(id).update(payload);
    }

    async removeFlow(id: number): Promise<void> {
        await this.list.items.getById(id).recycle();
    }

    async getCustomerGroupChoices(): Promise<string[]> {
        return (
            (await this.customerGroupField()).Choices || []
        );
    }

    private async checkCustomerGroup(group: string): Promise<void> {
        const choices = await this.getCustomerGroupChoices();
        if (!choices.includes(group)) {
            await this.customerGroupField.update({
                Choices: [...choices, group],
            })
        }
    }

    async getDBCustomerChoices(): Promise<string[]> {
        return (
            (await this.dbCustomersField()).Choices || []
        );
    }

    async addDBCustomer(customers: string[]): Promise<void> {
        const currentOptions = await this.getDBCustomerChoices();
        await this.dbCustomersField.update({
            Choices: [...currentOptions, ...customers],
        });
    }

    private async checkDBCustomers(dbCustomers: string[]): Promise<void> {
        const choices = await this.getDBCustomerChoices();
        const missing = dbCustomers.filter((c) => !choices.includes(c));
        if (missing.length > 0) {
            await this.dbCustomersField.update({
                Choices: [...choices, ...missing],
            });
        }
    }

}
