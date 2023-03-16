import * as React from 'react';
import { IListOption } from '../OptionList';
import styles from './FilterOpDisplay.module.scss';

export interface IFilterOpDisplayProps {
    operator: string;
}

export const FilterOpDisplay: React.FC<IFilterOpDisplayProps> = ({ operator }) => {
    const value = React.useMemo(() => {
        switch (operator) {
            case '$eq':
                return '= Equal'
            case '$ne':
                return '!= Not equal'
            case '$and':
                return '&& And'
            case '$or':
                return '|| Or'
            default:
                return operator
        }
    }, []);

    return (
        <div className={styles.container}>{value}</div>
    );
};

export function makeFilterOpListOption(filterOp: string): IListOption {
    const result: IListOption = {
        key: filterOp,
        text: filterOp,
        display: <FilterOpDisplay operator={filterOp} />
    }
    return result;
}
