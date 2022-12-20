import * as React from 'react';
import ISection from '../../models/ISection';
import { AppraisalsSection } from '../../sections/AppraisalsSection';
import { CalendarSection } from '../../sections/CalendarSection';
import { CipSection } from '../../sections/CipSection';
import { TaskSection } from '../../sections/TaskSection';
import { UserInfo } from '../UserInfo';

export interface ISectionFactoryProps {
    section: ISection;
}

export const SectionFactory: React.FC<ISectionFactoryProps> = (props) => {
    switch (props.section.name) {
        case 'Appraisals':
            return (<AppraisalsSection section={props.section} />);
        case "Tasks":
            return (<TaskSection section={props.section} />);
        case "Cip":
            return (<CipSection section={props.section} />);
        case 'UserInfo':
            return (<UserInfo />);
        case 'Calendar':
            return (<CalendarSection section={props.section} />);
        default:
            return <div>NA</div>
    }
};
