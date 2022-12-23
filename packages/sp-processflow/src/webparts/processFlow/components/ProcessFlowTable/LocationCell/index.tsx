import { IFlowLocation } from '@service/process-flow';
import { ActionButton, Stack } from 'office-ui-fabric-react';
import * as React from 'react';
import {
    hideCallout,
    showCallout,
} from 'sp-components';
import {
    MAIN_CALLOUT,
    MAIN_DIALOG,
} from '../../../utils/constants';
import { copyLocation, pasteLocation } from '../../../utils/events';
import { addLocation, deleteLocation, editLocation } from '../../LocationDialog';
import styles from './LocationCell.module.scss';

export interface ILocationCellProps {
    location: IFlowLocation | undefined;
    processId: number;
    title: string;
}

const LocationCallout: React.FC<ILocationCellProps> = (
    props
) => {
    const handleAdd = React.useCallback(() => {
        hideCallout(MAIN_CALLOUT);
        addLocation(props.title, props.processId, MAIN_DIALOG);
    }, [props.location]);

    const handleEdit = React.useCallback(() => {
        hideCallout(MAIN_CALLOUT);
        editLocation(props.location, MAIN_DIALOG);
    }, [props.location]);

    const handleDelete = React.useCallback(async () => {
        hideCallout(MAIN_CALLOUT);
        deleteLocation(props.location);
    }, [props.location]);

    const buttons: JSX.Element[] = React.useMemo(() => {
        const result: JSX.Element[] = [];
        if (props.location) {
            result.push(
                <ActionButton
                    onClick={handleEdit}
                    iconProps={{ iconName: 'Edit' }}
                >
                    Edit
                </ActionButton>
            );
            result.push(
                <ActionButton
                    onClick={handleDelete}
                    iconProps={{ iconName: 'Delete' }}
                >
                    Delete
                </ActionButton>
            );
        } else {
            result.push(
                <ActionButton
                    onClick={handleAdd}
                    iconProps={{ iconName: 'Add' }}
                >
                    Add
                </ActionButton>
            );
        }
        return result;
    }, [props.location]);

    return <Stack className={styles.callout}>{buttons}</Stack>;
};

export const LocationCell: React.FC<ILocationCellProps> = (props) => {
    const cellRef = React.useRef(null);
    const content = React.useMemo(() => {
        if (!props.location) return 'N/A';
        return props.location?.DoneBy.join('/');
    }, [props.location]);

    const handleContextMenu: React.MouseEventHandler<HTMLElement> =
        React.useCallback((ev) => {
            ev.preventDefault();
        }, []);

    const handleKeyPress: React.KeyboardEventHandler<HTMLElement> =
        React.useCallback(
            (ev) => {
                if (ev.key.toLowerCase() === 'c' && ev.ctrlKey) {
                    copyLocation(props.location || 'empty');
                } else if (ev.key.toLowerCase() === 'v' && ev.ctrlKey) {
                    pasteLocation({
                        processId: props.processId,
                        title: props.title,
                    });
                }
            },
            [props.location, props.processId]
        );

    const handleClick = React.useCallback(() => {
        showCallout({
            id: MAIN_CALLOUT,
            calloutProps: {
                target: cellRef,
            },
            content: (
                <LocationCallout
                    {...props}
                />
            ),
        });
    }, [props.location]);

    return (
        <div
            ref={cellRef}
            className={styles.container}
            tabIndex={0}
            onContextMenu={handleContextMenu}
            onClick={handleClick}
            onKeyDown={handleKeyPress}
        >
            {content}
        </div>
    );
};
