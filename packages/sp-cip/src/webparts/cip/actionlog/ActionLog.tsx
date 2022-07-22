import { Text } from 'office-ui-fabric-react';
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

    const [grouped, dates] = React.useMemo(() => {
        const result = {};
        const dates = [];
        actions.forEach((action) => {
            const date = new Date(action.Created);
            const dateString = date.toLocaleDateString();
            if (!result[dateString]) {
                result[dateString] = [];
                dates.push(date);
            }
            result[dateString].push(action);
        });
        dates.sort((a, b) => a < b ? 1 : -1);
        return [result, dates.map((d) => d.toLocaleDateString())];
    }, [actions]);

    React.useEffect(() => {
        if (props.task?.Id) {
            getActions(props.task.Id).then((a) => setActions(a));
        }
    }, [props.task]);

    return (
        <div style={{marginTop: '1em'}}>
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
                            <ActionLogItem key={a.ActivityType + a.Created} action={a} />
                        ))}
                    </div>
                );
            })}
        </div>
    );
};
