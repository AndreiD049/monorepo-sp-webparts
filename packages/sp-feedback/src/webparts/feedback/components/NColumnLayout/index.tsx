import * as React from 'react';
import { listToColumnSplitter } from '../../utils';
import { ItemTemplate } from '../ItemTemplate';
import { ILayoutProps } from '../SingleColumnLayout';
import styles from './NColumnLayout.module.scss';

export interface INColumnLayoutProps extends ILayoutProps {
    cols: number;
}

export const NColumnLayout: React.FC<INColumnLayoutProps> = (props) => {
    const columns = React.useMemo(
        () => listToColumnSplitter(props.items, props.cols),
        [props.items]
    );

    return (
        <div className={styles.container}>
            {columns.map((items, idx) => (
                <div key={idx} className={styles.column}>
                    {items.map((item) => (
                        <ItemTemplate item={item} key={item.ID} />
                    ))}
                </div>
            ))}
        </div>
    );
};
