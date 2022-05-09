import * as React from 'react';
import { containsInvalidFileFolderChars } from 'sp-preset/node_modules/@pnp/sp';
import { TaskContext } from '../tasks/TaskContext';
import { RELINK_PARENT_EVT } from '../utils/constants';
import styles from './Cip.module.scss';

const ConnectElements = (from: HTMLElement, to: HTMLElement) => {
    let svg: any = document.getElementById(`svg-stroke-task-${from.id}-${to.id}`);
    if (!svg) {
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    }
    svg.id = `svg-stroke-task-${from.id}-${to.id}`;
    const fromRect = from.getBoundingClientRect();
    const toRect = to.getBoundingClientRect();
    const yDiff = Math.abs(fromRect.bottom - toRect.top);
    const xDiff = Math.abs(fromRect.left + from.clientWidth / 2 - toRect.left);
    svg.classList.add(styles['parent-stroke']);
    svg.style.top = `-${yDiff}px`;
    svg.style.left = `-${xDiff}px`;
    let path: any = document.getElementById(`svg-path-task-${from.id}-${to.id}`);
    if (!path) {
        path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    }
    path.id = `svg-path-task-${from.id}-${to.id}`;
    path.setAttribute(
        'd',
        `M0 0 l0 ${yDiff + to.clientHeight / 2 - 3} l3 3 l${xDiff - 3} 0`
    );
    svg.appendChild(path);
    to.appendChild(svg);
};

const useParentStroke = (parentId) => {
    const ctx = React.useContext(TaskContext);

    React.useLayoutEffect(() => {
        function linkElements() {
            setTimeout(() => {
                if (parentId > 0) {
                    const parent = document.getElementById(`task-${parentId}`);
                    const self = document.getElementById(`task-${ctx.task.Id}`);
                    ConnectElements(parent, self);
                }
            }, 0);
        }
        linkElements();
        document.addEventListener(RELINK_PARENT_EVT, linkElements);
        return () => document.removeEventListener(RELINK_PARENT_EVT, linkElements);
    }, []);

    if (!parentId) {
        return null;
    }
    return null;
    // return (
    //     <svg className={styles['parent-stroke']}>
    //         <path d="M0 0 l0 40 l25 0"/>
    //     </svg>
    // );
};

export default useParentStroke;
