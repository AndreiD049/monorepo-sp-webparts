import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { IAction } from '@service/sp-cip/dist/services/action-service';
import { Link } from 'office-ui-fabric-react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
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

    const label = React.useMemo(() => {
        if (!props.task) {
            return 'Unknown';
        }
        return props.task.Title;
    }, [props.task]);

    // Nothing to render
    if (!Boolean(props.action.ItemId)) {
        return null;
    }

    return <Link onClick={() => navigate(`/task/${props.action.ItemId}`)}>{label}</Link>;
};
