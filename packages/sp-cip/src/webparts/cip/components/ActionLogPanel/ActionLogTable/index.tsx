import { uniq } from '@microsoft/sp-lodash-subset';
import { TaskService } from '@service/sp-cip';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { IAction } from '@service/sp-cip/dist/services/action-service';
import { createCacheProxy } from 'idb-proxy';
import {
    DetailsList,
    DetailsListLayoutMode,
    IColumn,
    IGroup,
    SelectionMode,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { showDialog } from 'sp-components';
import { ActionDropdownOption } from '..';
import { actionLogTaskServiceProxyOptions } from '../../../services/cache-proxy-options';
import MainService from '../../../services/main-service';
import { DIALOG_ID_ACTIONLOG_PANEL } from '../../../utils/constants';
import { TimeLog } from '../../TimeLog';
import { useColumns } from './useColumns';

export interface IActionLogTableProps {
    dateFrom: Date;
    dateTo: Date;
    action: ActionDropdownOption;
    selectedUsersIds: string[];
}

const actionLogService = (): TaskService =>
    createCacheProxy(
        MainService.getTaskService(),
        actionLogTaskServiceProxyOptions('Data')
    );

export const ActionLogTable: React.FC<IActionLogTableProps> = (props) => {
    const taskService = React.useMemo(() => actionLogService(), []);
    const actionService = React.useMemo(
        () => MainService.getActionService(),
        []
    );
    const [actions, setActions] = React.useState<IAction[]>([]);
    const [filteredActions, setFilteredActions] = React.useState<IAction[]>([]);
    const [tasks, setTasks] = React.useState([]);

    React.useEffect(() => {
        async function run(): Promise<void> {
            // Get actions, cached every 5 minutes
            const actions: IAction[] = await actionService.getActionsFromTo(
                props.dateFrom,
                props.dateTo
            );
            setActions(actions);
        }
        run().catch((err) => console.error(err));
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
        async function run(): Promise<void> {
            // Get tasks
            const taskIds = filteredActions
                .filter((a) => Boolean(a.ItemId))
                .map((a) => a.ItemId);
            const calls = uniq(taskIds).map(async (taskId) => {
                try {
                    const task = await taskService.getTask(taskId);
                    return task;
                } catch {
                    return null;
                }
            });
            const resolvedTasks = await Promise.all(calls);
            setTasks(resolvedTasks);
        }
        run().catch((err) => console.error(err));
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
    const handleEditTimeLog = async (
        action: IAction,
        task?: ITaskOverview
    ): Promise<void> => {
        showDialog({
            id: DIALOG_ID_ACTIONLOG_PANEL,
            dialogProps: {
                title: 'Log time',
            },
            content: (
                <TimeLog
                    task={task}
                    dialogId={DIALOG_ID_ACTIONLOG_PANEL}
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
