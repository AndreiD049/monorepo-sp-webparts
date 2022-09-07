import { uniqBy } from 'lodash';
import * as React from 'react';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { AssigneeSelected } from '../../components/command-bar/CipAssigneeSelector';
import { StatusSelected } from '../../components/command-bar/StatusSelector';
import {
    loadingStart,
    loadingStop,
} from '../../components/utils/LoadingAnimation';
import MainService from '../../services/main-service';
import {
    getSubtasksHandler,
    relinkParent,
    taskAddedHandler,
    taskDeletedHandler,
    taskUpdatedHandler,
} from '../../utils/dom-events';
import { ICipFilters } from './sort-filter/filters-reducer';

export const useTasksFetch = (filters: ICipFilters) => {
    const userService = MainService.getUserService();
    const [tasks, setTasks] = React.useState<ITaskOverview[]>([]);
    const taskService = MainService.getTaskService();

    const getAll = React.useCallback(async () => {
        if (filters.assignedTo === AssigneeSelected.Single) {
            const currentUser = await userService.getCurrentUser();
            return taskService.getUserTasks(currentUser.Id, 'All');
        }
        return taskService.getAllMains();
    }, [filters])

    const getOpen = React.useCallback(async () => {
        if (filters.assignedTo === AssigneeSelected.Single) {
            const currentUser = await userService.getCurrentUser();
            return taskService.getUserTasks(currentUser.Id, 'Open');
        }
        return taskService.getNonFinishedMains();
    }, [filters])

    const getFinished = React.useCallback(async () => {
        if (filters.assignedTo === AssigneeSelected.Single) {
            const currentUser = await userService.getCurrentUser();
            return taskService.getUserTasks(currentUser.Id, 'Finished');
        }
        return taskService.getFinishedMains();
    }, [filters])

    React.useEffect(() => {
        async function run() {
            loadingStart('default');
            switch (filters.status) {
                case StatusSelected.All:
                    setTasks(await getAll());
                    break;
                case StatusSelected.Open:
                    setTasks(await getOpen());
                    break;
                case StatusSelected.Finished:
                    setTasks(await getFinished());
                    break;
                default:
                    setTasks([]);
                    break;
            }
            loadingStop('default')
        }
        run();
    }, [filters.status, filters.assignedTo]);

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
        const removeGetSubtasks = getSubtasksHandler((parent: ITaskOverview) => {
            taskService.getSubtasks(parent).then(async (subtasks) => {
                setTasks((prev) => uniqBy([...prev, ...subtasks], (t) => t.Id));
            });
        });

        const removeTaskDeleted = taskDeletedHandler((taskId: number) => {
            setTasks((prev) => prev.filter((t) => t.Id !== taskId));
        });

        return () => {
            removeTasksAdded();
            removeTaskUpdated();
            removeGetSubtasks();
            removeTaskDeleted();
        };
    }, []);

    return {
        tasks,
    };
};
