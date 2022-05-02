import * as React from 'react';
import styles from './Cip.module.scss';

const ParentStroke: React.FC<{ parentId: number }> = ({
    parentId,
}) => {
    if (!parentId) {
        return null;
    }
    return (
        <svg className={styles['parent-stroke']}>
            <path d="M0 0 l0 40 l25 0"/>
        </svg>
    );
};

export default ParentStroke;
