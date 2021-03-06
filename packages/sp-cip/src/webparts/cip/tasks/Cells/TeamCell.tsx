import { ActionButton } from '@microsoft/office-ui-fabric-react-bundle';
import { Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { loadingStart, loadingStop } from '../../components/Utils/LoadingAnimation';
import { calloutVisibility, taskUpdated } from '../../utils/dom-events';
import { GlobalContext } from '../../utils/GlobalContext';
import { TaskNode } from '../graph/TaskNode';
import { ITaskOverview } from '../ITaskOverview';
import { TaskNodeContext } from '../TaskNodeContext';
import { useTasks } from '../useTasks';
import styles from './Cells.module.scss';

const TeamCellCallout: React.FC<ITeamCellProps> = (props) => {
    const task = props.node.getTask();
    const { updateTask, getTask } = useTasks(); 
    const { teams } = React.useContext(GlobalContext);

    const handleClick = React.useCallback((team: string) => async () => {
        loadingStart();
        calloutVisibility({ visible: false });
        await updateTask(task.Id, {
            Team: team,
        });
        taskUpdated(await getTask(task.Id));
        loadingStop();
    }, []);

    return (
        <div className={`${styles.callout} ${styles['center-content']}`}>
            {teams.map((team) => (
                <ActionButton disabled={task.Team === team} onClick={handleClick(team)} styles={{ root: { height: '1.8em' } }}>{team}</ActionButton>
            ))}
        </div>
    );
};

interface ITeamCellProps {
    node: TaskNode;
}

export const TeamCell: React.FC<ITeamCellProps> = (props) => {
    const { isTaskFinished } = React.useContext(TaskNodeContext);
    const task: ITaskOverview = props.node.getTask();
    const teamRef = React.useRef(null);

    const handleClick = React.useCallback(
        (evt) => {
            calloutVisibility({
                target: teamRef,
                visible: true,
                RenderComponent: TeamCellCallout,
                componentProps: props,
            });
        },
        [props.node, teamRef]
    );

    return (
        <button disabled={props.node.Display === 'disabled' || isTaskFinished} ref={teamRef} onClick={handleClick} className={`${styles.teamCell} ${styles.button}`}>
            <Text variant="medium">{task.Team || ''}</Text>
        </button>
    );
};
