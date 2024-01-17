import { Icon, Text } from '@fluentui/react';
import * as React from 'react';
import styles from './Collapsible.module.scss';

export interface ICollapsibleProps {
    headerText: string;
    isOpen: boolean;
    onToggle: () => void;
}

export function handleToggle<T>(field: keyof T, setState: React.Dispatch<React.SetStateAction<T>>): void {
    setState((prev) => ({
        ...prev,
        [field]: !prev[field],
    }));
}

const More: React.FC<{ onClick: () => void }> = (props) => {
    return <div className={styles.more} role="button" onClick={props.onClick}>Unhide...</div>
}

export const Collapsible: React.FC<ICollapsibleProps> = (props) => {
    return (
        <div className={styles.container}>
            <Text className={styles.headerText} block variant="xLargePlus" onClick={props.onToggle}>
                <span>{props.headerText}</span>
                <Icon className={styles.headerCollapseIcon} iconName={props.isOpen ? 'ChevronDown' : 'ChevronRight'} />
            </Text>
            {props.isOpen ? props.children : <More onClick={props.onToggle} />}
        </div>
    );
};
