import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { IAction } from '@service/sp-cip/dist/services/action-service';
import { Icon, Link } from 'office-ui-fabric-react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { getTimeLogTokens } from 'sp-components';
import styles from './TaskCell.module.scss';

export interface ITaskCellProps {
    // Props go here
    action: IAction;
    task: ITaskOverview;
}

/**
 * @description Represents a link to the task. The task is cached for 7 days and is not
 * requested from API every time.
 * If task is not found via API, link label will be "Unknown"
 * If there is no task, doesn't render anything
 */
export const TaskCell: React.FC<ITaskCellProps> = (props) => {
    const navigate = useNavigate();
    const tokens = React.useMemo(() => {
        if (props.action.ActivityType === 'Time log') {
            return getTimeLogTokens(props.action.Comment);
        }
        return null;
    }, []);

    const label = React.useMemo(() => {
        if (!props.task) {
            return 'Unknown';
        }
        return props.task.Title;
    }, [props.task]);

    if (tokens && tokens.task) {
        return <div className={styles.text}><Icon iconName='Info' title='SPOT' className={styles.spotIcon} /><span>{tokens.task}</span></div>;
    }

    // Nothing to render
    if (!Boolean(props.action.ItemId)) {
        return null;
    }

    return <Link onClick={() => navigate(`/task/${props.action.ItemId}`)}>{label}</Link>;
};
