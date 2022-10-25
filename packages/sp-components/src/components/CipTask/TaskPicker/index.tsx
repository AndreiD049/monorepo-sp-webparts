import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { ITag, TagPicker } from 'office-ui-fabric-react';
import * as React from 'react';

export interface ITaskPickerProps {
    tasks?: ITaskOverview[];
    id?: string;
    selectedTask: ITaskOverview | undefined;
    onTaskSelected: (task: ITaskOverview) => void;
    disabled?: boolean;
}

export const TaskPicker: React.FC<ITaskPickerProps> = ({ tasks = [], disabled = false, ...props }) => {
    const options: ITag[] = React.useMemo(() => {
        return tasks.map((task) => ({
            key: task.Id,
            name: task.Title,
        }));
    }, [tasks]);

    const selected = React.useMemo(() => {
        if (!props.selectedTask) return [];
        return [{
            key: props.selectedTask.Id,
            name: props.selectedTask.Title,
        }];
    }, [props.selectedTask, options]);

    return (
        <TagPicker
            inputProps={{
                id: props.id,
                placeholder: 'No task: SPOT'
            }}
            disabled={disabled}
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
