import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import {
    ComboBox,
    IComboBoxOption,
    PrimaryButton,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { hideDialog, TaskPicker } from 'sp-components';
import MainService from '../../services/main-service';
import { TaskNode } from '../../tasks/graph/TaskNode';
import { taskAdded, taskDeleted, taskUpdated } from '../../utils/dom-events';
import { loadingStart, loadingStop } from '../utils/LoadingAnimation';
import styles from './MoveForm.module.scss';

export interface IMoveFormProps {
    node: TaskNode;
    onAfterMove?: () => void;
    dialogId?: string;
}

export const MoveForm: React.FC<IMoveFormProps> = (props) => {
    const task = props.node.getTask();
    const taskService = React.useMemo(() => MainService.getTaskService(), []);
    const [tasks, setTasks] = React.useState<ITaskOverview[]>([]);
    const [categories, setCategories] = React.useState([]);
    const [selectedCategory, setSelectedCategory] = React.useState<string>(
        task.Category
    );
    const [selectedParent, setSelectedParent] =
        React.useState<ITaskOverview | null>(props.node.getParent()?.getTask());

    React.useEffect(() => {
        async function run(): Promise<void> {
            setCategories(await taskService.getCategories());
        }
        run().catch((err) => console.error(err));
    }, []);
    
    React.useEffect(() => {
        async function run(): Promise<void> {
            if (selectedCategory) {
                const tasks = await taskService.getAllOpenByCategory(selectedCategory);
                setTasks(tasks.filter((t) => t.Id !== props.node.Id));
            }
        }
        run().catch((err) => console.error(err));
    }, [selectedCategory]);

    const groups: IComboBoxOption[] = React.useMemo(() => {
        return categories.map((cat) => ({
            key: cat,
            text: cat,
        }));
    }, [categories]);

    const handleMoveSubtasks = React.useCallback(
        async (task: ITaskOverview): Promise<void> => {
            if (task.Subtasks > 0) {
                const subtasks = await taskService.getSubtasks(task);
                await Promise.all(
                    subtasks.map(async (subtask) => {
                        const updatePayload = {
                            Category: task.Category,
                            MainTaskId: task.MainTaskId || task.Id,
                        };
                        await taskService.updateTask(subtask.Id, updatePayload);
                        taskUpdated({
                            ...task,
                            ...updatePayload,
                        });
                        if (subtask.Subtasks > 0) {
                            await handleMoveSubtasks(subtask);
                        }
                    })
                );
            }
        },
        [taskService]
    );

    const handleMoveTask = React.useCallback(
        async (category: string, parent: ITaskOverview | null) => {
            try {
                // Check new category if necessary
                const old = await taskService.getCategories();
                if (old.indexOf(category) === -1) {
                    await taskService.addCategory(category);
                }
                if (props.dialogId) {
                    hideDialog(props.dialogId);
                }
                loadingStart();
                const task = props.node.getTask();
                const update: Partial<ITaskOverview> = {
                    Category: category,
                };
                if (task.ParentId) {
                    // Update old parent
                    const oldParent = await taskService.getTask(task.ParentId);
                    const updatePayload = {
                        Subtasks: oldParent.Subtasks - 1,
                    };
                    await taskService.updateTask(oldParent.Id, updatePayload);
                    taskUpdated({
                        ...oldParent,
                        ...updatePayload,
                    });
					taskDeleted({
						...task,
						...update,
					});
                }
                if (parent) {
                    const newParent = await taskService.getTask(parent.Id);
                    update.ParentId = newParent.Id;
                    update.MainTaskId = newParent.MainTaskId;
                    // Update new parent
                    const updatePayload = {
                        Subtasks: newParent.Subtasks + 1,
                    };
                    await taskService.updateTask(newParent.Id, updatePayload);
                    taskUpdated({
                        ...newParent,
                        ...updatePayload,
                    });
					taskAdded({
						...task,
						...update,
					});
                } else {
                    update.ParentId = null;
                    update.MainTaskId = task.Id;
                }
                await taskService.updateTask(task.Id, update);
                taskUpdated({
                    ...task,
                    ...update,
                });
                await handleMoveSubtasks(await taskService.getTask(task.Id));
            } finally {
                loadingStop();
            }
        },
        [props.node, taskService]
    );

    return (
        <div className={styles.container}>
            <ComboBox
                label="Category"
                options={groups}
                useComboBoxAsMenuWidth
                autoComplete="on"
                allowFreeform
                selectedKey={selectedCategory}
                onChange={async (evt, option) => {
                    let category: string = option?.key as string;
                    /** New category added */
                    if (!category) {
                        const target: HTMLInputElement =
                            evt.target as HTMLInputElement;
                        category = target.value as string;
                        setCategories((prev) => [...prev, category])
                    }
                    if (category !== selectedCategory) {
                        setSelectedCategory(category);
                        setSelectedParent(null);
                    }
                }}
            />
            <TaskPicker
                id="sp-cip-move-task-input"
                label="Parent task"
                placeholder="No parent"
                tasks={tasks}
                selectedTask={selectedParent}
                onTaskSelected={(task) => {
                    if (task?.Id !== selectedParent?.Id) {
                        setSelectedParent(task);
                    }
                }}
            />
            <PrimaryButton
                className={styles.submit}
                onClick={() => handleMoveTask(selectedCategory, selectedParent)}
            >
                Move
            </PrimaryButton>
        </div>
    );
};
