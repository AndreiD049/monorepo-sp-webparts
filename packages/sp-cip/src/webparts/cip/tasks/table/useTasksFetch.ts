import { uniqBy } from 'lodash';
import * as React from 'react';
import { StatusSelected } from '../../components/CipCommandBar';
import {
    loadingStart,
    loadingStop,
} from '../../components/Utils/LoadingAnimation';
import {
    getSubtasksHandler,
    relinkParent,
    taskAddedHandler,
    taskUpdatedHandler,
} from '../../utils/dom-events';
import { ITaskOverview } from '../ITaskOverview';
import { useTasks } from '../useTasks';
import { ICipFilters } from './filters-reducer';

export const useTasksFetch = (filters: ICipFilters) => {
    const [tasks, setTasks] = React.useState<ITaskOverview[]>([]);
    const { getAll, getNonFinishedMains, getSubtasks } = useTasks();

    React.useEffect(() => {
        loadingStart('default');
        switch (filters.status) {
            case StatusSelected.All:
                getAll().then((tasks) => {
                    setTasks(tasks);
                    loadingStop('default');
                });
                break;
            case StatusSelected.Open:
                getNonFinishedMains().then((tasks) => {
                    setTasks(tasks);
                    loadingStop('default');
                });
                break;
            default:
                setTasks([]);
                loadingStop('default');
                break;
        }
    }, [filters.status]);

    // Dom events
    React.useEffect(() => {
        // When task is added
        const removeTasksAdded = taskAddedHandler((tasks) => {
            const set = new Set(tasks.map((t) => t.Id));
            setTasks((prev) => [
                ...prev.filter((x) => !set.has(x.Id)),
                ...tasks,
            ]);
            // relink all tasks
            relinkParent('all');
        });
        // When task is updated
        const removeTaskUpdated = taskUpdatedHandler((task) => {
            setTasks((prev) => prev.map((t) => (t.Id === task.Id ? task : t)));
        });

        // When subtasks are loaded
        const removeGetSubtasks = getSubtasksHandler((parentId: number) => {
            getSubtasks(parentId)
                .then((subtasks) => {
                    setTasks((prev) => uniqBy([...prev, ...subtasks], (t) => t.Id));
                });
        });

        return () => {
            removeTasksAdded();
            removeTaskUpdated();
            removeGetSubtasks();
        };
    }, []);

    return {
        tasks,
    };
};
