import { ActionButton } from '@microsoft/office-ui-fabric-react-bundle';
import { DirectionalHint, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { calloutVisibility, taskUpdated } from '../../utils/dom-events';
import { GlobalContext } from '../../utils/GlobalContext';
import { ITaskOverview } from '../ITaskOverview';
import { useTasks } from '../useTasks';
import styles from './Cells.module.scss';

const TeamCellCallout = (props) => {
    const task = props.node.getTask();
    const { updateTask, getTask } = useTasks(); 
    const { teams } = React.useContext(GlobalContext);

    const handleClick = React.useCallback((team: string) => async () => {
        calloutVisibility({ visible: false });
        await updateTask(task.Id, {
            Team: team,
        });
        taskUpdated(await getTask(task.Id));
    }, []);

    return (
        <div className={`${styles.callout} ${styles['center-content']}`}>
            {teams.map((team) => (
                <ActionButton disabled={task.Team === team} onClick={handleClick(team)} styles={{ root: { height: '1.8em' } }}>{team}</ActionButton>
            ))}
        </div>
    );
};

export const TeamCell = (props) => {
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
        <div ref={teamRef} onClick={handleClick} className={styles.teamCell}>
            <Text variant="medium">{task.Team || ''}</Text>
        </div>
    );
};
