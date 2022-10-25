import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { ITaskOverviewWithSource } from '../../sections/CipSection';
import { ICipService } from '../../sections/CipSection/useTasks';

export function convertTask(task: ITaskOverview, service: ICipService): ITaskOverviewWithSource {
    return {
        ...task,
        service,
    }
}
