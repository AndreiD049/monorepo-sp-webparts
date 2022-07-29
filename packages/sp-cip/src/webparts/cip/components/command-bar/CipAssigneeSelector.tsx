import { IconButton } from 'office-ui-fabric-react';
import * as React from 'react';
import useWebStorage from 'use-web-storage-api';
import styles from './CommandBar.module.scss';

export enum AssigneeSelected {
    Single,
    All,
    None,
}

interface ICipAssigneeSelectorProps {
    onAssignedToChange: (val: AssigneeSelected) => void;
}

/**
 * If target is equal to value, return the appropriate classname, else, return empty string
 */
function isSelectedClassName(
    target: AssigneeSelected,
    value: AssigneeSelected
) {
    if (target === value) {
        return styles['asignee-selector__item_selected'];
    }
    return '';
}

export const CipAssigneeSelector: React.FC<ICipAssigneeSelectorProps> = (props) => {
    const [selected, setSelected] = useWebStorage<AssigneeSelected>(
        AssigneeSelected.Single,
        { key: 'sp-cip-assigned-to' }
    );

    React.useEffect(() => {
        props.onAssignedToChange(selected);
    }, [selected]);

    const handleClick = (value: AssigneeSelected) => () => {
        setSelected(value);
    };

    return (
        <div className={styles['asignee-selector']}>
            <IconButton
                className={`${
                    styles['asignee-selector__item']
                } ${isSelectedClassName(AssigneeSelected.Single, selected)}`}
                iconProps={{ iconName: 'Contact' }}
                onClick={handleClick(AssigneeSelected.Single)}
                title="Assigned to me"
            />
            <IconButton
                className={`${styles['asignee-selector__item']} ${
                    styles['assignee-selector__separator']
                } ${isSelectedClassName(AssigneeSelected.All, selected)}`}
                iconProps={{ iconName: 'People' }}
                onClick={handleClick(AssigneeSelected.All)}
                title="Assigned to anyone"
            />
        </div>
    );
};