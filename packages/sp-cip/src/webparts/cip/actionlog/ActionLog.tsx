import * as React from 'react';
import { IAction, useActions } from '../comments/useActions';
import { ITaskOverview } from '../tasks/ITaskOverview';
import { ActionLogItem } from './ActionLogItem';

export interface IActionLogProps {
    task: ITaskOverview;
}

export const ActionLog: React.FC<IActionLogProps> = (props) => {
    const { getActions } = useActions();
    const [actions, setActions] = React.useState<IAction[]>([]);

    React.useEffect(() => {
        if (props.task?.Id) {
            getActions(props.task.Id).then((a) => setActions(a));
        }
    }, [props.task]);

    return (
        <div>
            {actions.map((a) => (<ActionLogItem action={a} />))}
        </div>
    );
};
