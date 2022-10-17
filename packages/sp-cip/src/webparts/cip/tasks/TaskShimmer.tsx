import {
    IDetailsRowProps,
    Shimmer,
    ShimmerElementType,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { TaskNode } from './graph/TaskNode';
import styles from './Task.module.scss';

interface ITaskShimmerProps {
    rowProps: IDetailsRowProps;
    parentNode: TaskNode;
}

const TaskShimmer: React.FC<ITaskShimmerProps> = (props) => {
    return (
        <div className={styles.task}>
            {props.rowProps.columns.map((column) => {
                let shim;
                if (column.fieldName === 'Title') {
                    shim = (<Shimmer style={{marginLeft: (props.parentNode.level + 1) * 30}} shimmerElements={[
                        {
                            type: ShimmerElementType.circle,
                            width: 30
                        }, 
                        {
                            type: ShimmerElementType.gap,
                            width: 10,
                        },
                        {
                            type: ShimmerElementType.line,
                            width: column.calculatedWidth,
                        }
                    ]} />);
                } else {
                    shim = (<Shimmer width={column.calculatedWidth} />);
                }
                return (
                    <div
                        key={column.fieldName}
                        className={styles.task__cell}
                        style={{
                            width: column.calculatedWidth,
                        }}
                    >
                        {shim}
                    </div>
                );
            })}
        </div>
    );
};

export default TaskShimmer;
