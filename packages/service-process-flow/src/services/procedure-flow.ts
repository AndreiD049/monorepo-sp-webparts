import { IList } from 'sp-preset';
import { IProcedure } from '../models';
import { IServiceProps } from '../models/IServiceProps';

const SELECT = ['Id', 'System', 'Procedure', 'Category', 'FlowId', 'Manuals'];

export class ProcedureService {
    private list: IList;

    constructor(private props: IServiceProps) {
        this.list = this.props.sp.web.lists.getByTitle(this.props.listName);
    }

    async getByFlow(flowId: number): Promise<IProcedure[]> {
        return this.list.items
            .filter(`FlowId eq ${flowId}`)
            .select(...SELECT)();
    }

    async addProcedure(payload: Omit<IProcedure, 'Id'>): Promise<void> {
        await this.list.items.add(payload);
    }

    async removeProcedure(id: number): Promise<void> {
        await this.list.items.getById(id).recycle();
    }
}
