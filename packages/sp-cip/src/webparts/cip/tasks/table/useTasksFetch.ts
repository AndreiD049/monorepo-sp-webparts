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
import { GlobalContext } from '../../utils/GlobalContext';
import { ICipFilters } from './sort-filter/filters-reducer';

export const useTasksFetch = (filters: ICipFilters): { tasks: ITaskOverview[] } => {
    const { selectedTeam, currentUser } = React.useContext(GlobalContext);
    const team = React.useMemo(
        () => (selectedTeam !== 'All' ? selectedTeam : null),
        [selectedTeam]
    );
    const [tasks, setTasks] = React.useState<ITaskOverview[]>([]);
    const taskService = MainService.getTaskService();

    const getAll = React.useCallback(
        async (team: string) => {
            if (filters.assignedTo === AssigneeSelected.Single) {
                return taskService.getUserTasks(currentUser?.Id, 'All', team);
            }
            return taskService.getAllMains(team);
        },
        [filters, currentUser]
    );

    const getOpen = React.useCallback(
        async (team: string) => {
            if (filters.assignedTo === AssigneeSelected.Single) {
                return taskService.getUserTasks(currentUser?.Id, 'Open', team);
            }
            return taskService.getNonFinishedMains(team);
        },
        [filters, currentUser]
    );

    const getFinished = React.useCallback(
        async (team: string) => {
            if (filters.assignedTo === AssigneeSelected.Single) {
                return taskService.getUserTasks(
                    currentUser?.Id,
                    'Finished',
                    team
                );
            }
            return taskService.getFinishedMains(team);
        },
        [filters, currentUser]
    );

    React.useEffect(() => {
        async function run(): Promise<void> {
            if (!currentUser) return;
            loadingStart('default');
            switch (filters.status) {
                case StatusSelected.All:
                    setTasks(await getAll(team));
                    break;
                case StatusSelected.Open:
                    setTasks(await getOpen(team));
                    break;
                case StatusSelected.Finished:
                    setTasks(await getFinished(team));
                    break;
                default:
                    setTasks([]);
                    break;
            }
            loadingStop('default');
        }
        run().catch((err) => console.error(err));
    }, [filters.status, filters.assignedTo, team, currentUser]);

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
        const removeGetSubtasks = getSubtasksHandler(
            (parent: ITaskOverview) => {
                taskService.getSubtasks(parent).then(async (subtasks) => {
                    setTasks((prev) =>
                        uniqBy([...prev, ...subtasks], (t) => t.Id)
                    );
                }).catch((err) => console.error(err));
            }
        );

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
