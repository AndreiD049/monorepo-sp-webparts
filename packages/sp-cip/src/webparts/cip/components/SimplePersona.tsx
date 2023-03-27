import * as React from 'react';
import {
    Persona,
    PersonaSize,
    IPersonaProps,
} from 'office-ui-fabric-react/lib/Persona';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';

export interface ISimplePersonaProps {
    task: ITaskOverview;
    size?: PersonaSize;
    personaProps?: IPersonaProps;
}

export const SimplePersona: React.FC<ISimplePersonaProps> = (props) => {
    return (
        <Persona
            text={props.task.Responsible.Title}
            size={props.size || PersonaSize.size32}
            imageUrl={`/_layouts/15/userphoto.aspx?AccountName=${props.task.Responsible.EMail}&Size=M`}
            title={props.task.Responsible.Title}
            {...props.personaProps}
        />
    );
};
