import { Persona, PersonaSize, IconButton, DirectionalHint, PanelType } from '@fluentui/react';
import * as React from 'react';
import { createPanel } from '../../../hooks/usePanel';
import GlobalContext from '../../../utils/GlobalContext';
import styles from './TaskPersona.module.scss';
import colors from './../Colors.module.scss';
import { AddRemark } from '../../panels/AddRemark';
import { EditTasks } from '../../panels/EditTasks';

export interface ITaskPersona extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    email: string;
    isHovering: boolean;
    taskId: number;
    taskLogId: number;
    date: Date;
    status: string;
}

export const TaskPersona: React.FC<ITaskPersona> = (props): JSX.Element => {
    const { canEditOthers } = React.useContext(GlobalContext);

    const outerClass = React.useMemo(() => {
        let result = `${styles['Task__persona']} ${styles['Task__persona_size_sm']}`;
        if (props.isHovering && canEditOthers)
            result += ` ${styles['Task__persona_theme_primary']}`;
        return result;
    }, [props.isHovering, canEditOthers]);

    const editButtonMenuItems = React.useMemo(
        () => [
            {
                key: 'addRemark',
                text: 'Add remark',
                onClick: () => {
                    createPanel('SP_TASKS', {
                        isOpen: true,
                        isLightDismiss: true,
                        headerText: 'Add remark',
                        allowTouchBodyScroll: true,
                        type: PanelType.smallFixedFar,
                        PanelContents: <AddRemark taskId={props.taskId} taskLogId={props.taskLogId} date={props.date} />,
                    });
                },
            },
            {
                key: 'editTask',
                text: 'Edit task',
                onClick: () =>
                    createPanel('SP_TASKS', {
                        isOpen: true,
                        isLightDismiss: true,
                        headerText: 'Edit task',
                        allowTouchBodyScroll: true,
                        type: PanelType.large,
                        PanelContents: <EditTasks taskId={props.taskId} />,
                    }),
            },
        ],
        []
    );

    const editButton = React.useMemo(() => {
        if (!canEditOthers) return null;
        return (
            <div
                className={`${styles['Task__edit-button']} ${
                    !props.isHovering && styles['Task__edit-button_hidden']
                }`}
            >
                <IconButton
                    tabIndex={-1}
                    iconProps={{ iconName: 'MoreVertical' }}
                    className={`${styles['Task__edit-icon_size_sm']} ${
                        colors[`button_status_${props.status.toLowerCase()}` as keyof typeof colors]
                    }`}
                    styles={{
                        menuIcon: {
                            display: 'none',
                        },
                    }}
                    menuProps={{
                        items: editButtonMenuItems,
                        useTargetAsMinWidth: true,
                        directionalHint: DirectionalHint.bottomAutoEdge,
                        gapSpace: 4,
                    }}
                />
            </div>
        );
    }, [props.isHovering, canEditOthers]);

    return (
        <div className={outerClass}>
            <Persona
                className={props.className}
                text={props.title}
                size={PersonaSize.size24}
                title={props.email}
                hidePersonaDetails
            />
            {editButton}
        </div>
    );
};
