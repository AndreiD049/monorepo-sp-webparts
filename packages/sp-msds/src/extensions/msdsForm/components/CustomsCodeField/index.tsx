import {
    Icon,
    IMaskedTextFieldProps,
    Label,
    MaskedTextField,
} from 'office-ui-fabric-react';
import * as React from 'react';
import styles from './CustomsCodeField.module.scss';

export interface ICustomsCodeFieldProps {
    id: string;
    label: string;
    title?: string;
    fieldProps?: IMaskedTextFieldProps;
    value: string;
    style?: React.CSSProperties;
}

export const CustomsCodeField: React.FC<ICustomsCodeFieldProps> = (props) => {
    return (
        <div title={props.title} className={styles.container} style={props.style}>
            <Label htmlFor={props.id}>
                <Icon iconName="NumberField" style={{ marginRight: '.3em' }} />{' '}
                <span>{props.label}</span>
            </Label>
            <MaskedTextField
                id={props.id}
                {...props.fieldProps}
                value={props.value}
            />
        </div>
    );
};
