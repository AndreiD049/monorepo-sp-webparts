import { Checkbox, Icon, Label, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import styles from './MSDSCheckbox.module.scss';

export interface IMSDSCheckboxProps {
    id: string;
    label: string;
    title?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    style?: React.CSSProperties;
}

export const MSDSCheckbox: React.FC<IMSDSCheckboxProps> = (props) => {
    return (
        <div className={styles.container} title={props.title} style={props.style}>
            <Label htmlFor={props.id}><Icon iconName='TaskManager' style={{ marginRight: '.3em' }} /> <span>{props.label}</span></Label>
            <div className={styles.checkboxRow}>
                <Checkbox id={props.id} checked={props.checked} onChange={(_ev, checked) => props.onChange(checked)} /> 
                <Text variant='medium'>{props.checked ? ' - Yes' : ' - No'}</Text>
            </div>
        </div>
    );
};
