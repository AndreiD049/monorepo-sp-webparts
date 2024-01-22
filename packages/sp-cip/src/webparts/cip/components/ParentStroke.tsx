import * as React from 'react';
import { TaskNode } from '../tasks/graph/TaskNode';
import { relinkParentHandler } from '../utils/dom-events';
import styles from './Cip.module.scss';

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
            className={styles['parent-stroke']}
            style={{
                top: `-${yDiff}px`,
                left: `-${xDiff}px`,
                height: `${yDiff + to.clientHeight / 2}px`,
                width: `${xDiff + 1}px`,
            }}
        >
            <path
                d={`M0 0 l0 ${yDiff + to.clientHeight / 2 - 3} l3 3 l${
                    xDiff - 3
                } 0`}
            />
        </svg>
    );
};

// Get the previous sibling in the DOM, if any
export function getPrevSibling(id: number): HTMLElement | undefined {
    const elem = document.getElementById(`cip-task-${id}`);
    if (!elem) return null;

    const parentId = elem.dataset.parentid;
    if (!parentId) return null;

    let prev = elem.previousElementSibling as HTMLElement;
	while (prev && prev.dataset?.parentid !== parentId) {
		prev = prev.previousElementSibling as HTMLElement;
	}
    if (!prev) return null;

    const prevParentId = prev.dataset.parentid;
    if (!prevParentId) return null;
    if (prevParentId !== parentId) return null;

    return prev;
}

function getTaskButton(elem: HTMLElement): HTMLElement | undefined {
    if (!elem) return null;
    return elem.querySelector('button[data-type="task-button"]');
}

const useParentStroke = (node: TaskNode): JSX.Element => {
    const task = node.getTask();
    const [elem, setElem] = React.useState(null);

    React.useEffect(() => {
        function linkElements(): void {
            setElem(null);
            setTimeout(() => {
                if (task.ParentId) {
                    const prevSibling = getPrevSibling(task.Id);
                    const prevButton = getTaskButton(prevSibling);
                    const parentButton = document.getElementById(
                        `task-${task.ParentId}`
                    );
                    const self = document.getElementById(`task-${task.Id}`);
                    const prev = prevButton ? prevButton : parentButton;
                    if (parentButton && self) {
                        setElem(getConnectingStroke(parentButton, self, prev));
                    }
                }
            }, 0);
        }
        linkElements();
        const removeRelinkHanler = relinkParentHandler(node.Id, linkElements);
        return () => removeRelinkHanler();
    }, []);

    return <>{elem}</>;
};

export default useParentStroke;
