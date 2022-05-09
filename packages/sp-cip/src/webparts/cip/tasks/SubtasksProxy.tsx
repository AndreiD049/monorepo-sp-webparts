import { round } from '@microsoft/sp-lodash-subset';
import { IDetailsRowProps } from 'office-ui-fabric-react';
import * as React from 'react';
import { REFRESH_SUBTASKS_EVT, RELINK_PARENT_EVT } from '../utils/constants';
import { ITaskOverview } from './ITaskOverview';
import Task from './Task';
import { TaskContext } from './TaskContext';
import TaskShimmer from './TaskShimmer';
import { useTasks } from './useTasks';

export interface ISubtaskProxyProps {
    rowProps: IDetailsRowProps;
    subtasks: ITaskOverview[];
    onLoad: (tasks: ITaskOverview[]) => void;
}

const SubtasksProxy: React.FC<ISubtaskProxyProps> = (props) => {
    const ctx = React.useContext(TaskContext);
    const { getSubtasks } = useTasks();
    const [loaded, setLoaded] = React.useState(false);

    React.useEffect(() => {
        async function run() {
            const sub = await getSubtasks(ctx.task.Id);
            props.onLoad(sub);
            setLoaded(true);
        }
        run();
        async function refreshSubtasks(evt) {
            if (evt.detail && evt.detail.parentId && evt.detail.parentId === ctx.task.Id) {
                await run();
                document.dispatchEvent(new CustomEvent(RELINK_PARENT_EVT));
            }
        }
        document.addEventListener(REFRESH_SUBTASKS_EVT, refreshSubtasks);
        return () => document.removeEventListener(REFRESH_SUBTASKS_EVT, refreshSubtasks);

    }, []);

    const shimmers = React.useMemo(() => {
        if (loaded) return null;
        return (
            <>
                {ctx.task.SubtasksId.map(() => (
                    <TaskShimmer rowProps={props.rowProps} />
                ))}
            </>
        );
    }, [loaded]);

    if (!loaded) {
        return shimmers;
    }

    return (
        <div>
            {props.subtasks.map((task) => (
                <Task
                    nestLevel={ctx.nestLevel + 1}
                    rowProps={{ ...props.rowProps, item: task }}
                />
            ))}
        </div>
    );
};

export default SubtasksProxy;
