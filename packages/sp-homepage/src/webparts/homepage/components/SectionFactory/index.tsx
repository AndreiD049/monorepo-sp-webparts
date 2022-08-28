import * as React from 'react';
import ISection from '../../models/ISection';
import { AppraisalsSection } from '../AppraisalsSection';
import { UserInfo } from '../UserInfo';

export interface ISectionFactoryProps {
    section: ISection;
}

export const SectionFactory: React.FC<ISectionFactoryProps> = (props) => {
    if (props.section.name === 'Appraisals') {
        return (<AppraisalsSection section={props.section} />);
    }
    if (props.section.name === 'UserInfo') {
        return (<UserInfo />);
    }
    return null;
};
