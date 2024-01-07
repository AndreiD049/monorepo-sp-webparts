import { Persona, PersonaSize } from '@fluentui/react';
import * as React from 'react';
import styles from './TaskPersona.module.scss';

export interface ITaskPersona extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    email: string;
}

export const TaskPersona: React.FC<ITaskPersona> = (props): JSX.Element => {
    return (
        <div className={`${styles['Task__persona']} ${styles['Task__persona_size_sm']}`}>
            <Persona
                className={props.className}
                text={props.title}
                size={PersonaSize.size24}
                title={props.email}
                hidePersonaDetails
            />
        </div>
    );
};
