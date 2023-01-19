import {
    Icon,
    ITextFieldProps,
    Label,
    TextField,
} from 'office-ui-fabric-react';
import * as React from 'react';
import styles from './MSDSTextField.module.scss';

export interface IMSDSTextFieldProps {
    id: string;
    label: string;
    title?: string;
    value: string;
    fieldProps?: ITextFieldProps;
    style?: React.CSSProperties;
}

export const MSDSTextField: React.FC<IMSDSTextFieldProps> = (props) => {
    return (
        <div title={props.title} className={styles.container} style={props.style}>
            <Label htmlFor={props.id}>
                <Icon iconName="TextField" style={{ marginRight: '.3em' }} />{' '}
                <span>{props.label}</span>
            </Label>
            <TextField id={props.id} {...props.fieldProps} value={props.value} />
        </div>
    );
};
