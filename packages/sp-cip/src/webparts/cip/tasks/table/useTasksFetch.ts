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
    relinkParent,
    taskAddedHandler,
    taskDeletedHandler,
    taskUpdatedHandler,
} from '../../utils/dom-events';
import { GlobalContext } from '../../utils/GlobalContext';

export const useTasksFetch = (
    statusSelected: StatusSelected,
    assignedTo: AssigneeSelected
): { tasks: ITaskOverview[] } => {
    const { selectedTeam, currentUser } = React.useContext(GlobalContext);
    const team = React.useMemo(
        () => (selectedTeam !== 'All' ? selectedTeam : null),
        [selectedTeam]
    );
    const [tasks, setTasks] = React.useState<ITaskOverview[]>([]);
    const [reload, setReload] = React.useState<boolean>(false);
    const taskService = MainService.getTaskService();

    const getTasks = React.useCallback(async () => {
        let status: 'All' | 'Open' | 'Finished' = 'All';
        if (statusSelected === StatusSelected.Open) {
            status = 'Open';
        } else if (statusSelected === StatusSelected.Finished) {
            status = 'Finished';
        }
        if (assignedTo === AssigneeSelected.Single) {
            return taskService.getUserTasks(currentUser?.Id, status, team);
        }
        return taskService.getAll(team, status);
    }, [statusSelected, assignedTo, team, currentUser]);

    React.useEffect(() => {
        async function run(): Promise<void> {
            if (!currentUser) return;
            loadingStart('default');
            setTasks(await getTasks());
            loadingStop('default');
        }
        run().catch((err) => console.error(err));
    }, [statusSelected, assignedTo, team, currentUser, reload]);

    // Dom events
    React.useEffect(() => {
        // When task is added
        const removeTaskAdded = taskAddedHandler((task) => {
            setTasks((prev) => {
				// Not a subtask, just append it to the list
				if (!task.ParentId) {
					return [...prev, task];
				}
                return prev.map((t) => t.Id === task.Id ? task : t);
            });
            // relink all tasks
            relinkParent('all');
        });
        // When task is updated
        const removeTaskUpdated = taskUpdatedHandler((task) => {
			if (task.ParentId) {
				setTasks((prev) => prev.filter((t) => t.Id !== task.Id));
				return;
			}
            setTasks((prev) => {
				const result = [...prev]
				
				// if task not yet in the list, it probably was a subtaska and was moved
				// to main level
				const foundIdx = result.findIndex((t) => t.Id === task.Id);
				if (foundIdx === -1) {
					result.push(task);
					return result;
				}
				return result.map((t) => (t.Id === task.Id ? task : t));
			});
        });

        const removeTaskDeleted = taskDeletedHandler(async (taskId: number) => {
            setTasks((prev) => prev.filter((x) => x.Id !== taskId));
        });

        return () => {
            removeTaskAdded();
            removeTaskUpdated();
            removeTaskDeleted();
        };
    }, []);

    return {
        tasks,
    };
};
