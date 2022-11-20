import { IList } from 'sp-preset';
import { IUserProcedure } from '../models';
import { IServiceProps } from '../models/IServiceProps';

const SELECT = [
    'Id',
    'FlowId',
    'ProcedureId',
    'Date',
    'User/Id',
    'User/Title',
    'User/EMail',
    'Team',
    'Allocation',
    'UOM',
]

const EXPAND = ['User'];

export class UserProcedureService {
    private list: IList;

    constructor(private props: IServiceProps) {
        this.list = this.props.sp.web.lists.getByTitle(this.props.listName);
    }

    async getByFlow(flowId: number): Promise<IUserProcedure[]> {
        return this.list.items
            .filter(`FlowId eq ${flowId}`)
            .select(...SELECT) 
            .expand(...EXPAND)();
    }

    async addUserProcedure(payload: Omit<IUserProcedure, 'Id'>): Promise<void> {
        await this.list.items.add(payload);
    }

    async removeUserProcedure(id: number): Promise<void> {
        await this.list.items.getById(id).recycle();
    }
}
