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
    node: TaskNode;
}

const TaskShimmer: React.FC<ITaskShimmerProps> = (props) => {
    return (
        <div className={styles.task}>
            {props.rowProps.columns.map((column) => {
                let shim;
                if (column.fieldName === 'Title') {
                    shim = (<Shimmer style={{marginLeft: (props.node.level + 1) * 30}} shimmerElements={[
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
