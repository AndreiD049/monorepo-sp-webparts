import { Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { IAction } from '@service/sp-cip/dist/services/action-service';
import MainService from '../services/main-service';
import { ActionLogItem } from './ActionLogItem';

export interface IActionLogProps {
    task: ITaskOverview;
}

export const UPDATE_ACTION_EVENT = 'SP-CIP-UPDATE-ACTION';

export const actionUpdated = (a: IAction): void => {
    document.dispatchEvent(
        new CustomEvent(UPDATE_ACTION_EVENT, {
            detail: {
                action: a,
            },
        })
    );
};

export const ActionLog: React.FC<IActionLogProps> = (props) => {
    const actionService = MainService.getActionService();
    const [actions, setActions] = React.useState<IAction[]>([]);

    const [grouped, dates] = React.useMemo(() => {
        const result: { [key: string]: IAction[] } = {};
        const dates: Date[] = [];
        actions.forEach((action) => {
            const date = new Date(action.Date || action.Created);
            const dateString = date.toLocaleDateString();
            if (!result[dateString]) {
                result[dateString] = [];
                dates.push(date);
            }
            result[dateString].push(action);
        });
        dates.sort((a, b) => (a < b ? 1 : -1));
        return [result, dates.map((d) => d.toLocaleDateString())];
    }, [actions]);

    React.useEffect(() => {
        if (props.task?.Id) {
            actionService.getActions(props.task.Id).then((a) => setActions(a)).catch((err) => console.error(err));
        }
    }, [props.task]);

    /** Dom event to update actions */
    React.useEffect(() => {
        function handler(ev: CustomEvent): void {
            const { action } = ev.detail;
            setActions((prev) =>
                prev.map((a) => a.Id === action.Id ? action : a)
            );
        }
        document.addEventListener(UPDATE_ACTION_EVENT, handler);
        return () => document.removeEventListener(UPDATE_ACTION_EVENT, handler);
    }, []);

    return (
        <div style={{ marginTop: '1em' }}>
            {dates.map((date) => {
                return (
                    <div key={date}>
                        <Text
                            styles={{
                                root: { fontWeight: 700, textAlign: 'center' },
                            }}
                            variant="large"
                            block
                        >
                            {date}
                        </Text>
                        {grouped[date].map((a: IAction) => (
                            <ActionLogItem
                                key={a.ActivityType + a.Created + a.Comment}
                                task={props.task}
                                action={a}
                            />
                        ))}
                    </div>
                );
            })}
        </div>
    );
};
