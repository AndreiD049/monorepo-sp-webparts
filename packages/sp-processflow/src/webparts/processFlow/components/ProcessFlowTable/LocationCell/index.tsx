import { IFlowLocation } from '@service/process-flow';
import * as React from 'react';
import { copyLocation, pasteLocation } from '../../../utils/events';
import styles from './LocationCell.module.scss';

export interface ILocationCellProps {
    location: IFlowLocation | undefined;
    processId: number;
    title: string;
}

export const LocationCell: React.FC<ILocationCellProps> = (props) => {
    const cellRef = React.useRef(null);
    const content = React.useMemo(() => {
        if (!props.location) return 'N/A';
        return props.location?.DoneBy.join('/');
    }, [props.location]);

    const handleContextMenu: React.MouseEventHandler<HTMLElement> = React.useCallback((ev) => {
        ev.preventDefault();
    }, []);

    const handleKeyPress: React.KeyboardEventHandler<HTMLElement> = React.useCallback((ev) => {
        if (ev.key.toLowerCase() === 'c' && ev.ctrlKey) {
            copyLocation(props.location || 'empty');
        } else if (ev.key.toLowerCase() === 'v' && ev.ctrlKey) {
            pasteLocation({ processId: props.processId, title: props.title });
        }
    }, [props.location, props.processId]);

    return (
        <div
            ref={cellRef}
            className={styles.container}
            tabIndex={0}
            onContextMenu={handleContextMenu}
            onKeyDown={handleKeyPress}
        >
            {content}
        </div>
    );
};
