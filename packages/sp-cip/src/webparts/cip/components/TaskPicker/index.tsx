import { ITag, Label, TagPicker } from 'office-ui-fabric-react';
import * as React from 'react';
import { StatusSelected } from '../command-bar/StatusSelector';
import MainService from '../../services/main-service';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';

export interface ITaskPickerPropsProps
    extends React.HTMLAttributes<HTMLElement> {
    tasks?: ITaskOverview[];
    selectedTask: ITaskOverview | undefined;
    onTaskSelected: (task: ITaskOverview | undefined) => void;
    label?: string;
}

export const TaskPicker: React.FC<ITaskPickerPropsProps> = (props) => {
    const [tasks, setTasks] = React.useState<ITaskOverview[]>([]);
    const taskService = MainService.getTaskService();

    /** Fetch tasks if not provided */
    React.useEffect(() => {
        async function getTasks(status: StatusSelected): Promise<void> {
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
            getTasks(taskStatus).catch((err) => console.error(err));
        } else {
            setTasks(props.tasks);
        }
    }, [props.tasks]);

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
        <>
            {props.label && <Label htmlFor={props.id}>{props.label}</Label>}
            <TagPicker
                inputProps={{
                    id: props.id,
                    placeholder: props.placeholder ? props.placeholder : 'No task: SPOT',
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
        </>
    );
};
