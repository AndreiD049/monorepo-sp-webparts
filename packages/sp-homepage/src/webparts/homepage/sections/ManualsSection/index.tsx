import * as React from 'react';
import { ISectionProps } from '../../components/Section';
import styles from './ManualsSection.module.scss';

export interface IManualsSectionProps extends ISectionProps {
    // Props go here
}

export const ManualsSection: React.FC<IManualsSectionProps> = (props) => {
    return (
        <div className={styles.container}>ManualsSection</div>
    );
};
