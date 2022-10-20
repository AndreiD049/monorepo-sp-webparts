import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { ICipService, ITaskOverviewWithSource } from '../../sections/CipSection';

export function convertTask(task: ITaskOverview, service: ICipService): ITaskOverviewWithSource {
    return {
        ...task,
        service,
    }
}
