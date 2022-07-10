import { Persona, PersonaSize, IconButton, DirectionalHint, PanelType } from 'office-ui-fabric-react';
import * as React from 'react';
import { createPanel } from '../../../hooks/usePanel';
import GlobalContext from '../../../utils/GlobalContext';
import styles from './TaskPersona.module.scss';

export interface ITaskPerson extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    email: string;
    isHovering: boolean;
}

export const TaskPersona: React.FC<ITaskPerson> = (props): JSX.Element => {
    const { canEditOthers } = React.useContext(GlobalContext);

    const outerClass = React.useMemo(() => {
        var result = `${styles['Task__persona']} ${styles['Task__persona_size_sm']}`;
        if (props.isHovering && canEditOthers)
            result += ` ${styles['Task__persona_theme_primary']}`;
        return result;
    }, [props.isHovering, canEditOthers]);

    const editButtonMenuItems = React.useMemo(
        () => [
            {
                key: 'editTask',
                text: 'Edit task (all)',
                onClick: () =>
                    createPanel('SP_TASKS', {
                        isOpen: true,
                        isLightDismiss: true,
                        PanelContents: <div>Edit task</div>,
                    }),
            },
            {
                key: 'editTaskLog',
                text: 'Edit task (today only)',
                onClick: () =>
                    createPanel('SP_TASKS', {
                        isOpen: true,
                        isLightDismiss: true,
                        PanelContents: <div>Edit task log</div>,
                        type: PanelType.large,
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
                    className={styles['Task__edit-icon_size_sm']}
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
