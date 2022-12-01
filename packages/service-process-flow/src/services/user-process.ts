import { IItemAddResult, IItemUpdateResult, IList } from 'sp-preset';
import { IUserProcess } from '../models';
import { IServiceProps } from '../models/IServiceProps';

const SELECT = [
    'Id',
    'FlowId',
    'ProcessId',
    'Date',
    'User/Id',
    'User/Title',
    'User/EMail',
    'Team',
    'Status',
]

const EXPAND = ['User'];

export class UserProcessService {
    private list: IList;

    constructor(private props: IServiceProps) {
        this.list = this.props.sp.web.lists.getByTitle(this.props.listName);
    }

    async getByFlow(flowId: number): Promise<IUserProcess[]> {
        return this.list.items
            .filter(`FlowId eq ${flowId}`)
            .select(...SELECT) 
            .expand(...EXPAND)();
    }

    async getById(flowId: number): Promise<IUserProcess> {
        return this.list.items
            .getById(flowId)
            .select(...SELECT) 
            .expand(...EXPAND)();
    }

    async addUserProcess(payload: Omit<IUserProcess, 'Id' | 'User'> & { UserId: number }): Promise<IItemAddResult> {
        return this.list.items.add(payload);
    }

    async updateUserProcess(id: number, payload: Partial<IUserProcess>): Promise<IItemUpdateResult> {
        return this.list.items.getById(id).update(payload);
    }

    async removeUserProcess(id: number): Promise<void> {
        await this.list.items.getById(id).recycle();
    }
}
