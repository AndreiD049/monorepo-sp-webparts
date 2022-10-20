import * as React from 'react';
import { TaskNode } from '@service/sp-cip';
import styles from './ParentStroke.module.scss';

const getConnectingStroke = (
    from: HTMLElement,
    to: HTMLElement,
    prev: HTMLElement
): JSX.Element => {
    const hasPrev = prev !== from;
    const fromRect = from.getBoundingClientRect();
    const toRect = to.getBoundingClientRect();
    const prevRect = hasPrev ? prev.getBoundingClientRect() : fromRect;
    let yDiff = Math.abs(prevRect.bottom - toRect.top);
    if (hasPrev) {
        yDiff += from.clientHeight / 2 + 3;
    }
    const xDiff = Math.abs(fromRect.left + from.clientWidth / 2 - toRect.left);

    return (
        <svg
            className={styles.parentStroke}
            style={{
                top: `-${yDiff}px`,
                left: `-${xDiff}px`,
                height: `${yDiff + to.clientHeight / 2}px`,
                width: `${xDiff + 1}px`,
            }}
        >
            <path d={`M0 0 l0 ${yDiff + to.clientHeight / 2 - 3} l3 3 l${xDiff - 3} 0`} />
        </svg>
    );
};

export interface IParentStrokeProps {
    taskId: number;
    prevSiblingId?: number;
    parentId?: number;
}

export const ParentStroke: React.FC<IParentStrokeProps> = (props): JSX.Element => {
    const [self, setSelf] = React.useState(null);

    React.useEffect(() => {
        setTimeout(() => {
            setSelf(document.getElementById(`task-${props.taskId}`));
        }, 0);
    }, [props]);

    if (props.parentId) {
        const parent = document.getElementById(`task-${props.parentId}`);
        const prev =
            props.prevSiblingId && document.getElementById(`task-${props.prevSiblingId}`)
                ? document.getElementById(`task-${props.prevSiblingId}`)
                : parent;
        if (parent && self) {
            return getConnectingStroke(parent, self, prev);
        }
    }
    return null;
};
