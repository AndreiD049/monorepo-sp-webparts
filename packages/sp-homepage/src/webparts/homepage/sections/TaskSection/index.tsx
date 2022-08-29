import * as React from 'react';
import { ISectionProps } from '../../components/Section';
import styles from './TaskSection.module.scss';

export interface ITaskSectionProps extends ISectionProps {
    // Props go here
}

export const TaskSection: React.FC<ITaskSectionProps> = (props) => {
    return (
        <div className={styles.container}>TaskSection</div>
    );
};
