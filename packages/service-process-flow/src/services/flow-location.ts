import { IList } from 'sp-preset';
import { IFlowLocation } from '../models';
import { IServiceProps } from '../models/IServiceProps';

const SELECT = [
    'Id',
    'FlowId',
    'Procedure/Id',
    'Procedure/Procedure',
    'Location',
    'Country',
    'DoneBy',
]

const EXPAND = [ 'Procedure' ];

export class FlowLocationService {
    private list: IList;

    constructor(private props: IServiceProps) {
        this.list = this.props.sp.web.lists.getByTitle(this.props.listName);
    }
    
    async getByFlow(flowId: number): Promise<IFlowLocation[]> {
        return this.list.items
            .filter(`FlowId eq ${flowId}`)
            .select(...SELECT)
            .expand(...EXPAND)();
    }

    async addFlowLocation(payload: Omit<IFlowLocation, 'Id'>): Promise<void> {
        await this.list.items.add(payload);
    }

    async removeFlowLocation(id: number): Promise<void> {
        await this.list.items.getById(id).recycle();
    }
}
