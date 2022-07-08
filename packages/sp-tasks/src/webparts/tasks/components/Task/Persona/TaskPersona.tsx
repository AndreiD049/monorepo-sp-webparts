import { Persona, PersonaSize, IconButton } from 'office-ui-fabric-react';
import * as React from 'react';
import './TaskPersona.scss';

export interface ITaskPerson extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    email: string;
}

export const TaskPersona: React.FC<ITaskPerson> = (props): JSX.Element => {
    return (
        <div className="Task__persona Task__persona_size_sm">
            <Persona
                data-testid="task-person"
                className={props.className}
                text={props.title}
                size={PersonaSize.size24}
                title={props.email}
                hidePersonaDetails
            />
            <div className="Task__edit-button Task__edit-button_hidden">
                <IconButton
                    iconProps={{ iconName: 'MoreVertical' }}
                    className="Task__edit-icon_size_sm"
                />
            </div>
        </div>
    );
};
