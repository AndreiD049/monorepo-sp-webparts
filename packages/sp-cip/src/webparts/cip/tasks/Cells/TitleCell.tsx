import {
    IColumn,
    Icon,
    IconButton,
    IDetailsRowProps,
    Text,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { ITaskOverview } from '../ITaskOverview';
import { TaskContext } from '../TaskContext';
import { ICellRenderer } from './ICellRenderer';
import styles from './Cells.module.scss';
import ParentStroke from '../../components/ParentStroke';

interface ICheckExpandButtonProps
    extends React.HTMLAttributes<HTMLButtonElement> {
    item: ITaskOverview;
}

const CheckExpandButton: React.FC<ICheckExpandButtonProps> = (props) => {
    const ctx = React.useContext(TaskContext);
    const button = React.useRef(null);

    let classNames = React.useMemo(() => {
        let result = styles['round-button'];
        if (!props.item.SubtasksId?.length) {
            result += ` ${styles['round-success-button']}`;
        }
        return result;
    }, [props.item]);

    const content = React.useMemo(() => {
        if (props.item.SubtasksId?.length) {
            return <span>{props.item.SubtasksId.length}</span>;
        } else {
            return (
                <Icon
                    iconName="SkypeCheck"
                    className={styles['round-button__icon']}
                />
            );
        }
    }, [props.item]);

    return (
        <button
            ref={button}
            data-taskid={props.item.Id}
            onClick={props.onClick}
            className={classNames}
        >
            {content}
            <ParentStroke parentId={props.item.ParentId} />
        </button>
    );
};

export const TitleCell: ICellRenderer = (
    col: IColumn,
    props: IDetailsRowProps
) => {
    return (
        <TaskContext.Consumer>
            {(ctx) => {
                return (
                    <div
                        style={{
                            display: 'flex',
                            flexFlow: 'row nowrap',
                            alignItems: 'center',
                            justifyContent: 'start',
                            marginLeft: 30 * ctx.nestLevel,
                        }}
                    >
                        <CheckExpandButton
                            item={ctx.task}
                            onClick={() => ctx.setOpen((prev) => !prev)}
                        />
                        <Text variant="medium" block style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'pre',
                        }}>
                            {props.item[col.fieldName]}
                        </Text>
                    </div>
                );
            }}
        </TaskContext.Consumer>
    );
};
