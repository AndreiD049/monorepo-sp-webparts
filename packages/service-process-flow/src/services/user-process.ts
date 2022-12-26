import { getAllPaged } from '@service/sp-cip';
import { IItemAddResult, IItemUpdateResult, IList } from 'sp-preset';
import { IUserProcess } from '../models';
import { IServiceProps } from '../models/IServiceProps';
import { IUserProcessDetailed } from '../models/IUserProcess';

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

const SELECT_PROCESS_DETAILS = [
    ...SELECT,
    'Flow/Id',
    'Flow/Title',
    'Process/Id',
    'Process/Title',
];

const EXPAND_PROCESS_DETAILS = [
    ...EXPAND,
    'Process',
    'Flow'
]

export class UserProcessService {
    private list: IList;

    constructor(private props: IServiceProps) {
        this.list = this.props.sp.web.lists.getByTitle(this.props.listName);
    }

    async getByFlow(flowId: number): Promise<IUserProcess[]> {
        return getAllPaged(this.list.items
            .filter(`FlowId eq ${flowId}`)
            .select(...SELECT) 
            .expand(...EXPAND));
    }

    async getById(flowId: number): Promise<IUserProcess> {
        return this.list.items
            .getById(flowId)
            .select(...SELECT_PROCESS_DETAILS) 
            .expand(...EXPAND_PROCESS_DETAILS)();
    }

    async getByTeamAndStatus(team: string, status: string): Promise<IUserProcessDetailed[]> {
        return getAllPaged(this.list.items
            .filter(`Team eq '${team}' and Status eq '${status}'`)
            .select(...SELECT_PROCESS_DETAILS) 
            .expand(...EXPAND_PROCESS_DETAILS));
    }

    async getByProcess(processId: number): Promise<IUserProcess[]> {
        return getAllPaged(this.list.items
            .filter(`ProcessId eq ${processId}`)
            .select(...SELECT) 
            .expand(...EXPAND));
    }

    async getByUserProcess(processId: number, userId: number): Promise<IUserProcess[]> {
        return this.list.items
            .filter(`ProcessId eq ${processId} and UserId eq ${userId}`)
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
