import * as React from 'react';
import { ISectionProps } from '../../components/Section';
import styles from './CipSection.module.scss';

export interface ICipSectionProps extends ISectionProps {
    // Props go here
}

export const CipSection: React.FC<ICipSectionProps> = (props) => {
    return (
        <div className={styles.container}>CipSection</div>
    );
};
