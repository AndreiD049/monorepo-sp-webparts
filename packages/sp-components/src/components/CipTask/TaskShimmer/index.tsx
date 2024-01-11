import {
    IDetailsRowProps,
    Shimmer,
    ShimmerElementType,
} from '@fluentui/react';
import * as React from 'react';
import { TaskNode } from '@service/sp-cip';
import styles from './TaskShimmer.module.scss';

interface ITaskShimmerProps {
    rowProps: IDetailsRowProps;
    parentNode: TaskNode;
}

export const TaskShimmer: React.FC<ITaskShimmerProps> = (props) => {
    return (
        <div className={styles.task}>
            {props.rowProps.columns.map((column) => {
                let shim;
                if (column.key === 'Title') {
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
                        key={column.key}
                        className={styles.taskCell}
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
