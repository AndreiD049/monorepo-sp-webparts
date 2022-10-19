import { IconButton, IContextualMenuItem } from 'office-ui-fabric-react';
import * as React from 'react';
import styles from './ActionsCell.module.scss';

export interface IActionDetails {
    name: 'add' | 'commentAdd' | 'edit' | 'startTimer' | 'logTime' | 'delete' | 'move' | 'navigate';
    onClick: () => void;
}

export interface IActionsCellProps {
    disabled?: boolean;
    taskFinished?: boolean;
    items: IActionDetails[];
    overflowItems: IActionDetails[];
}

export const ActionsCell: React.FC<IActionsCellProps> = (props) => {
    const items = React.useMemo(() => {
        const result: JSX.Element[] = [];
        props.items.forEach((item) => {
            switch (item.name) {
                case 'add':
                    result.push(
                        <IconButton
                            className={styles.actionButton}
                            iconProps={{ iconName: 'Add' }}
                            title="Add subtask"
                            disabled={props.disabled}
                            onClick={item.onClick}
                        />
                    );
                    break;
                case 'commentAdd':
                    result.push(
                        <IconButton
                            className={styles.actionButton}
                            iconProps={{ iconName: 'CommentAdd' }}
                            title="Add comment"
                            disabled={props.disabled}
                            onClick={item.onClick}
                        />
                    );
                    break;
                case 'edit':
                    result.push(<IconButton
                        className={styles.actionButton}
                        iconProps={{ iconName: 'Edit' }}
                        title="Edit task"
                        disabled={props.disabled}
                        onClick={item.onClick}
                    />);
                    break;
                case 'logTime':
                    result.push(<IconButton
                        className={styles.actionButton}
                        iconProps={{ iconName: 'Clock' }}
                        title="Log time"
                        disabled={props.disabled}
                        onClick={item.onClick}
                    />);
                    break;
                case 'startTimer':
                    result.push(<IconButton
                        className={styles.actionButton}
                        iconProps={{ iconName: 'Play' }}
                        title="Start timer"
                        disabled={props.disabled}
                        onClick={item.onClick}
                    />);
                    break;
                case 'navigate':
                    result.push(<IconButton
                        className={styles.actionButton}
                        iconProps={{ iconName: 'OpenInNewWindow' }}
                        title="Navigate"
                        disabled={props.disabled}
                        onClick={item.onClick}
                    />);
                    break;
            }
        });
        return result;
    }, [props.items]);

    const overflowItems = React.useMemo(() => {
        const result: IContextualMenuItem[] = [];
        props.overflowItems.forEach((item) => {
            switch (item.name) {
                case 'delete':
                    result.push({
                        key: 'delete',
                        text: 'Delete',
                        iconProps: {
                            iconName: 'Delete',
                        },
                        onClick: item.onClick,
                    });
                    break;
                case 'move':
                    result.push({
                        key: 'move',
                        text: 'Move',
                        iconProps: {
                            iconName: 'SIPMove',
                        },
                        onClick: item.onClick,
                    });
                    break;
            }
        });
        return result;
    }, [props.overflowItems]);

    return (
        <div className={styles.container}>
            {items}
            <IconButton
                title="More options"
                disabled={props.disabled}
                menuIconProps={{ iconName: 'MoreVertical' }}
                className={styles.actionButton}
                menuProps={{
                    items: overflowItems,
                }}
            />
        </div>
    );
};
