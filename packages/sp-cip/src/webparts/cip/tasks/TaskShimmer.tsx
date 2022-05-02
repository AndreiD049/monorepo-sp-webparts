import {
    IDetailsRowProps,
    Shimmer,
    ShimmerElementType,
} from 'office-ui-fabric-react';
import * as React from 'react';
import styles from './Task.module.scss';
import { TaskContext } from './TaskContext';

interface ITaskShimmerProps {
    rowProps: IDetailsRowProps;
}

const TaskShimmer: React.FC<ITaskShimmerProps> = (props) => {
    const ctx = React.useContext(TaskContext);
    return (
        <div className={styles.task}>
            {props.rowProps.columns.map((column) => {
                let shim;
                if (column.fieldName === 'Title') {
                    shim = (<Shimmer shimmerElements={[
                        {
                            type: ShimmerElementType.gap,
                            width: (ctx.nestLevel + 1) * 30,
                        },
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
