import * as React from 'react';
import { Item } from '../../item';
import { ItemTemplate } from '../ItemTemplate';
import styles from './SingleColumnLayout.module.scss';

export interface ILayoutProps {
    items: Item[];
}

export const SingleColumnLayout: React.FC<ILayoutProps> = (props) => {
    return (
        <div className={styles.container}>
            {
                props.items.map((i) => (
                    <ItemTemplate item={i} key={i.Id} />
                ))
            }
        </div>
    );
};
