import { Icon, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { ICellRenderer } from './ICellRenderer';
import styles from './Cells.module.scss';
import useParentStroke from '../../components/ParentStroke';
import { RELINK_PARENT_EVT } from '../../utils/constants';
import { TaskNode } from '../graph/TaskNode';
import { nodeToggleOpen, openPanel } from '../../utils/dom-events';
import { DETAILS_PANEL_ID } from '../../components/useCipPanels';

interface ICheckExpandButtonProps
    extends React.HTMLAttributes<HTMLButtonElement> {
    node: TaskNode;
}

const CheckExpandButton: React.FC<ICheckExpandButtonProps> = (props) => {
    const button = React.useRef(null);
    const item = props.node.getTask();

    let classNames = React.useMemo(() => {
        let result = styles['round-button'];
        if (!item.SubtasksId?.length) {
            result += ` ${styles['round-success-button']}`;
        }
        return result;
    }, [props.node]);

    const content = React.useMemo(() => {
        if (item.SubtasksId?.length) {
            return <span>{item.SubtasksId.length}</span>;
        } else {
            return (
                <Icon
                    iconName="SkypeCheck"
                    className={styles['round-button__icon']}
                />
            );
        }
    }, [props.node]);

    return (
        <div style={{position: 'relative'}}>
            <button
                ref={button}
                id={`task-${item.Id}`}
                data-taskid={item.Id}
                onClick={props.onClick}
                onDoubleClick={(evt) => evt.stopPropagation()}
                className={classNames}
            >
                {content}
            </button>
            {useParentStroke(props.node)}
        </div>
    );
};

export const TitleCell: ICellRenderer = (task, nestLevel) => {
    return (
        <div
            data-type="row"
            style={{
                display: 'flex',
                flexFlow: 'row nowrap',
                alignItems: 'center',
                justifyContent: 'start',
                marginLeft: 30 * nestLevel,
            }}
            itemType="button"
            onDoubleClick={(evt) => {
                openPanel(DETAILS_PANEL_ID, true);
                // Empty the selection is text was selected while double clicking
                document.getSelection().empty();
            }}
        >
            <CheckExpandButton
                node={task}
                onClick={() => {
                    if (task.getTask().SubtasksId.length === 0) {
                        return console.log('Finish');
                    } else {
                        nodeToggleOpen(task.Id);
                    }
                }}
            />
            <Text
                variant="medium"
                block
                style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'pre',
                }}
            >
                {task.getTask().Title}
            </Text>
        </div>
    );
};
