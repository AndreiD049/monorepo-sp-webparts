import * as React from 'react';
import { ISectionProps } from '../../components/Section';
import { PriorityCell } from 'sp-components';
import { ITaskOverview }  from '@service/sp-cip/dist/models/ITaskOverview';
import styles from './CipSection.module.scss';

export interface ICipSectionProps extends ISectionProps {
    // Props go here
}

const testTask: ITaskOverview = {
    Id: 1,
    Title: "Test task",
    DueDate: "2022-10-11T10:11:00",
    Priority: "Medium",
    Status: "Open",
    Description: 'test',
    Responsible: {
        Id: 1,
        Title: 'Andrei Test',
        EMail: 'Another test',
    },
    Team: 'BSG',
    Progress: 0.5,
    Category: 'EDI',
    FinishDate: null,
    EstimatedTime: 10,
    EffectiveTime: 5,
    ParentId: null,
    Subtasks: 0,
    FinishedSubtasks: 0,
}

export const CipSection: React.FC<ICipSectionProps> = (props) => {
    return (
        <div className={styles.container}>
            <PriorityCell 
                task={testTask}
            />
        </div>
    );
};
