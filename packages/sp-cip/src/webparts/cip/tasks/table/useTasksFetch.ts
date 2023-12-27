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
				const found = prev.findIndex((x) => x.Id === task.Id);
				if (found === -1) {
					return prev;
				}
                return prev.splice(found, 1, task);
            });
            // relink all tasks
            relinkParent('all');
        });
        // When task is updated
        const removeTaskUpdated = taskUpdatedHandler((task) => {
            setTasks((prev) => prev.map((t) => (t.Id === task.Id ? task : t)));
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
