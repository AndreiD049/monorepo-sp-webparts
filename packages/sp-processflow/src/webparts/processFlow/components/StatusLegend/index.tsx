import { Icon, Separator, Text } from '@fluentui/react';
import * as React from 'react';
import cellStyles from '../ProcessFlowTable/UserCell/UserCell.module.scss';
import styles from './StatusLegend.module.scss';

export interface IStatusLegendProps {
    // Props go here
}

export const StatusLegend: React.FC<IStatusLegendProps> = (props) => {
    return (
        <div className={styles.container}>
            <div className={styles.rowLegend}>
                <Icon iconName="Info" />
                <Text variant="medium">Legend</Text>
            </div>
            <Separator styles={{ root: { fontSize: 0 } }} />
            <div className={styles.row}>
                <div
                    className={`sp-processflow-na ${cellStyles.container} ${styles.cell}`}
                >
                    NA
                </div>
                <Text variant="medium">No training planned.</Text>
            </div>
            <div className={styles.row}>
                <div
                    className={`sp-processflow-planned ${cellStyles.container} ${styles.cell}`}
                >
                    Planned
                </div>
                <Text variant="medium">
                    Training planned. No date assigned.
                </Text>
            </div>
            <div className={styles.row}>
                <div
                    className={`sp-processflow-planned ${cellStyles.container} ${styles.cell}`}
                >
                    {'<Date>'}
                </div>
                <Text variant="medium">Training planned on {'<Date>'}.</Text>
            </div>
            <div className={styles.row}>
                <div
                    className={`sp-processflow-on-going ${cellStyles.container} ${styles.cell}`}
                >
                    {'<Date>'}
                </div>
                <Text variant="medium">Training in progress.</Text>
            </div>
            <div className={styles.row}>
                <div
                    className={`sp-processflow-completed ${cellStyles.container} ${styles.cell}`}
                >
                    {'<Date>'}
                </div>
                <Text variant="medium">Training done on {'<Date>'}.</Text>
            </div>
        </div>
    );
};
