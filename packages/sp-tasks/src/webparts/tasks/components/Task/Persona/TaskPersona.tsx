import {
    Persona,
    PersonaSize,
    IconButton,
    DirectionalHint,
    PanelType,
    PrimaryButton,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { createPanel } from '../../../hooks/usePanel';
import GlobalContext from '../../../utils/GlobalContext';
import { EditTask } from '../panels/EditTask';
import { EditTaskLog } from '../panels/EditTaskLog';
import styles from './TaskPersona.module.scss';
import colors from './../Colors.module.scss';

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
    const { canEditOthers, TaskLogsService, TaskService } = React.useContext(GlobalContext);

    const outerClass = React.useMemo(() => {
        var result = `${styles['Task__persona']} ${styles['Task__persona_size_sm']}`;
        if (props.isHovering && canEditOthers)
            result += ` ${styles['Task__persona_theme_primary']}`;
        return result;
    }, [props.isHovering, canEditOthers]);

    const editButtonMenuItems = React.useMemo(
        () => [
            {
                key: 'editTaskLog',
                text: 'Edit task (current only)',
                onClick: async () => {
                    // If tasklog doesn't exists, create it
                    let id = props.taskLogId;
                    if (id === null) {
                        const task = await TaskService.getTask(props.taskId);
                        const created = await TaskLogsService.createTaskLogFromTask(
                            task,
                            props.date
                        );
                        id = created.ID;
                    }
                    createPanel('SP_TASKS', {
                        isOpen: true,
                        isLightDismiss: true,
                        headerText: 'Edit task',
                        PanelContents: <EditTaskLog taskId={id} />,
                    });
                },
            },
            {
                key: 'editTask',
                text: 'Edit task (new tasks)',
                onClick: () =>
                    createPanel('SP_TASKS', {
                        isOpen: true,
                        isLightDismiss: true,
                        headerText: 'Edit task',
                        PanelContents: <EditTask taskId={props.taskId} />,
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
                        colors[`button_status_${props.status.toLowerCase()}`]
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
