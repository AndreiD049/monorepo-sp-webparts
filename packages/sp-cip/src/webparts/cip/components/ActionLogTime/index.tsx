import { IconButton, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { IAction } from '../../comments/useActions';
import { ITaskOverview } from '../../tasks/ITaskOverview';
import { DIALOG_IDS, getDialog } from '../AlertDialog';
import { TimeLogGeneral } from '../TimeLogGeneral';
import styles from './ActionLogTime.module.scss';

export interface IActionLogTimeProps {
    action: IAction;
    task: ITaskOverview;
}

const iconButtonStyles = {
    root: {
        width: 20,
        height: 20,
    },
    icon: {
        fontSize: '.9em',
    },
};

export const ActionLogTime: React.FC<IActionLogTimeProps> = (props) => {
    const [editable, setEditable] = React.useState(false);
    const [logged, setLogged] = React.useState(0);
    const [comment, setComment] = React.useState('');

    React.useEffect(() => {
        const indexOfPipe = props.action.Comment.indexOf('|');
        setLogged(Number.parseFloat(props.action.Comment.substring(0, indexOfPipe)));
        setComment(props.action.Comment.substring(indexOfPipe + 1))
    }, []);

    const handleEdit = () => {
        getDialog({
            alertId: 'DETAILS_PANEL',
            title: 'Log time',
            Component: <TimeLogGeneral task={props.task} dialogId={DIALOG_IDS.DETAILS_PANEL} action={props.action} />,
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.topHeader}>
                <div>Logged {logged} hour(s)</div>
                <IconButton styles={iconButtonStyles} onClick={handleEdit} iconProps={{ iconName: 'Edit' }} />
            </div>
            {comment && (
                <div className={styles.comment}>
                    <Text variant="medium">{comment}</Text>
                </div>
            )}
        </div>
    );
};
