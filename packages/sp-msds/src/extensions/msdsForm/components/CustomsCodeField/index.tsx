import {
    Icon,
    IMaskedTextFieldProps,
    Label,
    MaskedTextField,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { Controller } from 'react-hook-form';
import { IMSDSRequest } from '../../services/IMSDSRequest';
import { MSDSFormProps } from '../MSDSTextField';
import styles from './CustomsCodeField.module.scss';

export interface ICustomsCodeFieldProps extends MSDSFormProps {
    id: keyof IMSDSRequest;
    label: string;
    title?: string;
    fieldProps?: IMaskedTextFieldProps;
    style?: React.CSSProperties;
}

export const CustomsCodeField: React.FC<ICustomsCodeFieldProps> = (props) => {
    return (
        <div title={props.title} className={styles.container} style={props.style}>
            <Label htmlFor={props.id} required={Boolean(props.rules?.required)}>
                <Icon iconName="NumberField" style={{ marginRight: '.3em' }} />{' '}
                <span>{props.label}</span>
            </Label>
            <Controller 
                name={props.id}
                control={props.control}
                rules={props.rules}
                render={({ field, fieldState }) => (
                    <MaskedTextField
                        id={props.id}
                        {...props.fieldProps}
                        {...field}
                        disabled={props.rules?.disabled}
                        onChange={(ev, value) => field.onChange(value.replace('_', ''))}
                        errorMessage={fieldState.error && fieldState.error.message}
                    />
                )}
            />
        </div>
    );
};
