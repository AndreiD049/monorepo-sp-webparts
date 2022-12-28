import { ActionButton } from 'office-ui-fabric-react';
import * as React from 'react';
import { ISectionProps } from '../../components/Section';
import { copyLayoutsToClipboard } from '../../hooks/useLayout';
import styles from './DevSection.module.scss';

export interface IDevSectionProps extends ISectionProps {
    // Props go here
}

export const DevSection: React.FC<IDevSectionProps> = () => {
    return (
        <div className={styles.container}>
            <ActionButton iconProps={{ iconName: 'ClipboardList' }} onClick={() => copyLayoutsToClipboard()}>Copy layouts</ActionButton>
        </div>
    );
};
