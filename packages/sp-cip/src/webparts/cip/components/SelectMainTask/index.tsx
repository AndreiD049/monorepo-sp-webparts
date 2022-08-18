import {
    ITag,
    TagPicker,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { ITaskOverview } from '../../tasks/ITaskOverview';
import { TaskService } from '../../services/task-service';
import { GlobalContext } from '../../utils/GlobalContext';
import { StatusSelected } from '../command-bar/StatusSelector';
import styles from './SelectMainTask.module.scss';
import MainService from '../../services/main-service';

export interface ISelectMainTaskProps extends React.HTMLAttributes<HTMLElement> {
    tasks?: ITaskOverview[];
    selectedTask: ITaskOverview | null;
    onTaskSelected: (task: ITaskOverview) => void;
}

export const SelectMainTask: React.FC<ISelectMainTaskProps> = (props) => {
    const [tasks, setTasks] = React.useState<ITaskOverview[]>([]);
    const taskService = MainService.getTaskService();

    /** Fetch tasks if not provided */
    React.useEffect(() => {
        async function getTasks(status: StatusSelected) {
            let result: ITaskOverview[] = [];
            switch (status) {
                case StatusSelected.All:
                    result = await taskService.getAllMains();
                    break;
                case StatusSelected.Finished:
                    result = await taskService.getFinishedMains();
                    break;
                case StatusSelected.Open:
                    result = await taskService.getNonFinishedMains();
                    break;
            }
            setTasks(result);
        }
        if (!props.tasks) {
            const selectedStatus: HTMLDivElement =
                document.querySelector('[data-task-status]');
            const taskStatus =
                (+selectedStatus?.dataset.taskStatus as StatusSelected) ||
                StatusSelected.All;
            getTasks(taskStatus);
        } else {
            setTasks(props.tasks);
        }
    }, []);

    const options: ITag[] = React.useMemo(() => {
        return tasks.map((task) => ({
            key: task.Id,
            name: task.Title,
        }));
    }, [tasks]);

    const selected = React.useMemo(() => {
        if (!props.selectedTask) return [];
        return options.filter((opt) => opt.key === props.selectedTask.Id);
    }, [props.selectedTask, options]);

    return (
        <TagPicker
            inputProps={{
                id: props.id,
                placeholder: 'No task: SPOT'
            }}
            selectedItems={selected}
            onEmptyResolveSuggestions={(selected) => {
                if (!selected || selected.length === 0) return options;
                const selectedKey = selected[0].key;
                return options.filter((t) => t.key !== selectedKey);
            }}
            onResolveSuggestions={(filter) =>
                options.filter((o) =>
                    o.name.toLowerCase().includes(filter.toLowerCase())
                )
            }
            onChange={(items) => {
                if (items && items[0]) {
                    const id = items[0].key;
                    props.onTaskSelected(tasks.find((t) => t.Id === id));
                } else {
                    props.onTaskSelected(null);
                }
            }}
            itemLimit={1}
        />
    );
};
