import { uniq } from '@microsoft/sp-lodash-subset';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import {
    ActionType,
    IAction,
} from '@service/sp-cip/dist/services/action-service';
import { IndexedDbCache } from 'indexeddb-manual-cache';
import {
    DetailsList,
    DetailsListLayoutMode,
    IColumn,
    IGroup,
    SelectionMode,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { ActionDropdownOption } from '..';
import MainService from '../../../services/main-service';
import { DAY, DB_NAME, HOUR, STORE_NAME } from '../../../utils/constants';
import { DIALOG_IDS, getDialog } from '../../AlertDialog';
import { TimeLogGeneral } from '../../TimeLogGeneral';
import { useColumns } from './useColumns';

export interface IActionLogTableProps {
    dateFrom: Date;
    dateTo: Date;
    action: ActionDropdownOption;
    selectedUsersIds: string[];
}

/** Client Database cache */
export const db = new IndexedDbCache(DB_NAME, STORE_NAME, {
    expiresIn: DAY * 5,
});
export const cache = {
    getTask: (taskId: number) => db.key(`actionLogTask/${taskId}`),
};

export const ActionLogTable: React.FC<IActionLogTableProps> = (props) => {
    const taskService = React.useMemo(() => MainService.getTaskService(), []);
    const actionService = React.useMemo(
        () => MainService.getActionService(),
        []
    );
    const [actions, setActions] = React.useState<IAction[]>([]);
    const [filteredActions, setFilteredActions] = React.useState<IAction[]>([]);
    const [tasks, setTasks] = React.useState([]);

    React.useEffect(() => {
        async function run() {
            // Get actions
            let actions = await actionService.getActionsFromTo(
                props.dateFrom,
                props.dateTo,
            );
            setActions(actions);
        }
        run();
    }, [props.dateFrom]);

    // Apply filters and sorting if necessary
    React.useEffect(() => {
        let result = actions;
        if (props.action !== 'All') {
            result = result.filter((a) => a.ActivityType === props.action);
        }
        if (props.selectedUsersIds?.length > 0) {
            const set = new Set(props.selectedUsersIds);
            result = result.filter((a) => set.has(a.User.Id.toString()));
        }
        result.sort((a, b) => (a.Date < b.Date ? 1 : -1));
        setFilteredActions(result);
    }, [actions, props]);

    // Get tasks related to actions
    React.useEffect(() => {
        async function run() {
            // Get tasks
            const taskIds = filteredActions
                .filter((a) => Boolean(a.ItemId))
                .map((a) => a.ItemId);
            const calls = uniq(taskIds).map(async (taskId) => {
                return cache.getTask(taskId).get(async () => {
                    try {
                        const task = await taskService.getTask(taskId);
                        return task;
                    } catch {
                        return null;
                    }
                });
            });
            const resolvedTasks = await Promise.all(calls);
            setTasks(resolvedTasks);
        }
        run();
    }, [filteredActions]);

    // Group actions by date
    const groups = React.useMemo(() => {
        const result = new Map<string, IGroup>();
        for (let i = 0; i < filteredActions.length; i++) {
            const element = filteredActions[i];
            const dt = new Date(element.Date).toDateString();
            if (!result.has(dt)) {
                result.set(dt, {
                    key: dt,
                    name: dt,
                    startIndex: i,
                    count: 0,
                });
            }
            const prev = result.get(dt);
            result.set(dt, { ...prev, count: prev.count + 1 });
        }
        return Array.from(result.values());
    }, [filteredActions]);

    // Edit TimeLogs
    const handleEditTimeLog = async (action: IAction, task?: ITaskOverview) => {
        await getDialog({
            alertId: DIALOG_IDS.ACTIONLOG_PANEL,
            title: 'Log time',
            Component: (
                <TimeLogGeneral
                    task={task}
                    dialogId={DIALOG_IDS.ACTIONLOG_PANEL}
                    action={action}
                    afterLog={async () => {
                        const newAction = await actionService.getAction(
                            action.Id
                        );
                        setActions((prev) =>
                            prev.map((a) =>
                                a.Id === newAction.Id ? newAction : a
                            )
                        );
                    }}
                />
            ),
        });
    };
    const columns: IColumn[] = useColumns(tasks, handleEditTimeLog);

    return (
        <DetailsList
            items={filteredActions}
            groups={groups}
            columns={columns}
            layoutMode={DetailsListLayoutMode.fixedColumns}
            selectionMode={SelectionMode.none}
        />
    );
};
